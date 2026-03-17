import { TrashIcon, Plus, Calendar, DollarSign } from "lucide-react";
import { Column, type ColumnEditorOptions } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { useEffect, useRef, useState, type FC } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import {Toast} from "primereact/toast";
import api from "../lib/axiosInstance";
import { Card } from "primereact/card";
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
const Transcation:FC=()=>
{
       const [addTranscationVisible,setAddTranscationVisible]=useState<boolean>(false);
    
            const [typedCategory, setTypedCategory] = useState('');
            const [amount, setAmount] = useState<string>("");
            const [selectedCategory, setSelectedCategory] = useState<string>("");
            const [description, setDescription] = useState<string>("");
            const [transactionType, setTransactionType] = useState<"income" | "expense" | "">("");
            const [dateVal, setDateVal] = useState<string>(new Date().toISOString().slice(0,10));
        const [categoryOptions, setCategoryOptions] = useState<Array<{ label: string; value: string }>>([]);
        const [transactions,setTranscation]=useState<TranscationType[]>([]);
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
        const val = options.value ? new Date(options.value).toISOString().slice(0,10) : '';
        return <InputText type="date" value={val} onChange={(e: any) => options.editorCallback!(e.target.value)} className="w-full" />;
    };
    const toast = useRef<Toast | null>(null);
    useEffect(() => {
    
        // const JwtToken = sessionStorage.getItem("jwtToken");
        const userId = sessionStorage.getItem("id");
        if(!userId)
        {
            window.location.href="/login";
        }
        api
            .get<TranscationType[]>(
                `/api/transcation/all/${userId}`,
                {
                    headers: {
                        Accept: "application/json"
                    },
                }
            )
            .then((response) => {
                const payload = response.data as any;
                console.log(payload.data);
                const rows: TranscationType[] = Array.isArray(payload) ? payload : payload?.data ?? [];
                setTranscation(rows);
                console.log(response);
            })
            .catch((err) => console.error(err));


        api.get(`/api/category/?userId=${userId}`)
        .then((res) => {
            const cats = res?.data?.data ?? [];
            const opts = cats.map((c: any) => ({ label: c.name, value: c._id }));
            setCategoryOptions(opts);
        })
        .catch((err) => console.error("Category fetch failed", err));
    }, []);

    const resetForm = () => {
        setAmount("");
        setSelectedCategory("");
        setDescription("");
        setTransactionType("");
        setDateVal(new Date().toISOString().slice(0,10));
    };

    const handleAddSubmit = async () => {
        try {
            const userId = sessionStorage.getItem("id");
            const payload = {
                userId,
                amount: Number(amount),
                category: selectedCategory,
                description,
                type: transactionType,
                date: dateVal,
            };

            const res = await api.post(`/api/transcation`, payload, {
                headers: {
                    Accept: "application/json"
                },
            });

            if (res.status === 201) {
                const created = res.data?.data ?? res.data;
                
                setTranscation((prev) => [ ...prev,created]);
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
            setTranscation((prev) => prev.filter((t) => t._id !== id));
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
        // normalize date to ISO
        if (updated.date && typeof updated.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(updated.date)) {
            updated.date = new Date(updated.date).toISOString();
        }

        try {
            // const JwtToken = sessionStorage.getItem('jwtToken');
            const userId = sessionStorage.getItem('id');
            await api.put(`/api/transcation/${updated._id}`, { ...updated, userId }, {
                headers: { Accept: 'application/json' },
            });

            setTranscation((prev) => {
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
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
            <Toast ref={toast} />
            
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 mt-7 lg:mt-2">
                        <div className="bg-indigo-500 p-3 rounded-lg">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            Transactions
                        </h1>
                    </div>
                    <button 
                        onClick={() => setAddTranscationVisible(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden md:inline">Add Transaction</span>
                        <span className="md:hidden">Add</span>
                    </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Manage and track all your income and expenses</p>
            </div>

            <Dialog 
                header={
                    <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-500" />
                        <span>Add New Transaction</span>
                    </div>
                } 
                visible={addTranscationVisible} 
                onHide={() => {
                    setAddTranscationVisible(false);
                    resetForm();
                }} 
                className="min-w-[90vw] md:min-w-[60vw]"
                modal
            >
                <form className="flex flex-col gap-6 p-2">
                    <FloatLabel className="w-full">
                        <InputText 
                            type="number" 
                            value={amount} 
                            onChange={(e: any) => setAmount(e.target.value)} 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="0.00"
                        />
                        <label className="text-gray-700 dark:text-gray-300">Amount</label>
                    </FloatLabel>

                    <div>
                        <label className="block mb-2 text-gray-700 dark:text-gray-300 font-semibold">Category</label>
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
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                                    />
                                );
                            })()
                        }
                    </div>

                    <FloatLabel className="w-full">
                        <InputText 
                            value={description} 
                            onChange={(e: any) => setDescription(e.target.value)} 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter description..."
                        />
                        <label className="text-gray-700 dark:text-gray-300">Description</label>
                    </FloatLabel>

                    <div>
                        <label className="block mb-2 text-gray-700 dark:text-gray-300 font-semibold">Type</label>
                        <Dropdown 
                            options={[
                                { label: '💰 Income', value: 'income' }, 
                                { label: '💸 Expense', value: 'expense' }
                            ]} 
                            value={transactionType} 
                            onChange={(e: any) => setTransactionType(e.value)} 
                            optionLabel="label" 
                            optionValue="value" 
                            placeholder="Select type" 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                    </div>

                    <FloatLabel className="w-full">
                        <InputText 
                            type="date" 
                            value={dateVal} 
                            onChange={(e: any) => setDateVal(e.target.value)} 
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <label className="text-gray-700 dark:text-gray-300">Date</label>
                    </FloatLabel>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button 
                            label="Cancel" 
                            className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold transition-all"
                            onClick={() => { 
                                setAddTranscationVisible(false); 
                                resetForm(); 
                            }} 
                        />
                        <Button 
                            label="Add Transaction" 
                            className="px-6 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 font-semibold transition-all shadow-lg"
                            onClick={(e: any) => { 
                                e.preventDefault(); 
                                handleAddSubmit(); 
                            }} 
                        />
                    </div>
                </form>
            </Dialog>

            {/* Transactions Table */}
            <Card className="shadow-lg rounded-xl overflow-hidden border-0">
                <DataTable 
                    paginator 
                    rows={10}
                    rowsPerPageOptions={[5, 10, 20]}
                    value={transactions} 
                    stripedRows 
                    removableSort
                    editMode="row" 
                    dataKey="_id" 
                    className="w-full"
                    tableStyle={{ minWidth: '50rem' }}
                    emptyMessage={
                        <div className="py-8 text-center text-gray-500">
                            <p className="text-lg">No transactions found</p>
                            <p className="text-sm">Add your first transaction to get started</p>
                        </div>
                    }
                    onRowEditComplete={onRowEditComplete}
                    responsiveLayout="scroll"
                >
                    <Column 
                        field="amount" 
                        header="Amount" 
                        editor={amountEditor}  
                        body={priceBodyTemplate}
                        style={{ width: '12%' }}
                        sortable
                    />
                    <Column
                        field="category"
                        header="Category"
                        editor={categoryEditor}
                        style={{ width: '15%' }}
                        body={(row: any) => {
                            const cat = row.category;
                            if (!cat) return <span className="text-gray-400">-</span>;
                            if (typeof cat === "string") {
                                const opt = categoryOptions.find((o) => o.value === cat);
                                return <span className="font-medium">{opt?.label ?? cat}</span>;
                            }
                            return <span className="font-medium">{cat?.name ?? cat?._id ?? "-"}</span>;
                        }}
                    />
                    <Column 
                        field="description" 
                        header="Description" 
                        editor={textEditor}
                        style={{ width: '25%' }}
                        body={(row: any) => <span className="text-gray-700 dark:text-gray-300">{row.description || '-'}</span>}
                    />
                    <Column
                        field="type"
                        header="Type"
                        sortable
                        editor={typeEditor}
                        style={{ width: '12%' }}
                        body={(row: TranscationType) => (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                row.type === "income" 
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" 
                                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                            }`}>
                                {row.type === "income" ? "💰 Income" : "💸 Expense"}
                            </span>
                        )}
                    />
                    <Column 
                        field="date" 
                        header="Date" 
                        editor={dateEditor} 
                        sortable
                        style={{ width: '15%' }}
                        body={(row: TranscationType) => (
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                {row.date ? new Date(row.date).toLocaleDateString() : "-"}
                            </span>
                        )} 
                    />
                    <Column 
                        rowEditor 
                        header="Edit" 
                        style={{ width: '8%' }} 
                    />
                    <Column
                        header="Delete"
                        style={{ width: '8%' }}
                        body={(row: TranscationType) => (
                            <button  
                                onClick={() => handleDelete(row._id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all"
                                title="Delete transaction"
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        )}
                    ></Column>
                </DataTable>
            </Card>
        </div>
    );
};
export default Transcation;