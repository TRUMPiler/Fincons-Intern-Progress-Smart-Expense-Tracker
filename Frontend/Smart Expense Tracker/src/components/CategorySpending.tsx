import { Chart } from "primereact/chart";
import { Card } from "primereact/card";
import type { TranscationType } from "../pages/Dashboard";
import { useState, useEffect } from "react";
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
    chartsVisible?: boolean;
}
const CategorySpending=({loading,chartBarData,chartBarOptions,chartMonthlyData,chartMonthlyOptions,chartsVisible}:CategorySpendingProps)=>{
    const [localBarData, setLocalBarData] = useState<any|null>(null);
    const [localMonthlyData, setLocalMonthlyData] = useState<any|null>(null);

    useEffect(() => {
        if (!chartsVisible) {
            setLocalBarData(null);
            return;
        }
        if (chartBarData) {
            try {
                const zeroed = JSON.parse(JSON.stringify(chartBarData));
                if (zeroed.datasets && Array.isArray(zeroed.datasets)) {
                    zeroed.datasets = zeroed.datasets.map((d: any) => ({ ...d, data: (d.data || []).map(() => 0) }));
                }
                setLocalBarData(zeroed);
                const t = setTimeout(() => setLocalBarData(chartBarData), 1000);
                return () => clearTimeout(t);
            } catch (e) {
                setLocalBarData(chartBarData);
            }
        }
    }, [chartsVisible, chartBarData]);

    useEffect(() => {
        if (!chartsVisible) {
            setLocalMonthlyData(null);
            return;
        }
        if (chartMonthlyData) {
            try {
                const zeroed = JSON.parse(JSON.stringify(chartMonthlyData));
                if (zeroed.datasets && Array.isArray(zeroed.datasets)) {
                    zeroed.datasets = zeroed.datasets.map((d: any) => ({ ...d, data: (d.data || []).map(() => 0) }));
                }
                setLocalMonthlyData(zeroed);
                const t = setTimeout(() => setLocalMonthlyData(chartMonthlyData), 1000);
                return () => clearTimeout(t);
            } catch (e) {
                setLocalMonthlyData(chartMonthlyData);
            }
        }
    }, [chartsVisible, chartMonthlyData]);
    return( <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-4 overflow-x-auto">
                        <Card className="p-2 shadow rounded-lg  flex flex-col dark:border dark:border-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Category-wise Spendings</h3>
                                <p className="text-sm text-gray-500 dark:text-white">This month</p>
                            </div>
                            <div className="flex-1 flex items-center justify-center w-full">
                                {loading ? (
                                    <div className="text-gray-500 dark:text-white">Loading chart...</div>
                                ) : !chartsVisible ? (
                                    <div className="text-gray-500 dark:text-white">Preparing chart...</div>
                                ) : localBarData ? (
                                    <div className="w-[60vh] h-15rem px-4">
                                        <Chart key={`${chartsVisible ? 'ready' : 'hidden'}-${JSON.stringify(localBarData)}`} type="bar" data={localBarData} options={chartBarOptions} />
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
                                ) : !chartsVisible ? (
                                    <div className="text-gray-500 dark:text-white">Preparing chart...</div>
                                ) : localMonthlyData ? (
                                    <div className="w-[60vh] h-15rem px-4">
                                        
                                        <Chart key={`${chartsVisible ? 'ready' : 'hidden'}-${JSON.stringify(localMonthlyData)}`} type="line" data={localMonthlyData} options={chartMonthlyOptions} />
                                    </div>
                                ) : (
                                    <div className="text-gray-500 dark:text-white">No chart data</div>
                                )}
                            </div>
                        </Card>
                    </div>);
}
export default CategorySpending;