import { useContext, useEffect, useMemo, useRef, useState, type FC, type Ref } from "react";
import Transcation from "../components/Transactions";
import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";
import api from "../lib/axiosInstance";
import AlertGif from "../assets/downloadAlert.gif";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { DashboardContext, fetchAlerts, fetchAvailableMonths, fetchBudgetWiseUsage, fetchCategorySpending, fetchFinancialHealth, fetchMonthlyTrend, fetchPredict, fetchTotals, type Alert, type breakdown, type summary } from "../store/slices/chartsSlice";

import { Toast } from "primereact/toast";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import { Dropdown } from 'primereact/dropdown';
import SummaryCard from "../components/SummaryCard";
import IncomeExpense from "../components/IncomeExpense";
import CategorySpending from "../components/CategorySpending";
import BudgetMeters from "../components/BudgetMeters";
import { SelectButton } from "primereact/selectbutton";
import ArturoGif from "../assets/Ai Image.gif";

type CategoryProp = {
    name: string;
    _id: string;
};
export type TranscationType = {
    _id: string | number;
    userId?: string | number;
    amount?: number;
    category?: CategoryProp | null;
    description?: string;
    type?: "income" | "expense";
    date?: string;
    isDelete?: boolean;
};

// type SpendingCategory = {
//     total: number;
//     category: string;
// }
// type Month_trend = {
//     totalSpent:number;
//     month: number;
//     year: number;
// }
export type health={label:string,score:number,breakdown:breakdown,summary:summary};
export type BudgetProp = {
    _id: string;
    categoryId?: string;
    categoryName?: string;
    month: number;
    year: number;
    limit: number;
    spent?: number;
    remaining?: number;
};
const DashboardL: FC = () => {
    const [transcations, setTranscations] = useState<TranscationType[]>([]);
    // budgets are sourced from the charts slice in the store
    const Months: string[] = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const [chartData, setChartData] = useState<any | null>(null);
    const [loadCharts,setLoadCharts]=useState<boolean>(false);
    const [chartOptions, setChartOptions] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [minLoadingTimeReached, setMinLoadingTimeReached] = useState<boolean>(false);
    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [predictExpense, setPredictExpense] = useState<number | string | null>(0);
    const [categoryOptions, setCategoryOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [chartBarData, setChartBarData] = useState({});
    const [chartMonthlyData, setChartMontlyData] = useState({});
    const [chartBarOptions, setChartBarOptions] = useState({});
    const [chartMonthlyOptions, setChartMonthlyOptions] = useState({});
    const [alerts,setAlerts]=useState<Alert[]>([]);
    const [dynamicMonthOptions, setDynamicMonthOptions] = useState<Array<{ label: string; value: number }>>([]);
    const [dynamicYearOptions, setDynamicYearOptions] = useState<Array<{ label: string; value: number }>>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const useDashboard=useContext(DashboardContext);
    const [fiananceHealth,setFiananceHealth]=useState<health>({label:"",score:0,breakdown:{
        savings:0,
        stability:0,
        control:0,
        budget:0

    },summary:{
        income:0,
        expense:0,
        savings:0
    }});
    const [dashboardView,setDashboardView]=useState<"Financial Overview"|"Budget Overview"|"Transcations">("Financial Overview");
    const options=["Financial Overview","Budget Overview","Transcations"];
    const [currentAlertIndex, setCurrentAlertIndex] = useState<number | null>(null);
    const dispatch = useAppDispatch();
    let acceptRef=useRef<string>('');
    const charts = useAppSelector((s) => s.charts);
    const currentMonth = new Date().toLocaleString(undefined, { month: "long", year: "numeric" });
    // const displayedMonth = (useDashboard.month && useDashboard.year) ? `${Months[useDashboard.month - 1]} ${useDashboard.year}` : currentMonth;
    const toast=useRef<Toast|null>(null);
    const recentTransactions = transcations.slice(-5).reverse();
    const accepted = async (alertid:string) => {
        try{
            const response = await api.put(`/api/alert/`+alertid,{},{
                headers:{
                    Accept: "application/JSON"
                }
            });
            if(response.status==200)
            {
                 toast.current?.show({ severity: 'info', summary: 'Alert Closed', detail: "You won't be alerted again", life: 3000 });
                
                 dispatch(fetchAlerts());
            }
    
        }catch(err){
            console.error('Failed to mark alert read', err);
            throw err;
        }
    }

    const reject = () => {
        toast.current?.show({ severity: 'warn', summary: 'Remind Again', detail: 'You will Reminded again about this', life: 3000 });
    }
    const confirm = (_position:any,message:string,header:string,alertid:string) => {
        const messages= (
                <div className="flex flex-column align-items-center w-full  border-bottom-1 surface-border">
                    {/* <i className="pi pi-exclamation-circle text-6xl text-primary-500"></i> */}
                    <span >{message}</span>
                </div>
            );
        confirmDialog({
              group: 'headless',
              message:[messages],
            header:header.toUpperCase(),
    
        
            accept:()=>accepted(alertid),
            reject
        });
    };
  
    useEffect(() => {
        const userId = sessionStorage.getItem("id");
        if (!userId) {
            window.location.href = "/login";
            return;
        }

        api
            .get(`/api/transcation/${userId}?month=${useDashboard.month}&year=${useDashboard.year}`, {
                headers: { Accept: "application/json" },
            })
            .then((response: any) => {
                const payload = response.data as any;
                const rows: TranscationType[] = Array.isArray(payload) ? payload : payload?.data ?? [];
                setTranscations(rows);
            })
            .catch((err: any) => console.error(err));

        api
            .get(`/api/category/?userId=${userId}`, {
                headers: { Accept: "application/json" },
            })
            .then((res: any) => {
                const cats = res?.data?.data ?? [];
                const opts = cats.map((c: any) => ({ label: c.name, value: c._id }));
                setCategoryOptions(opts);
            })
            .catch((err: any) => console.error("Category fetch failed", err));
            console.log(useDashboard.month);
    }, [,useDashboard.month,useDashboard.year]);

    useEffect(() => {
        setLoadCharts(true);
        const userid = sessionStorage.getItem('id')
        if (!userid) {
            setLoading(false)
            return
        }
        dispatch(fetchAvailableMonths())
        dispatch(fetchFinancialHealth({ month: useDashboard.month, year: useDashboard.year }))
        dispatch(fetchBudgetWiseUsage({ month: useDashboard.month, year: useDashboard.year }))
        dispatch(fetchPredict())
        dispatch(fetchAlerts());
        dispatch(fetchMonthlyTrend({ month: useDashboard.month, year: useDashboard.year }))
        dispatch(fetchCategorySpending({ month: useDashboard.month, year: useDashboard.year }))
        dispatch(fetchTotals({ month: useDashboard.month, year: useDashboard.year }))
    }, [transcations, dispatch, useDashboard.month, useDashboard.year])

    // Fetch alerts only once on component mount, not on every transaction change
    useEffect(() => {
        const userid = sessionStorage.getItem('id')
        if (userid) {
            dispatch(fetchAlerts())
        }
    }, [dispatch])


    useEffect(() => {
        if (alerts && currentAlertIndex !== null && alerts[currentAlertIndex]) {
            const a = alerts[currentAlertIndex];
            acceptRef.current = a._id.toString();
            confirm("top-left", a.message, a.type, a._id);
        }
    }, [currentAlertIndex, alerts]);
    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement)
        const rawTextColor = documentStyle.getPropertyValue('--text-color') || documentStyle.getPropertyValue('--black') || '#111827'
        const rawTextColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || documentStyle.getPropertyValue('--white') || '#6B7280'
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#e5e7eb'

        const alertsData=charts.Alerts??[];
        setAlerts(alertsData);

        if (alertsData.length > 0) {
            setCurrentAlertIndex(0);
        } else {
            setCurrentAlertIndex(null);
        }
        setFiananceHealth({
            label:charts.financialHealth?.label.toString()?charts.financialHealth?.label:"",
            score:charts.financialHealth?.score?charts.financialHealth?.score:0,
            breakdown:charts.financialHealth?.breakdown??{savings:0,stability:0,budget:0,control:0},
            summary:charts.financialHealth?.summary??{
                income:0,
                expense:0,
                savings:0
            }
        })
        const monthsData = charts.monthlyTrend ?? []
        const monthLabels = monthsData.map((e) => Months[e.month - 1])
        const monthTotals = monthsData.map((e) => e.totalSpent)
        const monthlyDataObj = {
            labels: monthLabels,
            datasets: [
                {
                    label: 'Expenses',
                    data: monthTotals,
                    fill: true,
                    borderColor: documentStyle.getPropertyValue('--blue-500'),
                    tension: 0.4,
                },
            ],
        }
        const monthlyOptionsObj = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: { labels: { color: rawTextColor } },
            },
            scales: {
                x: { ticks: { color: rawTextColorSecondary }, grid: { color: surfaceBorder } },
                y: { ticks: { color: rawTextColorSecondary }, grid: { color: surfaceBorder } },
            },
        }

        setChartMontlyData(monthlyDataObj)
        setChartMonthlyOptions(monthlyOptionsObj)
    
        const spending = charts.categorySpending ?? []
        const labels = spending.map((s) => s.category)
        const values = spending.map((s) => Number(s.total) || 0)
        const palette = [
            documentStyle.getPropertyValue('--blue-500') || '#3b82f6',
            documentStyle.getPropertyValue('--green-500') || '#10b981',
            documentStyle.getPropertyValue('--yellow-500') || '#f59e0b',
            documentStyle.getPropertyValue('--red-500') || '#ef4444',
            documentStyle.getPropertyValue('--indigo-500') || '#6366f1',
            documentStyle.getPropertyValue('--amber-500') || '#f59e0b',
        ]
            .map((c) => c.trim())
            .filter(Boolean)

        const backgroundColors = values.map((_, i) => palette[i % palette.length] || '#3b82f6')

        const barDataObj = {
            labels,
            datasets: [
                {
                    label: 'Category Spending',
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors,
                    data: values,
                },
            ],
        }

        const barOptionsObj = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: { labels: { color: rawTextColor.trim() || '#111827' } },
            },
            scales: {
                x: {
                    ticks: { color: rawTextColorSecondary.trim() || '#6B7280', font: { weight: 500 } },
                    grid: { display: false, drawBorder: false },
                },
                y: { ticks: { color: rawTextColorSecondary.trim() || '#6B7280' }, grid: { color: surfaceBorder, drawBorder: false } },
            },
        }

        setChartBarData(barDataObj)
        setChartBarOptions(barOptionsObj)
      
        const totalsState = charts.totals ?? { income: 0, expense: 0 }
        const doughnutData = {
            labels: ['Income', 'Expense'],
            datasets: [
                {
                    data: [totalsState.income, totalsState.expense],
                    backgroundColor: [documentStyle.getPropertyValue('--blue-500') || '#3b82f6', documentStyle.getPropertyValue('--yellow-500') || '#f59e0b'],
                    hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400') || '#60a5fa', documentStyle.getPropertyValue('--yellow-400') || '#fbbf24'],
                },
            ],
        }

        const doughnutOptions = {
            plugins: { legend: { labels: { usePointStyle: true, color: rawTextColor.trim() || '#111827' } } },
            maintainAspectRatio: false,
        }

        setChartData(doughnutData)
        setChartOptions(doughnutOptions)

        setPredictExpense(charts.predictExpense ?? null)
        setDataLoaded(true)
    }, [charts])

    // Enforce minimum 3-second loading time
    useEffect(() => {
        const timer = setTimeout(() => {
            setMinLoadingTimeReached(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // Set loading to false only when both conditions are met
    useEffect(() => {
        if (dataLoaded && minLoadingTimeReached) {
            setLoading(false);
        }
    }, [dataLoaded, minLoadingTimeReached]);

    useEffect(() => {
        if (charts.availableMonths && charts.availableMonths.length > 0 && !isInitialized) {
            // Extract unique months and years from available months
            const uniqueMonthsSet = new Set(charts.availableMonths.map(m => m.month));
            const uniqueYearsSet = new Set(charts.availableMonths.map(m => m.year));
            
            const monthOpts = Array.from(uniqueMonthsSet).sort().map(month => ({
                label: Months[month - 1],
                value: month
            }));
            
            const yearOpts = Array.from(uniqueYearsSet).sort((a, b) => b - a).map(year => ({
                label: String(year),
                value: year
            }));
            
            setDynamicMonthOptions(monthOpts);
            setDynamicYearOptions(yearOpts);

            // Auto-select current month and year only on first load
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();

            if (uniqueMonthsSet.has(currentMonth) && uniqueYearsSet.has(currentYear)) {
                useDashboard.setMonth(currentMonth);
                useDashboard.setYear(currentYear);
            } else if (monthOpts.length > 0 && yearOpts.length > 0) {
                // Fallback to first available month and year
                useDashboard.setMonth(monthOpts[monthOpts.length - 1].value);
                useDashboard.setYear(yearOpts[0].value);
            }

            setIsInitialized(true);
        }
    }, [charts.availableMonths, isInitialized, useDashboard]);

    useEffect(() => {
     
        const allDataLoaded = 
            charts.financialHealth && 
            charts.categorySpending &&
            charts.totals &&
            charts.monthlyTrend &&
            charts.Alerts !== undefined;
        
        if (allDataLoaded) {
            setDataLoaded(true);
        }
        setLoadCharts(false);
    }, [charts.financialHealth, charts.categorySpending, charts.totals, charts.monthlyTrend, charts.Alerts]);
      const DisplayDate = useMemo(() => {
            let ShowDate = currentMonth;
            if(useDashboard.month !== -1)
            {
                const monthName = dynamicMonthOptions.at(useDashboard.month - 1)?.label?.toString() || "";
                ShowDate = monthName ? `${monthName} ${useDashboard.year!=-1?useDashboard.year:new Date().getFullYear()}` : currentMonth;
            }
            return ShowDate;
        }, [useDashboard.month, useDashboard.year, currentMonth, dynamicMonthOptions]);

      const getHealthColor = () => {
            const label = fiananceHealth.label.toLowerCase();
            if(label === "excellent") return "text-green-600 dark:text-green-400";
            if(label === "good") return "text-blue-600 dark:text-blue-400";
            if(label === "average") return "text-yellow-600 dark:text-yellow-400";
            if(label === "poor") return "text-red-600 dark:text-red-400";
            return "text-gray-600 dark:text-gray-400";
        }
        useEffect(()=>{
            console.log(loadCharts);
        },
    [loadCharts])

    return (
        <div className="flex flex-col items-center w-full min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4">
            <Toast ref={toast} />
            {loading && (
                <div className="w-full max-w-7xl fixed top-0 left-0 right-0 z-50">
                    <ProgressBar value={100} showValue={false} style={{ height: '4px' }} className="bg-indigo-500" />
                </div>
            )}
            <div className={`w-full max-w-7xl mt-8 transition-all duration-300 ${loading ? 'opacity-60 pointer-events-none blur-sm' : 'opacity-100'}`}>
                {/* Title & Health Section */}
                <div className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Overview · {DisplayDate}</p>
                    {fiananceHealth.label && (transcations.length > 0 || loading) && (
                        <div className="inline-block px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800">
                            <p className={`text-sm font-semibold ${getHealthColor()}`}>
                                Financial Health: {fiananceHealth.label} ({fiananceHealth.score}/100)
                            </p>
                        </div>
                    )}
                </div>

                {/* Controls Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-lg shadow-sm border border-gray-200/50 dark:border-slate-700/50">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Dropdown
                            disabled={loading}
                            options={dynamicMonthOptions}
                            optionLabel="label"
                            optionValue="value"
                            value={useDashboard.month}
                            onChange={(e: any) => useDashboard.setMonth(e.value)}
                            placeholder="Select Month"
                            className="w-full sm:w-40 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                        />
                        <Dropdown
                            disabled={loading}
                            options={dynamicYearOptions}
                            optionLabel="label"
                            optionValue="value"
                            value={useDashboard.year}
                            onChange={(e: any) => useDashboard.setYear(e.value)}
                            placeholder="Select Year"
                            className="w-full sm:w-40 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                        />
                    </div>
                    <SelectButton
                        options={options}
                        value={dashboardView}
                        onChange={(e: any) => setDashboardView(e.value)}
                        className="w-full lg:w-auto"
                    />
                </div>
                <ConfirmDialog
                group="headless"
                content={({ headerRef, contentRef, footerRef, hide, message }) => (
                    
                    <div className="flex flex-col items-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-white max-w-md mx-auto">
                        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-white -mt-12 shadow-xl">
                          <img src={AlertGif} />
                        </div>
                        <span className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white block" ref={headerRef as unknown as Ref<HTMLSpanElement>}>
                            {message.header}
                        </span>
                        <p className="mt-2 text-sm text-center text-gray-600 dark:text-white  px-4" ref={contentRef as unknown as Ref<HTMLParagraphElement>}>
                            {message.message}
                        </p>
                        <div className="flex items-center gap-3 mt-6" ref={footerRef as unknown as Ref<HTMLDivElement>}>
                            <button
                                onClick={async (event) => {
                                    hide(event);
                                    try {
                                        await accepted(acceptRef.current);
                                    } catch (err) {
                                        console.error(err);
                                    }
                                    // advance to next alert
                                    setCurrentAlertIndex((prev) => {
                                        if (prev === null) return null;
                                        const next = prev + 1;
                                        return next < alerts.length ? next : null;
                                    });
                                }}
                                className="px-5 py-3 rounded-md text-green-600 hover:bg-green-500 dark:hover:bg-black hover:text-white dark:text-green-500 font-medium shadow-sm transition-colors border border-green-500"
                            >
                                Got it
                            </button>
                            <Button
                                label="Remind Again"
                                outlined
                                onClick={(event) => {
                                    hide(event);
                                    reject();
                                    setCurrentAlertIndex((prev) => {
                                        if (prev === null) return null;
                                        const next = prev + 1;
                                        return next < alerts.length ? next : null;
                                    });
                                }}
                                className="px-5 py-2 rounded-md"
                            />
                        </div>
                    </div>
                )}
            />
            {transcations.length === 0 && (!loading||!isInitialized) ? (
                <div className="w-full flex items-center justify-center py-20">
                    <Card className="p-8 shadow-md rounded-lg text-center max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-200/50 dark:border-slate-700/50">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">No transactions available for the selected month. Please choose another month or year.</p>
                    </Card>
                </div>
            ) : dashboardView === "Financial Overview" ? (
                <div className="space-y-6">
                    <SummaryCard transcations={transcations} loading={loading} setTranscation={setTranscations} setLoading={setLoading} predictExpense={predictExpense} />

                    <IncomeExpense transcations={transcations} loading={loading} setTranscation={setTranscations} chartData={chartData} chartOptions={chartOptions} categoryOptions={categoryOptions} breakdown={fiananceHealth.breakdown} summary={fiananceHealth.summary} />
                    
                    <CategorySpending loading={loading} chartBarData={chartBarData} chartBarOptions={chartBarOptions} categoryOptions={categoryOptions} chartMonthlyData={chartMonthlyData} chartMonthlyOptions={chartMonthlyOptions} transcations={transcations} setTranscation={setTranscations} />

                    <Card className="p-6 shadow-sm rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
                        {recentTransactions.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No recent transactions</p>
                        ) : (
                            <div className="space-y-2">
                                {recentTransactions.map((t) => (
                                    <div key={t._id} className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded transition-colors">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{t.description ?? t.category?.name ?? 'No description'}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.date ? new Date(t.date).toLocaleDateString() : ''}</div>
                                        </div>
                                        <div className={t.type === 'expense' ? 'text-red-600 dark:text-red-400 font-semibold text-sm' : 'text-green-600 dark:text-green-400 font-semibold text-sm'}>
                                            {t.amount ? t.amount.toLocaleString('en-US', { style: 'currency', currency: 'INR' }) : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            ) : dashboardView == "Budget Overview" ? (
                <div>
                    <BudgetMeters loading={loading} charts={charts} />
                </div>
            ) : (
                <Card className="p-6 shadow-sm rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Transactions</h3>
                    <Transcation transcations={transcations} setTranscations={setTranscations} />
                </Card>
            )}
            </div>

            {/* Fixed Arturo Chat Button */}
            <button
                onClick={() => window.location.href = '/chat'}
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group z-40 dark:from-indigo-600 dark:to-purple-700"
                title="Ask Arturo for Advice"
                aria-label="Ask Arturo"
            >
                <div className="absolute inset-0 rounded-full bg-linear-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-40 blur-xl transition-opacity"></div>
                <img src={ArturoGif} alt="Arturo" className="w-10 h-10 rounded-full relative z-10 object-cover" />
                <span className="absolute -top-10 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded-md bg-black text-white whitespace-nowrap">Ask Arturo</span>
            </button>
        </div>
    );
};

export default DashboardL;