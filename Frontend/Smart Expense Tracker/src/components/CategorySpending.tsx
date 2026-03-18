import { Chart } from "primereact/chart";
import { Card } from "primereact/card";
import type { TranscationType } from "../pages/Dashboard";
import type { Dispatch, SetStateAction } from "react";
interface CategorySpendingProps{
      chartBarData:any|null;
        chartBarOptions:any|null
        chartMonthlyData:any|null
        chartMonthlyOptions:any|null;
        loading:boolean;
        transcations:TranscationType[];
        setTranscation:Dispatch<SetStateAction<TranscationType[]>>;
        categoryOptions:Array<{ label: string; value: string }>;
}
const CategorySpending=({loading,chartBarData,chartBarOptions,chartMonthlyData,chartMonthlyOptions}:CategorySpendingProps)=>{
    return( <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-4 overflow-x-auto">
                        <Card className="p-2 shadow rounded-lg  flex flex-col dark:border dark:border-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Category-wise Spendings</h3>
                                <p className="text-sm text-gray-500 dark:text-white">This month</p>
                            </div>
                            <div className="flex-1 flex items-center justify-center w-full">
                                {loading ? (
                                    <div className="text-gray-500 dark:text-white">Loading chart...</div>
                                ) : chartBarData ? (
                                    <div className="w-[60vh] h-15rem px-4">
                                        <Chart type="bar" data={chartBarData} options={chartBarOptions} />
                                    </div>
                                ) : (
                                    <div className="text-gray-500 dark:text-white">No chart data</div>
                                )}
                            </div>
                        </Card>
                        <Card className="p-2 shadow rounded-lg flex flex-col dark:border dark:border-white ">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Monthly Spending Trend</h3>
                                {/* <p className="text-sm text-gray-500 dark:text-white">This month</p> */}
                            </div>
                            <div className="flex-1 flex items-center justify-center w-full">
                                {loading ? (
                                    <div className="text-gray-500 dark:text-white">Loading chart...</div>
                                ) : chartMonthlyData ? (
                                    <div className="w-[60vh] h-15rem px-4">
                                        
                                        <Chart type="line" data={chartMonthlyData} options={chartMonthlyOptions} />
                                    </div>
                                ) : (
                                    <div className="text-gray-500 dark:text-white">No chart data</div>
                                )}
                            </div>
                        </Card>
                    </div>);
}
export default CategorySpending;