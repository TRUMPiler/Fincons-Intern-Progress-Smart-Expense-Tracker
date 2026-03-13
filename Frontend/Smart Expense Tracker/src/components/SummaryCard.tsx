import { Card } from "primereact/card"
import type { TranscationType } from "../pages/Dashboard";
import { useMemo, type Dispatch, type SetStateAction } from "react";
interface SummaryCardProp{
    transcations:TranscationType[];
    setTranscation:Dispatch<SetStateAction<TranscationType[]>>;
    loading:boolean;
    setLoading:Dispatch<SetStateAction<boolean>>;
    predictExpense:number|string|null;
}

const SummaryCard = ({transcations,loading,predictExpense}:SummaryCardProp) => {
        const predictNumber = (() => {
        if (typeof predictExpense === "number") return predictExpense;
        const n = Number(predictExpense);
        return isNaN(n) ? null : n;
    })();
    const totals = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transcations.reduce(
            (acc, t) => {
                const amt = Number(t.amount ?? 0);
                if (!t.date) return acc;
                const d = new Date(t.date);
                if (isNaN(d.getTime())) return acc;

                if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return acc;
                
                if (t.type === "income") acc.income += amt;
                else if (t.type === "expense") acc.expense += amt;
                return acc;
            },
            { income: 0, expense: 0 }
        );
    }, [transcations]);

    const balance = totals.income - totals.expense;
        const formatCurrency = (value?: number | null) =>
        value == null ? "-" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
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
                            {loading ? <span className="inline-block h-5 w-20 bg-gray-200 rounded animate-pulse" /> : predictNumber != null ? formatCurrency(predictNumber) : "—"}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
export default SummaryCard;