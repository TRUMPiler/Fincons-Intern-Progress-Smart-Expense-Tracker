// import { useEffect, useMemo, useState, type FC } from "react";
// import Transcation from "../components/Transactions";
// import { Card } from "primereact/card";
// import { Chart } from "primereact/chart";
// import axios from "axios";
// import { useAppDispatch, useAppSelector } from "../store/hooks";
// import { fetchBudgetWiseUsage, fetchCategorySpending, fetchMonthlyTrend, fetchPredict, fetchTotals } from "../store/slices/chartsSlice";
// import { Knob } from "primereact/knob";

// type CategoryProp = {
//     name: string;
//     _id: string;
// };
// type TranscationType = {
//     _id: string | number;
//     userId?: string | number;
//     amount?: number;
//     category?: CategoryProp | null;
//     description?: string;
//     type?: "income" | "expense";
//     date?: string;
//     isDelete?: boolean;
// };

// type SpendingCategory = {
//     total: number;
//     category: string;
// }
// type Month_trend = {
//     totalSpent:number;
//     month: number;
//     year: number;
// }
// type BudgetProp = {
//     _id: string;
//     categoryId?: string;
//     categoryName?: string;
//     month: number;
//     year: number;
//     limit: number;
//     spent?: number;
//     remaining?: number;
// };
// const Dashboard1L: FC = () => {
//     const [transcations, setTranscations] = useState<TranscationType[]>([]);
//     // budgets are sourced from the charts slice in the store
//     const Months:string[]=["January","Febuary","March","April","May","June","July","August","September","October","November","December"];
//     const [chartData, setChartData] = useState<any | null>(null);
//     const [chartOptions, setChartOptions] = useState<any | null>(null);
//     const [loading, setLoading] = useState<boolean>(true);
//     const [predictExpense, setPredictExpense] = useState<number | string | null>(0);
//     const [categoryOptions, setCategoryOptions] = useState<Array<{ label: string; value: string }>>([]);
//     const [chartBarData, setChartBarData] = useState({});
//     const [chartMonthlyData, setChartMontlyData] = useState({});
//     const [chartBarOptions, setChartBarOptions] = useState({});
//     const [chartMonthlyOptions, setChartMonthlyOptions] = useState({});
//     const dispatch = useAppDispatch();
//     const charts = useAppSelector((s) => s.charts);
//     const currentMonth = new Date().toLocaleString(undefined, { month: "long", year: "numeric" });

//     useEffect(() => {
//         const JwtToken = sessionStorage.getItem("jwtToken");
//         const userId = sessionStorage.getItem("id");
//         if (!userId) {
//             window.location.href = "/login";
//             return;
//         }

//         axios
//             .get(`${import.meta.env.VITE_BACKEND_URL}/api/transcation/${userId}`, {
//                 headers: { Accept: "application/json", Authorization: `Bearer ${JwtToken}` },
//             })
//             .then((response) => {
//                 const payload = response.data as any;
//                 const rows: TranscationType[] = Array.isArray(payload) ? payload : payload?.data ?? [];
//                 setTranscations(rows);
//             })
//             .catch((err) => console.error(err));

//         axios
//             .get(`${import.meta.env.VITE_BACKEND_URL}/api/category/?userId=${userId}`, {
//                 headers: { Authorization: `Bearer ${JwtToken}` },
//             })
//             .then((res) => {
//                 const cats = res?.data?.data ?? [];
//                 const opts = cats.map((c: any) => ({ label: c.name, value: c._id }));
//                 setCategoryOptions(opts);
//             })
//             .catch((err) => console.error("Category fetch failed", err));
//     }, []);

//     useEffect(() => {
//         const userid = sessionStorage.getItem('id')
//         if (!userid) {
//             setLoading(false)
//             return
//         }
//         dispatch(fetchBudgetWiseUsage())
//         dispatch(fetchPredict())
//         dispatch(fetchMonthlyTrend())
//         dispatch(fetchCategorySpending())
//         dispatch(fetchTotals())
//     }, [transcations, dispatch])


//     useEffect(() => {
//         const documentStyle = getComputedStyle(document.documentElement)
//         const rawTextColor = documentStyle.getPropertyValue('--text-color') || documentStyle.getPropertyValue('--black') || '#111827'
//         const rawTextColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || documentStyle.getPropertyValue('--white') || '#6B7280'
//         const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#e5e7eb'

