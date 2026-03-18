import { Card } from "primereact/card"
import type { BudgetProp } from "../pages/Dashboard";
import { Knob } from "primereact/knob";
import { useEffect } from "react";
interface BudgetMetersProp {
    charts: any | null;
    loading: boolean
    chartData: any | null
}
const calculateKnobValue = (limit: number, spent: number): number => {
    const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    return Math.min(percent, 100);
}
const BudgetMeters = ({ charts, loading, chartData }: BudgetMetersProp) => {
    useEffect(()=>{
        console.log((charts.budget.length)/2);
    },[])
const calculateGridValues=(charts:any):number=>
{
    if(charts.budget.length>1)
    {
        if((charts.budget.length/2)>3)
        {
            return 3;
        }
        return (charts.budget.length/2)
    }
    return 1;
}
    return (
        <>
            {Array.isArray(charts.budget) && charts.budget.length > 0 && (
                <div className={`grid md:grid-cols-${calculateGridValues(charts)} grid-cols-1 gap-4 mb-4 md:min-w-[40vh] h-[50vh]  lg:h-[68vh] overflow-x-auto dark:bg-gray-600`}>
                    {charts.budget.map((data: BudgetProp) => (
                        <Card key={data._id ?? data.categoryId} className="p-1 shadow rounded-lg h-96 lg:h-fit flex flex-col dark:border dark:border-white">
                            <div className="flex items-center justify-center ">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-white">Budget Meter for {data.categoryName}</h3>

                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center w-full ">
                                {loading ? (
                                    <div className="text-gray-500 dark:text-white">Loading chart...</div>
                                ) : chartData ? (

                                    <div className="lg:h-15rem px-1">
                                        <Knob value={calculateKnobValue(data.limit, data.spent ?? 0)} max={100} size={200} className="p-10" />
                                    </div>

                                ) : (
                                    <div className="text-gray-500 dark:text-white">No chart data</div>
                                )}
                                <div className="flex flex-row  gap-2">
                                    <p className="text-black dark:text-white">Limit:{data.limit}</p>
                                    <p className="text-black dark:text-white">Remaining:{data.remaining}</p>
                                </div>
                            </div>
                        </Card>
                    ))}

                </div>
            )}
        </>
    )
}
export default BudgetMeters;