import { Chart } from "primereact/chart";
import {Card}  from "primereact/card";
import type { TranscationType } from "../pages/Dashboard";
import type { Dispatch, SetStateAction } from "react";
type IncomeExpenseProps={
    chartData:any|null;
    chartOptions:any|null
    loading:boolean;
    transcations:TranscationType[];
    setTranscation:Dispatch<SetStateAction<TranscationType[]>>;
    categoryOptions:Array<{ label: string; value: string }>;
}
const IncomeExpense=({chartData,chartOptions,loading,transcations,categoryOptions}:IncomeExpenseProps)=>{
    return(
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-4">
                            <Card className="p-2 shadow rounded-lg h-96 flex flex-col dark:border dark:border-white">
                                <div className="flex items-center justify-between ">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Income vs Expense</h3>
                                    <p className="text-sm text-gray-500 dark:text-white">This month</p>
                                </div>
                                <div className="flex-1 flex items-center justify-center w-full">
                                    {loading ? (
                                        <div className="text-gray-500 dark:text-white">Loading chart...</div>
                                    ) : chartData ? (
                                        <div className="w-[60vh] h-15rem px-4">
                                            <Chart type="doughnut" data={chartData} options={chartOptions} />
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 dark:text-white">No chart data</div>
                                    )}
                                </div>
                            </Card>
        
                            <Card className="p-6 shadow rounded-lg dark:border dark:border-white">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4 dark:text-white">Quick Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-white">Total Transactions</span>
                                        <span className="text-sm font-medium text-gray-800 dark:text-indigo-300">{transcations.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-white">Top category</span>
                                        <span className="text-sm font-medium text-gray-800 dark:text-green-400">
                                            {(() => {
                                                const counts: Record<string, number> = {};
                                                transcations.forEach((t) => {
                                                    const key = t.category?.name ?? "Uncategorized";
                                                    counts[key] = (counts[key] || 0) + 1;
                                                });
                                                const entries = Object.entries(counts);
                                                if (!entries.length) return "—";
                                                entries.sort((a, b) => b[1] - a[1]);
                                                return entries[0][0];
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-white" >Categories</span>
                                        <span className="text-sm font-medium text-gray-800 dark:text-blue-400">{categoryOptions.length}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
    )
}
export default IncomeExpense;