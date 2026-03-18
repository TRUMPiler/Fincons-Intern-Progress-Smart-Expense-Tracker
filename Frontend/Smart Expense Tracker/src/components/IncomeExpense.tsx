import { Chart } from "primereact/chart";
import { Card } from "primereact/card";
import type { TranscationType } from "../pages/Dashboard";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { breakdown, summary } from "../store/slices/chartsSlice";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
type IncomeExpenseProps = {
    chartData: any | null;
    chartOptions: any | null
    loading: boolean;
    transcations: TranscationType[];
    setTranscation: Dispatch<SetStateAction<TranscationType[]>>;
    categoryOptions: Array<{ label: string; value: string }>;
    breakdown?: breakdown;
    summary?: summary;
}
const IncomeExpense = ({ chartData, chartOptions, loading, transcations, breakdown, summary }: IncomeExpenseProps) => {
    const [visible,setVisible]=useState<boolean>(false);
    return (
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-4">
     <Dialog 
    visible={visible} 
    onHide={() => { setVisible(false); }} 
    header="Financial Health Score"
>
    <div className="min-w-[40vh] overflow-x-auto">
    <p className="dark:text-white text-black">
        Your Financial Health Score shows how well you manage your income, expenses, and budgeting habits.

        <br /><br />

        <b>Formula:</b>
        <br />
        Financial Health Score = 
        (Savings Ratio × 40) + 
        (Budget Adherence × 30) + 
        (Spending Stability × 20) + 
        (Expense Control × 10)

        <br /><br />

        <b>Where:</b>

        <br /><br />

        • <b>Savings Ratio</b> = (Income − Expense) ÷ Income  
        → Indicates how much of your income you are saving. Higher savings improve your score.

        <br /><br />

        • <b>Budget Adherence</b> = (Total Budget − Overspend) ÷ Total Budget  
        → Shows how well you stay within your planned budget. Less overspending gives a better score.

        <br /><br />

        • <b>Spending Stability</b>  
        → Calculated using your expenses from the last 3 months.  
        → First, the average monthly expense is calculated.  
        → Then, variation (standard deviation) is measured to see how much your spending fluctuates.  
        → If your spending is consistent (low variation), your stability score is high.  
        → If your spending fluctuates a lot, your score decreases.  
        → Final stability value is converted into a score out of 20.

        <br /><br />

        • <b>Expense Control</b> = 1 − (Expense ÷ Income)  
        → Measures how efficiently you control your spending compared to your income.

        <br /><br />

        The final score is between <b>0 and 100</b>:
        <br />
        • 80–100 → Excellent  
        <br />
        • 60–79 → Good  
        <br />
        • 40–59 → Average  
        <br />
        • Below 40 → Needs Improvement  

        <br /><br />

        A higher score indicates better financial discipline and healthier money management.
    </p>
    </div>
</Dialog>
            <Card className="p-2 shadow rounded-lg h-full flex flex-col dark:border dark:border-white">
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
                    {summary && (
                        <>
                     
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-white">💰 Total Income</span>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                    ₹{summary.income.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-white">💸 Total Expense</span>
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                    ₹{summary.expense.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-white">💵 Savings</span>
                                <span className={`text-sm font-medium ${summary.savings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    ₹{summary.savings.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3" />
                    {breakdown && (
                        <>
                           
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Health Scores:</div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-white">📊 Savings Score</span>
                                <span className="text-xs font-medium text-gray-800 dark:text-indigo-300">{breakdown.savings.toFixed(1)}/40</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-white">📈 Budget Score</span>
                                <span className="text-xs font-medium text-gray-800 dark:text-indigo-300">{breakdown.budget.toFixed(1)}/30</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-white">⚖️ Control Score</span>
                                <span className="text-xs font-medium text-gray-800 dark:text-indigo-300">{breakdown.control.toFixed(1)}/10</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-white">📉 Stability Score</span>
                                <span className="text-xs font-medium text-gray-800 dark:text-indigo-300">{breakdown.stability.toFixed(1)}/20</span>
                            </div>
                        </>
                    )}
                       <Button label="Calculation Formula" onClick={()=>{setVisible(true)}}/>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3"></div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-white">Top category</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-indigo-300">
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
                </div>
            </Card>
        </div>
    )
}
export default IncomeExpense;