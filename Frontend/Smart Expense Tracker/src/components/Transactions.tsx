import api from "../lib/axiosInstance";
import { Column, type ColumnEditorOptions } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { useEffect, useState, useRef, type FC, type Dispatch, type SetStateAction } from "react";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { TrashIcon } from "lucide-react";
type CategoryProp={
    name:string;
    _id:string;
}
type TranscationType = {
    _id: string | number;
    userId?: string | number;
    amount?: number;
    category?: CategoryProp|null;
    description?: string;
    type?: "income" | "expense";
    date?: string;
    isDelete?: boolean;
};

type TransactionProp={
    transcations:TranscationType[];
    setTranscations:Dispatch<SetStateAction<TranscationType[]>>;

}
const Transcation: FC<TransactionProp> = ({transcations,setTranscations}:TransactionProp) => {
    // const [transcations, setTranscations] = useState<TranscationType[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [yearOptions, setYearOptions] = useState<Array<{ label: string; value: number }>>([]);
    
    const toLocalDatetimeInputValue = (date?: string | Date) => {
        const d = date ? new Date(date) : new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const getMaxDatetimeLocal = () => toLocalDatetimeInputValue();
    const getMinDatetimeLocal = () => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 2);
        return toLocalDatetimeInputValue(d);
    };

    const [addTranscationVisible,setAddTranscationVisible]=useState<boolean>(false);

        const [typedCategory, setTypedCategory] = useState('');
        const [amount, setAmount] = useState<string>("");
        const [selectedCategory, setSelectedCategory] = useState<string>("");
        const [description, setDescription] = useState<string>("");
        const [transactionType, setTransactionType] = useState<"income" | "expense" | "">("");
        const [dateVal, setDateVal] = useState<string>(getMaxDatetimeLocal());
    const [categoryOptions, setCategoryOptions] = useState<Array<{ label: string; value: string }>>([]);
    const amountEditor = (options: ColumnEditorOptions) => (
        <InputText type="number" value={options.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => options.editorCallback!(e.target.value)} className="w-full" />
    );

    const textEditor = (options: ColumnEditorOptions) => (
        <InputText value={options.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => options.editorCallback!(e.target.value)} className="w-full" />
    );

    const categoryEditor = (options: ColumnEditorOptions) => {
        const val = typeof options.value === 'string' ? options.value : options.value?._id ?? '';
        return (
            <Dropdown options={categoryOptions} value={val} onChange={(e:any) => options.editorCallback!(e.value)} optionLabel="label" optionValue="value" className="w-full" />
        );
    };

    const typeEditor = (options: ColumnEditorOptions) => (
        <Dropdown options={[{label:'Income', value:'income'}, {label:'Expense', value:'expense'}]} value={options.value} onChange={(e:any) => options.editorCallback!(e.value)} optionLabel="label" optionValue="value" className="w-full" />
    );

    const dateEditor = (options: ColumnEditorOptions) => {
        const val = options.value ? toLocalDatetimeInputValue(options.value) : '';
        return <InputText type="datetime-local" value={val} onChange={(e: any) => options.editorCallback!(e.target.value)} min={getMinDatetimeLocal()} max={getMaxDatetimeLocal()} className="w-full" />;
    };
    const toast = useRef<Toast | null>(null);
    useEffect(() => {
    
        // const JwtToken = sessionStorage.getItem("jwtToken");
        const userId = sessionStorage.getItem("id");
        if(!userId)
        {
            // window.location.href="/login";
        }
        // axios
        //     .get<TranscationType[]>(
        //         `${import.meta.env.VITE_BACKEND_URL}/api/transcation/${userId}`,
        //         {
        //             headers: {
        //                 Accept: "application/json",
        //                 Authorization: `Bearer ${JwtToken}`,
        //             },
        //         }
        //     )
        //     .then((response) => {
        //         const payload = response.data as any;
        //         console.log(payload.data);
        //         const rows: TranscationType[] = Array.isArray(payload) ? payload : payload?.data ?? [];
        //         setTranscations(rows);
        //         console.log(response);
        //     })
        //     .catch((err) => console.error(err));


        api.get(`/api/category/?userId=${userId}`)
        .then((res) => {
            const cats = res?.data?.data ?? [];
            const opts = cats.map((c: any) => ({ label: c.name, value: c._id }));
            setCategoryOptions(opts);
        })
        .catch((err) => console.error("Category fetch failed", err));

        api.get(`/api/chart/years/${userId}`)
        .then((res) => {
            const yearsData = res?.data?.data ?? [];
            const opts = yearsData.map((y: any) => ({ label: y.year.toString(), value: y.year }));
            setYearOptions(opts);
            if (opts.length > 0) {
                setSelectedYear(opts[0].value);
            }
        })
        .catch((err) => {
            console.error("Years fetch failed", err);
            setYearOptions([]);
        });
    }, []);

    const resetForm = () => {
        setAmount("");
        setSelectedCategory("");
        setDescription("");
        setTransactionType("");
        setDateVal(getMaxDatetimeLocal());
    };

    const handleAddSubmit = async () => {
        try {
            if(!transactionType||!dateVal||!selectedCategory||!Number(amount))
            {
                toast?.current?.show({severity:"error",summary:"Details Not Complete",detail:"Please give all the data"});
                return;
            }
            const userId = sessionStorage.getItem("id");
            // validate date within allowed range (min 2 years ago, max now)
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - 2);
            const maxDate = new Date();
            const enteredDate = new Date(dateVal);
            if (isNaN(enteredDate.getTime()) || enteredDate < minDate || enteredDate > maxDate) {
                toast.current?.show({ severity: 'error', summary: 'Invalid date', detail: 'Date & Time must be within last 2 years and up to now' });
                return;
            }

            const payload = {
                userId,
                amount: Number(amount),
                category: selectedCategory,
                description,
                type: transactionType,
                // convert local datetime-local string to ISO for backend
                date: enteredDate.toISOString(),
            };

            const res = await api.post(`/api/transcation`, payload, {
                headers: {
                    Accept: "application/json"
                },
            });

            if (res.status === 201) {
                const created: any = res.data?.data ?? res.data;

             
                if (!created._id) {
                   
                    created._id = created.id ?? `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                }
                console.log(created);
                setTranscations((prev) => [...prev, created]);
                setAddTranscationVisible(false);
                resetForm();
                toast.current?.show({ severity: "success", summary: "Transaction Added", detail: "Transaction created" });
            }
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: "error", summary: "Failed", detail: String(err) });
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!confirm("Delete this transaction?")) return;
        try {
            await api.delete(`/api/transcation/${id}`).then((response)=>{
                console.log(response);
            })
            setTranscations((prev) => prev.filter((t) => t._id !== id));
        } catch (err) {
            console.error(err);
        }
    };
    const onRowEditComplete = async (e: any) => {
        const { newData, index } = e;
        const updated: any = { ...newData };
        // ensure category is an id string for backend
        if (updated.category && typeof updated.category === 'object') {
            updated.category = updated.category._id ?? updated.category.value ?? '';
        }
        if (updated.date && typeof updated.date === 'string') {
            if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/.test(updated.date)) {
                updated.date = new Date(updated.date).toISOString();
            } else {
                const parsed = new Date(updated.date);
                if (!isNaN(parsed.getTime())) {
                    updated.date = parsed.toISOString();
                }
            }

            // validate updated date within allowed range
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - 2);
            const maxDate = new Date();
            const entered = new Date(updated.date);
            if (isNaN(entered.getTime()) || entered < minDate || entered > maxDate) {
                toast.current?.show({ severity: 'error', summary: 'Invalid date', detail: 'Date must be within last 2 years and up to now' });
                return;
            }
        }

        try {
           ;
            const userId = sessionStorage.getItem('id');
            await api.put(`/api/transcation/${updated._id}`, { ...updated, userId }, {
                headers: { Accept: 'application/json' },
            });

            setTranscations((prev) => {
                const copy = [...prev];
                copy[index] = updated;
                return copy;
            });
            toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Transaction updated' });
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Save failed', detail: String(err) });
        }
    };
    const priceBodyTemplate = (Transaction:TranscationType) => {
        return <p className={`${Transaction.type==="expense"?"text-red-500":'text-green-500'}`}>{formatCurrency(Number(Transaction.amount))}</p>
    };
  const createCategory = async (name: string) => {
    try {
      const { data } = await api.post(`/api/category`, 
        { name, userId: sessionStorage.getItem("id") }
      );
      const created = data?.data ?? data;
      const newOpt = { label: created.name || name, value: created._id || Math.random().toString(36).slice(2) };
      setCategoryOptions((prev) => [newOpt, ...prev]);
      setSelectedCategory(newOpt.value);
      setTypedCategory('');
      toast.current?.show({ severity: 'success', summary: 'Category created', detail: `Created "${newOpt.label}"` });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Category create failed', detail: String(err) });
    }
  };
 const formatCurrency = (value:number) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'INR' });
    };
  const handleCategoryChange = (e: any) => {
    const val = e.value;
    console.log(val);   
    if (typeof val === 'string' && val.startsWith('__add__:')) {
      const name = val.slice('__add__:'.length);
      createCategory(name);
    } else {
      setSelectedCategory(val);
    }
  };
    return (
        <div className="flex flex-col md:flex-col justify-center w-full overflow-x-auto">
            <Toast ref={toast} />
            <Dialog header={"Add Transcation"} visible={addTranscationVisible} onHide={()=>{
                setAddTranscationVisible(false);
            }} className="flex min-w-[60vh]">

                <form className="flex flex-col gap-7 p-5 w-full">
                    <FloatLabel className="w-full">
                        <InputText type="number" value={amount} onChange={(e:any)=>setAmount(e.target.value)} className="w-full"/>
                        <label>Amount</label>
                    </FloatLabel>

                    <div>
                        <label className="block mb-1">Category</label>
                        {
            (() => {
              const base = [...categoryOptions];
              const typed = typedCategory?.trim();
              if (typed) {
                const exists = base.some(o => (o.label ?? '').toLowerCase() === typed.toLowerCase());
                if (!exists) base.unshift({ label: `Add "${typed}"`, value: `__add__:${typed}` });
              }
              return (
                <Dropdown
                  options={base}
                  filter
                  showClear
                  optionLabel="label"
                  optionValue="value"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  onFilter={(e: any) => setTypedCategory(e.filter ?? e.query ?? (e.originalEvent?.target as any)?.value ?? '')}
                  placeholder="Select a Category"
                  className="w-full"
                />
              );
            })()
          }
                        {/* <Dropdown options={categoryOptions} optionLabel="label" optionValue="value" value={selectedCategory} onChange={(e:any)=>setSelectedCategory(e.value)} placeholder="Select category" className="w-full" /> */}
                    </div>

                    <FloatLabel className="w-full">
                        <InputText value={description} onChange={(e:any)=>setDescription(e.target.value)} className="w-full" />
                        <label>Description</label>
                    </FloatLabel>

                    <div>
                        <label className="block mb-1">Type</label>
                        <Dropdown options={[{label:'Income', value:'income'}, {label:'Expense', value:'expense'}]} value={transactionType} onChange={(e:any)=>setTransactionType(e.value)} optionLabel="label" optionValue="value" placeholder="Select type" className="w-full" />
                    </div>

                        <FloatLabel className="w-full">
                            <InputText type="datetime-local" value={dateVal} onChange={(e:any)=>setDateVal(e.target.value)} min={getMinDatetimeLocal()} max={getMaxDatetimeLocal()} className="w-full" />
                            <label>Date & Time</label>
                        </FloatLabel>

                    <div className="flex justify-end gap-2">
                        <Button label="Cancel" className="p-button-secondary" onClick={()=>{ setAddTranscationVisible(false); resetForm(); }} />
                        <Button label="Add" onClick={(e:any)=>{ e.preventDefault(); handleAddSubmit(); }} />
                    </div>
                </form>
            </Dialog>
            <div className="flex md:items-end justify-end p-2 mdp-4">
                <button className="bg-indigo-500 p-2 text-white rounded-lg dark:border dark:border-white" onClick={()=>setAddTranscationVisible(true)}>Add Transcation</button>
            </div>
            <DataTable removableSort paginator rows={5} value={transcations} stripedRows editMode="row" dataKey="_id" className="w-full border border-black dark:border dark:border-white" onRowEditComplete={onRowEditComplete}>
                <Column field="amount" header="Amount" editor={amountEditor}  body={priceBodyTemplate}/>
                <Column
                    field="category"
                 
                    header="Category"
                    editor={categoryEditor}
                    body={(row: any) => {
                        const cat = row.category;
                        if (!cat) return "";
                        if (typeof cat === "string") {
                          
                            const opt = categoryOptions.find((o) => o.value === cat);
                            return opt?.label ?? cat;
                        }
                        return cat?.name ?? cat?._id ?? "";
                    }}
                />
                <Column field="description" header="Description" editor={textEditor} />
                <Column
                    sortable
                    field="type"
                    header="Type"
                    editor={typeEditor}
                    body={(row: TranscationType) => (
                        <span className={row.type === "income" ? "text-green-600" : "text-red-600"}>{row.type?.toUpperCase()}</span>
                    )}
                />
                <Column field="date" header="Date" editor={dateEditor} sortable body={(row: TranscationType) => (row.date ? new Date(row.date).toLocaleString(): "")} />
                <Column rowEditor header="Edit" style={{ width: '8rem' }} />
                <Column
                    header="Actions"
                    body={(row: TranscationType) => (
                        <button  onClick={() => handleDelete(row._id)}><TrashIcon/></button>
                    )}
                ></Column>
            </DataTable>
        </div>
    );
};

export default Transcation;