//         // monthly trend
//         const monthsData = charts.monthlyTrend ?? []
//         const monthLabels = monthsData.map((e) => Months[e.month - 1])
//         const monthTotals = monthsData.map((e) => e.totalSpent)
//         const monthlyDataObj = {
//             labels: monthLabels,
//             datasets: [
//                 {
//                     label: 'Expenses',
//                     data: monthTotals,
//                     fill: true,
//                     borderColor: documentStyle.getPropertyValue('--blue-500'),
//                     tension: 0.4,
//                 },
//             ],
//         }
//         const monthlyOptionsObj = {
//             maintainAspectRatio: false,
//             aspectRatio: 0.6,
//             plugins: {
//                 legend: { labels: { color: rawTextColor } },
//             },
//             scales: {
//                 x: { ticks: { color: rawTextColorSecondary }, grid: { color: surfaceBorder } },
//                 y: { ticks: { color: rawTextColorSecondary }, grid: { color: surfaceBorder } },
//             },
//         }

//         setChartMontlyData(monthlyDataObj)
//         setChartMonthlyOptions(monthlyOptionsObj)
        
//         const spending = charts.categorySpending ?? []
//         const labels = spending.map((s) => s.category)
//         const values = spending.map((s) => Number(s.total) || 0)
//         const palette = [
//             documentStyle.getPropertyValue('--blue-500') || '#3b82f6',
//             documentStyle.getPropertyValue('--green-500') || '#10b981',
//             documentStyle.getPropertyValue('--yellow-500') || '#f59e0b',
//             documentStyle.getPropertyValue('--red-500') || '#ef4444',
//             documentStyle.getPropertyValue('--indigo-500') || '#6366f1',
//             documentStyle.getPropertyValue('--amber-500') || '#f59e0b',
//         ]
//             .map((c) => c.trim())
//             .filter(Boolean)

//         const backgroundColors = values.map((_, i) => palette[i % palette.length] || '#3b82f6')

//         const barDataObj = {
//             labels,
//             datasets: [
//                 {
//                     label: 'Category Spending',
//                     backgroundColor: backgroundColors,
//                     borderColor: backgroundColors,
//                     data: values,
//                 },
//             ],
//         }

//         const barOptionsObj = {
//             maintainAspectRatio: false,
//             aspectRatio: 0.8,
//             plugins: {
//                 legend: { labels: { color: rawTextColor.trim() || '#111827' } },
//             },
//             scales: {
//                 x: {
//                     ticks: { color: rawTextColorSecondary.trim() || '#6B7280', font: { weight: 500 } },
//                     grid: { display: false, drawBorder: false },
//                 },
//                 y: { ticks: { color: rawTextColorSecondary.trim() || '#6B7280' }, grid: { color: surfaceBorder, drawBorder: false } },
//             },
//         }

//         setChartBarData(barDataObj)
//         setChartBarOptions(barOptionsObj)

//         const totalsState = charts.totals ?? { income: 0, expense: 0 }
//         const doughnutData = {
//             labels: ['Income', 'Expense'],
//             datasets: [
//                 {
//                     data: [totalsState.income, totalsState.expense],
//                     backgroundColor: [documentStyle.getPropertyValue('--blue-500') || '#3b82f6', documentStyle.getPropertyValue('--yellow-500') || '#f59e0b'],
//                     hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400') || '#60a5fa', documentStyle.getPropertyValue('--yellow-400') || '#fbbf24'],
//                 },
//             ],
//         }

//         const doughnutOptions = {
//             plugins: { legend: { labels: { usePointStyle: true, color: rawTextColor.trim() || '#111827' } } },
//             maintainAspectRatio: false,
//         }

//         setChartData(doughnutData)
//         setChartOptions(doughnutOptions)

//         // budgets are read directly from the charts slice (charts.budget)
//         setPredictExpense(charts.predictExpense ?? null)
//         setLoading(false)
//     }, [charts])
//     const calculateKnobValue=(limit:number,spent:number):number=>
//     {
//         const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
//         return Math.min(percent,100);
//     }
//     const totals = useMemo(() => {
//         const now = new Date();
//         const currentMonth = now.getMonth();
//         const currentYear = now.getFullYear();

//         return transcations.reduce(
//             (acc, t) => {
//                 const amt = Number(t.amount ?? 0);
//                 if (!t.date) return acc;
//                 const d = new Date(t.date);
//                 if (isNaN(d.getTime())) return acc;

//                 if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return acc;

