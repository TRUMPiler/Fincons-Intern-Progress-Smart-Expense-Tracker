import api from "../lib/axiosInstance";
import { useEffect, useRef, useState, type FC } from "react";
import { ProgressBar } from "primereact/progressbar";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { InputSwitch } from "primereact/inputswitch";
import { ProgressSpinner } from "primereact/progressspinner";


type BudgetProp = {
  _id: string;
  categoryId?: string;
  categoryName?: string;
  month: number;
  year: number;
  limit: number;
  spent?: number;
  remaining?: number;
  isRecurring:boolean;
};
type CategoryOption = { label: string; value: string; };
type MonthOptions = { label: string; value: number; };

type month={month:number,year:number};

const Budget: FC = () => {
  const [budgetDialogVisible, setBudgetDialogVisible] = useState(false);
    const [budgetUpdateDialogVisible, setUpdateBudgetDialogVisible] = useState(false);
    const [filterDates,setFilterDates]=useState<month[]>([]);
   const Months: string[] = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const [filterMonth,setFilterMonth]=useState<number>(0)
    const [monthOption,setMonthOptions]=useState<MonthOptions[]>([]);
    const [filterYear,setFilterYear]=useState<number>(0)
    const [isInitialized, setIsInitialized] = useState(false);
  const toast = useRef<Toast | null>(null);
  const [budgets, setBudgets] = useState<BudgetProp[]>([]);
  const [loading, setLoading] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [limit, setLimit] = useState<number>(1);
  const [isRecurring,setisRecurring]=useState<boolean>(false);
 
  const [budgetCategoryOptions, setBudgetCategoryOptions] = useState<CategoryOption[]>([]);
  const [typedCategory, setTypedCategory] = useState('');
  const[budgetId,setBudgetId]=useState<string>('');
  
  const getCategoryId = (cat: any) => typeof cat === "string" ? cat : cat?._id ?? cat?.id ?? "";
  const getCategoryName = (cat: any) => typeof cat === "object" && cat ? cat.name ?? cat.label : "";
  
  useEffect(() => {
    const userid = sessionStorage.getItem("id");
    if (!userid){
      window.location.href='/login';
    }
    setLoading(true);
    api
      .get(`/api/budget/?userId=${userid}&month=${filterMonth}&year=${filterYear}`)
      .then((response) => {
        if (response?.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          const fetchedBudgets = response.data.data;
          console.log(response);
          Promise.all(
            fetchedBudgets.map(async (budget: any) => {
              const categoryId = getCategoryId(budget.categoryId);
              const categoryName = getCategoryName(budget.categoryId) || budget.categoryName;
              try {
                const month=filterMonth==0?budget.month+1:filterMonth+1
                const year=filterYear==0?budget.year:filterYear;
                const { data } = await api.get(`/api/budget/usage`, {
                  
                  params: { userId: userid, categoryId, month:month, year: year }
                });
                console.log(budget.month);
                return { ...budget, categoryId, categoryName, spent: data.data?.spent ?? 0, remaining: data.data?.remaining ?? budget.limit };
              } catch (err) {
                console.error("Budget usage fetch failed", err);
                return { ...budget, categoryId, categoryName, spent: 0, remaining: budget.limit };
              }
            })
          ).then((results) => {
            setBudgets(results);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.log("Budget fetch failed, using sample data", error);
        setLoading(false);
      });
      api.get(`/api/budget/budgetmonths/${userid}`).then((response)=>{
        console.log(response);
        console.log(response.data.data);
        setFilterDates(response.data.data);
      })
      
    api.get(`/api/category/?userId=${userid}`)
      .then((response) => {
        // console.log(response);
        const categories = response?.data?.data || [];
        const options = categories.map((c: any) => ({ label: c.name, value: c._id }));

        setBudgetCategoryOptions(options);
      })
      .catch((err) => console.log("Category fetch failed", err));
  }, [,filterMonth,filterYear]);

   const handleUpdate = () => {
    api.put(`/api/budget/`+budgetId, {
      userId: sessionStorage.getItem("id"),
      categoryId: budgetCategory,
      limit: Number(limit),
      isRecurring:isRecurring
    }, {
      headers: {
        Accept: "application/json"
      }
    }).then((response) => {
      if (response.status === 200) {
        const created = response.data?.data ?? response.data;
        const catId = getCategoryId(created?.categoryId) || budgetCategory;
        const catName = budgetCategoryOptions.find((o) => o.value === catId)?.label || '';
        const createdBudget = {
          _id: created?._id ?? Math.random().toString(36).slice(2),
          limit: Number(created?.limit ?? limit),
          
        };
        const updateBudget=budgets.map(budget=>{
          if(budget._id==createdBudget._id)
          {
            budget.limit=createdBudget.limit;
          }
          return budget;
        });
        setBudgets(updateBudget);
        setUpdateBudgetDialogVisible(false);
        setBudgetCategory('');
        setLimit(1);
        setBudgetId('');
        setisRecurring(false);
        toast.current?.show({ severity: "success", summary: "Budget Added", detail: `Budget for ${catName}` });
      }
    }).catch((err) => {
      console.error(err);
      setBudgetDialogVisible(false);
      toast.current?.show({ severity: "error", summary: "internal issue occurred", detail: String(err) });
    });
  }

  const handleSubmit = () => {
    api.post(`/api/budget`, {
      userId: sessionStorage.getItem("id"),
      categoryId: budgetCategory,
      limit: Number(limit),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      isRecurring:isRecurring,
    }, {
      headers: {
        Accept: "application/json"
      }
    }).then((response) => {
      if (response.status === 201) {
        const created = response.data?.data ?? response.data;
        const catId = getCategoryId(created?.categoryId) || budgetCategory;
        const catName = budgetCategoryOptions.find((o) => o.value === catId)?.label || '';
        const createdBudget = {
          _id: created?._id ?? Math.random().toString(36).slice(2),
          categoryId: catId,
          categoryName: catName,
          month: created?.month ?? new Date().getMonth() + 1,
          year: created?.year ?? new Date().getFullYear(),
          limit: Number(created?.limit ?? limit),
          spent: created?.spent ?? 0,
          remaining: created?.remaining ?? Number(limit),
          isRecurring:created.isRecurring
        };
        setBudgets((prev) => [createdBudget, ...prev]);
        setBudgetDialogVisible(false);
        setBudgetCategory('');
        setLimit(1);
        toast.current?.show({ severity: "success", summary: "Budget Added", detail: `Budget for ${catName}` });
      }
    }).catch((err) => {
      console.error(err);
      setBudgetDialogVisible(false);
      toast.current?.show({ severity: "error", summary: "internal issue occurred", detail: String(err) });
    });
  }

  useEffect(()=>{
    const uniqueMonths = new Set(filterDates.map(d => d.month));
    const monthOptions = Array.from(uniqueMonths).map(month => ({
      label: Months[month - 1],
      value: month
    }));
    setMonthOptions(monthOptions);
  },[filterDates])

  useEffect(() => {
    if (filterDates && filterDates.length > 0 && !isInitialized) {
      const uniqueMonthsSet = new Set(filterDates.map(m => m.month));
      const uniqueYearsSet = new Set(filterDates.map(m => m.year));

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      if (uniqueMonthsSet.has(currentMonth) && uniqueYearsSet.has(currentYear)) {
        setFilterMonth(currentMonth);
        setFilterYear(currentYear);
      } else if (filterDates.length > 0) {
        const mostRecent = filterDates[filterDates.length - 1];
        setFilterMonth(mostRecent.month);
        setFilterYear(mostRecent.year);
      }

      setIsInitialized(true);
    }
  }, [filterDates, isInitialized]);

  const createCategory = async (name: string) => {
    try {
      const { data } = await api.post(`/api/category`, 
        { name, userId: sessionStorage.getItem("id") }
      );
      const created = data?.data ?? data;
      const newOpt = { label: created.name || name, value: created._id || Math.random().toString(36).slice(2) };
      setBudgetCategoryOptions((prev) => [newOpt, ...prev]);
      setBudgetCategory(newOpt.value);
      setTypedCategory('');
      toast.current?.show({ severity: 'success', summary: 'Category created', detail: `Created "${newOpt.label}"` });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Category create failed', detail: String(err) });
    }
  };

  const handleCategoryChange = (e: any) => {
    const val = e.value;
    console.log(val);
    if (typeof val === 'string' && val.startsWith('__add__:')) {
      const name = val.slice('__add__:'.length);
      createCategory(name);
    } else {
      setBudgetCategory(val);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen gap-6 py-8 px-4 bg-gray-100 dark:bg-black">
      <Toast ref={toast} />
         
      {/* Create Budget Dialog */}
      <Dialog 
        visible={budgetDialogVisible} 
        onHide={() => { setBudgetDialogVisible(false) }} 
        header={<div className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">📊 Create New Budget</div>}
        className="w-full max-w-md"
        headerClassName="bg-linear-to-r from-indigo-500 to-purple-500 border-0"
      >

        <form className="flex items-center justify-center flex-col gap-6">
          {
            (() => {
              const base = [...budgetCategoryOptions];
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
                  value={budgetCategory}
                  onChange={handleCategoryChange}
                  onFilter={(e: any) => setTypedCategory(e.filter ?? e.query ?? (e.originalEvent?.target as any)?.value ?? '')}
                  placeholder="Select a Category"
                  className="w-full"
                />
              );
            })()
          }
          <FloatLabel className="w-full">
            <InputText type="number" value={limit.toString()} onChange={(e: any) => {
              setLimit(e.target.value)
            }} className="w-full" />
            <label>Enter Budget Amount</label>
          </FloatLabel>
            <div>
            <label>Do you this Limit to set for upcoming months as well?</label>
            <InputSwitch  checked={isRecurring} onChange={(e)=>{setisRecurring(e.value)}} />
          </div>
          <button 
            className="w-full bg-linear-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md" 
            type="button" 
            onClick={handleSubmit}
          >
            Create Budget
          </button>
        </form>
      </Dialog>

      {/* Update Budget Dialog */}
      <Dialog 
        visible={budgetUpdateDialogVisible} 
        onHide={() => { 
          setUpdateBudgetDialogVisible(false);
          setBudgetId('');
          setBudgetCategory('');
          setLimit(1);
        }} 
        header={<div className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">✏️ Update Budget</div>}
        className="w-full max-w-md"
        headerClassName="bg-linear-to-r from-green-500 to-emerald-500 border-0"
      >
        <form className="flex items-center justify-center flex-col gap-6">
          {
            (() => {
              const base = [...budgetCategoryOptions];
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
                  value={budgetCategory}
                  onChange={handleCategoryChange}
                  onFilter={(e: any) => setTypedCategory(e.filter ?? e.query ?? (e.originalEvent?.target as any)?.value ?? '')}
                  placeholder="Select a Category"
                  className="w-full"
                  disabled
                />
              );
            })()
          }
          <FloatLabel className="w-full">
            <InputText type="number" value={limit.toString()} onChange={(e: any) => {
              setLimit(e.target.value)
            }} className="w-full" />
            <label>Budget Amount</label>
          </FloatLabel>
            <div>
            <label>Do you this Limit to set for upcoming months as well?</label>
            <InputSwitch  checked={isRecurring} onChange={(e)=>{setisRecurring(e.value)}} />
          </div>
          <button 
            className="w-full bg-linear-to-r from-green-500 to-emerald-500 text-white p-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md" 
            type="button" 
            onClick={handleUpdate}
          >
            Update Budget
          </button>
        
        </form>
      </Dialog>

      {/* Main Content */}
      <div className="w-full max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              💰 Budgets
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Manage and track your spending limits</p>
          </div>
          <div className="flex gap-2 ">
               <Dropdown options={Array.from(new Set(monthOption.map(e=>e)))} optionLabel="label" optionValue="value"  value={filterMonth} onChange={(e)=>{setFilterMonth(e.target.value)}} placeholder="Select a Month to fiter Requests" className="bg-white"/>
                <Dropdown options={Array.from(new Set(filterDates.map(e=>e.year)))} value={filterYear} onChange={(e)=>{setFilterYear(e.target.value)}} placeholder="Select a Year to fiter Requests" className="bg-white"/>
          </div>
          <button 
            className="bg-linear-to-r from-indigo-500 to-purple-500 px-6 py-3 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl" 
            onClick={() => { setBudgetDialogVisible(true) }}
          >
            + New Budget
          </button>
        </div>

        {/* Budgets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-16">
              <ProgressSpinner />
            </div>
          ) : budgets.length > 0 ? (
            budgets.map((budget) => {
              const spent = budget.spent ?? 0;
              const percent = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
              const isOverBudget = spent > budget.limit;
              
              return (
                <Card 
                  key={budget._id} 
                  className="shadow-lg hover:shadow-xl transition-shadow border-0 dark:bg-linear-to-br dark:from-slate-800 dark:to-slate-900 bg-white overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{budget.categoryName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          📅 {new Date(budget.year, budget.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isOverBudget 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {isOverBudget ? '⚠️ Over' : '✓ On Track'}
                      </div>
                    </div>

                    {/* Spending Info */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Spent</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{spent.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Limit</p>
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₹{budget.limit.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <ProgressBar 
                          value={Math.min(percent, 100)} 
                          className={percent > 80 ? "p-progressbar-critical " : percent > 50 ? "p-progressbar-warning" : ""} 
                         
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{percent}% Used</span>
                          <span className={`text-sm font-medium ${
                            (budget.remaining ?? 0) <= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            Remaining: ₹{(budget.remaining ?? budget.limit).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Remaining Status */}
                      <div className={`p-3 rounded-lg text-sm font-medium ${
                        (budget.remaining ?? 0) <= 0 
                          ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' 
                          : 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                      }`}>
                        {(budget.remaining ?? 0) <= 0 
                          ? '🚨 Budget exceeded! Time to control spending.' 
                          : `✨ ${Math.round(((budget.remaining ?? budget.limit) / budget.limit) * 100)}% of budget remaining`
                        }
                      </div>

                      {/* Action Button */}
                      <button 
                        className="w-full bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg mt-4" 
                        onClick={() => {
                          setUpdateBudgetDialogVisible(true);
                          setBudgetCategory(budget.categoryId ? budget.categoryId : "");
                          setLimit(budget.limit);
                          setBudgetId(budget._id);
                          setisRecurring(budget.isRecurring)
                        }}
                      >
                        ✏️ Update Budget
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Budgets Yet</p>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                Start by creating your first budget to track and manage your spending limits for different categories.
              </p>
              <button 
                className="bg-linear-to-r from-indigo-500 to-purple-500 px-8 py-3 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg" 
                onClick={() => { setBudgetDialogVisible(true) }}
              >
                Create First Budget
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;