import { Card } from "primereact/card"
import type { BudgetProp } from "../pages/Dashboard";
import { Knob } from "primereact/knob";
import { AlertCircle } from "lucide-react";

interface BudgetMetersProp {
    charts: any | null;
    loading: boolean
}

const calculateKnobValue = (limit: number, spent: number): number => {
    const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    return Math.min(percent, 100);
}

const getKnobColor = (value: number) => {
    if (value <= 50) return '#10b981'; // green
    if (value <= 80) return '#f59e0b'; // orange
    return '#ef4444'; // red
}

const BudgetMeters = ({ charts, loading }: BudgetMetersProp) => {
    const budgets = charts?.budget ?? [];
    const hasBudgets = Array.isArray(budgets) && budgets.length > 0;

    // Determine grid columns based on budget count
    const getGridColsClass = () => {
        if (budgets.length > 6) return 'lg:grid-cols-3';
        if (budgets.length > 4) return 'lg:grid-cols-3';
        if (budgets.length > 2) return 'lg:grid-cols-2';
        return 'lg:grid-cols-1';
    };

    return (
        <div className="w-full">
            {!hasBudgets ? (
                <Card className="p-8 shadow-md rounded-lg bg-white dark:bg-gray-900 dark:border dark:border-gray-700 flex items-center justify-center min-h-96">
                    <div className="flex flex-col items-center justify-center text-center gap-4">
                        <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/30">
                            <AlertCircle className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Budgets Created</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
                                Start by creating a budget for a category to track your spending and see your budget meters here.
                            </p>
                        </div>
                        <a href="/budget" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                            Create Budget
                        </a>
                    </div>
                </Card>
            ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 ${getGridColsClass()} gap-6 w-full`}>
                    {budgets.map((data: BudgetProp) => {
                        const knobValue = calculateKnobValue(data.limit, data.spent ?? 0);
                        const knobColor = getKnobColor(knobValue);
                        const statusLabel = knobValue > 100 ? 'Over Budget' : knobValue > 80 ? 'High' : 'On Track';
                        const statusColor = knobValue > 100 ? 'text-red-600 dark:text-red-400' : knobValue > 80 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400';

                        return (
                            <Card
                                key={data._id ?? data.categoryId}
                                className="p-6! shadow-md rounded-xl overflow-hidden bg-white dark:bg-gray-900 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex flex-col h-full">
                                    {/* Header */}
                                    <div className="mb-4">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                            {data.categoryName}
                                        </h3>
                                        <p className={`text-xs font-semibold mt-2 ${statusColor}`}>
                                            {statusLabel}
                                        </p>
                                    </div>

                                    {/* Knob Section */}
                                    <div className="flex-1 flex items-center justify-center mb-4">
                                        {loading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-indigo-500 animate-spin" />
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Loading...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Knob
                                                    value={Math.min(knobValue, 100)}
                                                    max={100}
                                                    size={160}
                                                    readOnly
                                                    valueColor={knobColor}
                                                    rangeColor="#e5e7eb"
                                                    textColor="#111827"
                                                    className="dark:text-white"
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                                                    {knobValue}% of budget
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Limit</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                ₹{data.limit?.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Spent</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                ₹{(data.spent ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Remaining</span>
                                            <span className={`text-sm font-bold ${data.remaining! >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                ₹{data.remaining?.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min(knobValue, 100)}%`,
                                                backgroundColor: knobColor
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default BudgetMeters;