//                 if (t.type === "income") acc.income += amt;
//                 else if (t.type === "expense") acc.expense += amt;
//                 return acc;
//             },
//             { income: 0, expense: 0 }
//         );
//     }, [transcations]);

//     const balance = totals.income - totals.expense;

//     const formatCurrency = (value?: number | null) =>
//         value == null ? "-" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

//     const predictNumber = (() => {
//         if (typeof predictExpense === "number") return predictExpense;
//         const n = Number(predictExpense);
//         return isNaN(n) ? null : n;
//     })();

//     return (
//         <div className="flex flex-col items-center w-full min-h-screen gap-6 py-8 px-4 bg-linear-to-r from-indigo-300 to-indigo-700  dark:bg-none dark:bg-black ">
//             <div className="w-full max-w-7xl  mt-3">
//                 <div className="flex items-center justify-between mb-6">
//                     <div>
//                         <h1 className="text-3xl font-semibold text-black dark:text-indigo-400">Dashboard</h1>
//                         <p className="text-sm text-gray-600 dark:text-white">Overview · {currentMonth}</p>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4 min-w-[20vh] lg:min-w-[60vh]">
//                     <Card className="p-4 shadow-sm rounded-lg w-full  dark:bg-black dark:border dark:border-white">
//                         <div className="flex items-center">
//                             <div className="flex items-center justify-center w-12 h-12 rounded-full   bg-green-100 text-green-700 mr-4">💰</div>
//                             <div>
//                                 <p className="text-xs text-gray-500 dark:text-white">Income</p>
//                                 <p className="text-xl font-semibold text-green-700 dark:text-green-400">{formatCurrency(totals.income)}</p>
//                             </div>
//                         </div>
//                     </Card>

//                     <Card className="p-4 shadow-sm rounded-lg dark:border dark:border-white">
//                         <div className="flex items-center">
//                             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-700 mr-4">🧾</div>
//                             <div>
//                                 <p className="text-xs text-gray-500 dark:text-white">Expense</p>
//                                 <p className="text-xl font-semibold text-red-400">{formatCurrency(totals.expense)}</p>
//                             </div>
//                         </div>
//                     </Card>

//                     <Card className="p-4 shadow-sm rounded-lg dark:border dark:border-white">
//                         <div className="flex items-center">
//                             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 mr-4">⚖️</div>
//                             <div>
//                                 <p className="text-xs text-gray-500 dark:text-white">Balance</p>
//                                 <p className="text-xl font-semibold text-indigo-400">{formatCurrency(balance)}</p>
//                             </div>
//                         </div>
//                     </Card>

//                     <Card className="p-4 shadow-sm rounded-lg dark:border dark:border-white">
//                         <div className="flex items-center">
//                             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700 mr-4">🔮</div>
//                             <div>
//                                 <p className="text-xs text-gray-500 dark:text-white">Predicted (this month)</p>
//                                 <p className="text-xl font-semibold text-amber-700 dark:text-amber-400">
//                                     {loading ? <span className="inline-block h-5 w-20 bg-gray-200 rounded animate-pulse" /> : predictNumber != null ? formatCurrency(predictNumber) : "—"}
//                                 </p>
//                             </div>
//                         </div>
//                     </Card>
//                 </div>

//                 <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-4">
//                     <Card className="p-2 shadow rounded-lg h-96 flex flex-col dark:border dark:border-white">
//                         <div className="flex items-center justify-between ">
//                             <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Income vs Expense</h3>
//                             <p className="text-sm text-gray-500 dark:text-white">This month</p>
//                         </div>
//                         <div className="flex-1 flex items-center justify-center w-full">
//                             {loading ? (
//                                 <div className="text-gray-500 dark:text-white">Loading chart...</div>
//                             ) : chartData ? (
//                                 <div className="w-[60vh] h-15rem px-4">
//                                     <Chart type="doughnut" data={chartData} options={chartOptions} />
//                                 </div>
//                             ) : (
//                                 <div className="text-gray-500 dark:text-white">No chart data</div>
//                             )}
//                         </div>
//                     </Card>

