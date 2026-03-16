import { Card } from "primereact/card"
import type { TranscationType } from "../pages/Dashboard";
import {useContext, useMemo, type Dispatch, type SetStateAction } from "react";
import { DashboardContext } from "../store/slices/chartsSlice";
interface SummaryCardProp{
    transcations:TranscationType[];
    setTranscation:Dispatch<SetStateAction<TranscationType[]>>;
    loading:boolean;
    setLoading:Dispatch<SetStateAction<boolean>>;
    predictExpense:number|string|null;
}

const SummaryCard = ({transcations,loading,predictExpense}:SummaryCardProp) => {
     const useDashboard=useContext(DashboardContext);
        const predictNumber = (() => {
                // const now = new Date();
        // const currentMonth = useDashboard.month==0?now.getMonth():useDashboard.month;
        // const currentYear = useDashboard.year==0? now.getFullYear():useDashboard.year;
        if (typeof predictExpense === "number") return predictExpense;
        const n = Number(predictExpense);
        return isNaN(n) ? null : n;
    })();
    const totals = useMemo(() => {
        return transcations.reduce(
            (acc, t) => {
                const amt = Number(t.amount ?? 0);
                if (!t.date) return acc;
                const d = new Date(t.date);
                if (isNaN(d.getTime())) return acc;

                // If month OR year is -1, use current month
                const selectedMonth = (useDashboard.month === -1 || useDashboard.month <= 0) ? new Date().getMonth() : useDashboard.month - 1;
                const selectedYear = (useDashboard.year === -1 || useDashboard.year <= 0) ? new Date().getFullYear() : useDashboard.year;
                
                if (d.getMonth() !== selectedMonth || d.getFullYear() !== selectedYear) return acc;
                
                if (t.type === "income") acc.income += amt;
                else if (t.type === "expense") acc.expense += amt;
                return acc;
            },
            { income: 0, expense: 0 }
        );
    }, [transcations, useDashboard.month, useDashboard.year]);

    const balance = totals.income - totals.expense;
        const formatCurrency = (value?: number | null) =>
        value == null ? "-" : new Intl.NumberFormat("en-US", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
    return (

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4 min-w-[20vh] lg:min-w-[60vh]">
            <Card className="p-4 shadow-sm rounded-lg w-full  dark:bg-black dark:border dark:border-white">
                <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full   bg-green-100 text-green-700 mr-4">💰</div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-white">Income</p>
                        <p className="text-xl font-semibold text-green-700 dark:text-green-400">{formatCurrency(totals.income)}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4 shadow-sm rounded-lg dark:border dark:border-white">
                <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-700 mr-4">🧾</div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-white">Expense</p>
                        <p className="text-xl font-semibold text-red-400">{formatCurrency(totals.expense)}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4 shadow-sm rounded-lg dark:border dark:border-white">
                <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 mr-4">⚖️</div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-white">Balance</p>
                        <p className="text-xl font-semibold text-indigo-400">{formatCurrency(balance)}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4 shadow-sm rounded-lg dark:border dark:border-white">
                <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700 mr-4">🔮</div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-white">Predicted (this month)</p>
                        <p className="text-xl font-semibold text-amber-700 dark:text-amber-400">
                            {(useDashboard.month !== -1 && useDashboard.month > 0 && useDashboard.month !== (new Date().getMonth() + 1))?(
                            <>
                             {loading ? <span className="inline-block h-5 w-20 bg-gray-200 rounded animate-pulse" /> : totals.expense != null ? formatCurrency(totals.expense) : "—"}
                            </> ):(
                                <>
                               {loading ? <span className="inline-block h-5 w-20 bg-gray-200 rounded animate-pulse" /> : predictNumber != null ? formatCurrency(predictNumber) : "—"}
                           </> )} 
                            </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
export default SummaryCard;