//                     <Card className="p-6 shadow rounded-lg dark:border dark:border-white">
//                         <h3 className="text-lg font-semibold text-gray-700 mb-4 dark:text-white">Quick Summary</h3>
//                         <div className="space-y-3">
//                             <div className="flex items-center justify-between">
//                                 <span className="text-sm text-gray-500 dark:text-white">Total Transactions</span>
//                                 <span className="text-sm font-medium text-gray-800 dark:text-indigo-300">{transcations.length}</span>
//                             </div>
//                             <div className="flex items-center justify-between">
//                                 <span className="text-sm text-gray-500 dark:text-white">Top category</span>
//                                 <span className="text-sm font-medium text-gray-800 dark:text-green-400">
//                                     {(() => {
//                                         const counts: Record<string, number> = {};
//                                         transcations.forEach((t) => {
//                                             const key = t.category?.name ?? "Uncategorized";
//                                             counts[key] = (counts[key] || 0) + 1;
//                                         });
//                                         const entries = Object.entries(counts);
//                                         if (!entries.length) return "—";
//                                         entries.sort((a, b) => b[1] - a[1]);
//                                         return entries[0][0];
//                                     })()}
//                                 </span>
//                             </div>
//                             <div className="flex items-center justify-between">
//                                 <span className="text-sm text-gray-500 dark:text-white" >Categories</span>
//                                 <span className="text-sm font-medium text-gray-800 dark:text-blue-400">{categoryOptions.length}</span>
//                             </div>
//                         </div>
//                     </Card>
//                 </div>
//                                     {Array.isArray(charts.budget) && charts.budget.length > 0 && (
//                                 <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mb-4 overflow-x-auto">
//                                       {charts.budget.map((data: BudgetProp) => (
//                                                     <Card key={data._id ?? data.categoryId} className="p-1 shadow rounded-lg h-96 flex flex-col dark:border dark:border-white">
//                         <div className="flex items-center justify-center ">
//                             <h3 className="text-sm font-semibold text-gray-700 dark:text-white">Budget Meter for {data.categoryName}</h3>

//                         </div>
//                         <div className="flex-1 flex items-center justify-center w-full">
//                             {loading ? (
//                                 <div className="text-gray-500 dark:text-white">Loading chart...</div>
//                             ) : chartData ? (
//                                 <div className=" h-15rem px-1">
//                                    <Knob value={calculateKnobValue(data.limit,data.spent??0)} max={100} size={200} className="p-10"/>
//                                 </div>
//                             ) : (
//                                 <div className="text-gray-500 dark:text-white">No chart data</div>
//                             )}
//                         </div>
//                     </Card>     
//                     ))} 
               
//                 </div>
//                      )}
//                 <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-4 overflow-x-auto">
//                     <Card className="p-2 shadow rounded-lg  flex flex-col dark:border dark:border-white">
//                         <div className="flex items-center justify-between">
//                             <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Category-wise Spendings</h3>
//                             <p className="text-sm text-gray-500 dark:text-white">This month</p>
//                         </div>
//                         <div className="flex-1 flex items-center justify-center w-full">
//                             {loading ? (
//                                 <div className="text-gray-500 dark:text-white">Loading chart...</div>
//                             ) : chartData ? (
//                                 <div className="w-[60vh] h-15rem px-4">
//                                     <Chart type="bar" data={chartBarData} options={chartBarOptions} />
//                                 </div>
//                             ) : (
//                                 <div className="text-gray-500 dark:text-white">No chart data</div>
//                             )}
//                         </div>
//                     </Card>
//                     <Card className="p-2 shadow rounded-lg flex flex-col dark:border dark:border-white ">
//                         <div className="flex items-center justify-between">
//                             <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Monthly Spending Trend</h3>
//                             <p className="text-sm text-gray-500 dark:text-white">This month</p>
//                         </div>
//                         <div className="flex-1 flex items-center justify-center w-full">
//                             {loading ? (
//                                 <div className="text-gray-500 dark:text-white">Loading chart...</div>
//                             ) : chartData ? (
//                                 <div className="w-[60vh] h-15rem px-4">
//                                     <Chart type="line" data={chartMonthlyData} options={chartMonthlyOptions}/>
//                                 </div>
//                             ) : (
//                                 <div className="text-gray-500 dark:text-white">No chart data</div>
//                             )}
//                         </div>
//                     </Card>
//                 </div>
//                 <Card className="p-4 shadow rounded-lg dark:border dark:border-white">
//                     <h3 className="text-lg font-semibold text-gray-700 mb-4 dark:text-white">Transactions</h3>
//                     <Transcation transcations={transcations} setTranscations={setTranscations} />
//                 </Card>
//             </div>
//         </div>
//     );
// };

// export default Dashboard1L;