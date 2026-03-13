import { useEffect,  useRef, useState, type FC } from "react";
import Transcation from "../components/Transactions";
import { Card } from "primereact/card";

import axios from "axios";
import AlertGif from "../assets/downloadAlert.gif";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAlerts, fetchBudgetWiseUsage, fetchCategorySpending, fetchMonthlyTrend, fetchPredict, fetchTotals, type Alert } from "../store/slices/chartsSlice";

import { Toast } from "primereact/toast";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import SummaryCard from "../components/SummaryCard";
import IncomeExpense from "../components/IncomeExpense";
import CategorySpending from "../components/CategorySpending";
import BudgetMeters from "../components/BudgetMeters";

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
    const [chartOptions, setChartOptions] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [predictExpense, setPredictExpense] = useState<number | string | null>(0);
    const [categoryOptions, setCategoryOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [chartBarData, setChartBarData] = useState({});
    const [chartMonthlyData, setChartMontlyData] = useState({});
    const [chartBarOptions, setChartBarOptions] = useState({});
    const [chartMonthlyOptions, setChartMonthlyOptions] = useState({});
    const [alerts,setAlerts]=useState<Alert[]>([]);
    const [currentAlertIndex, setCurrentAlertIndex] = useState<number | null>(null);
    const dispatch = useAppDispatch();
    let acceptRef=useRef<string>('');
    const charts = useAppSelector((s) => s.charts);
    const currentMonth = new Date().toLocaleString(undefined, { month: "long", year: "numeric" });
    const toast=useRef<Toast|null>(null);
    const accepted = async (alertid:string) => {
        try{
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/alert/`+alertid,{},{
                headers:{
                    Authorization:`Bearer ${sessionStorage.getItem("jwtToken")}`
                }
            });
            if(response.status==200)
            {
                 toast.current?.show({ severity: 'info', summary: 'Alert Closed', detail: "You won't be alerted again", life: 3000 });
            }
            return response;
        }catch(err){
            console.error('Failed to mark alert read', err);
            throw err;
        }
    }

    const reject = () => {
        toast.current?.show({ severity: 'warn', summary: 'Remind Again', detail: 'You will Reminded again about this', life: 3000 });
    }
    const confirm = (position:any,message:string,header:string,alertid:string) => {
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
            position,
           // we use custom content buttons, so accept/reject callbacks here are optional
            accept:()=>accepted(alertid),
            reject
        });
    };
  
    useEffect(() => {
        const JwtToken = sessionStorage.getItem("jwtToken");
        const userId = sessionStorage.getItem("id");
        if (!userId) {
            window.location.href = "/login";
            return;
        }

        axios
            .get(`${import.meta.env.VITE_BACKEND_URL}/api/transcation/${userId}`, {
                headers: { Accept: "application/json", Authorization: `Bearer ${JwtToken}` },
            })
            .then((response) => {
                const payload = response.data as any;
                const rows: TranscationType[] = Array.isArray(payload) ? payload : payload?.data ?? [];
                setTranscations(rows);
            })
            .catch((err) => console.error(err));

        axios
            .get(`${import.meta.env.VITE_BACKEND_URL}/api/category/?userId=${userId}`, {
                headers: { Authorization: `Bearer ${JwtToken}` },
            })
            .then((res) => {
                const cats = res?.data?.data ?? [];
                const opts = cats.map((c: any) => ({ label: c.name, value: c._id }));
                setCategoryOptions(opts);
            })
            .catch((err) => console.error("Category fetch failed", err));
    }, []);

    useEffect(() => {
        const userid = sessionStorage.getItem('id')
        if (!userid) {
            setLoading(false)
            return
        }

        dispatch(fetchAlerts())
        dispatch(fetchBudgetWiseUsage())
        dispatch(fetchPredict())
        dispatch(fetchMonthlyTrend())
        dispatch(fetchCategorySpending())
        dispatch(fetchTotals())
    }, [transcations, dispatch])


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

        // budgets are read directly from the charts slice (charts.budget)
        setPredictExpense(charts.predictExpense ?? null)
        setLoading(false)
    }, [charts])
 



    return (
       
        <div className="flex flex-col items-center w-full min-h-screen gap-6 py-8 px-4 bg-gray-200  dark:bg-none dark:bg-black ">
         <Toast ref={toast}/>
            <div className="w-full max-w-7xl  mt-3">
                <div className="flex items-center justify-between mb-6">
            <ConfirmDialog
                group="headless"
                content={({ headerRef, contentRef, footerRef, hide, message }) => (
                    
                    <div className="flex flex-col items-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-white max-w-md mx-auto">
                        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-white -mt-12 shadow-xl">
                          <img src={AlertGif} />
                        </div>
                        <span className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white block" ref={headerRef}>
                            {message.header}
                        </span>
                        <p className="mt-2 text-sm text-center text-gray-600 dark:text-white  px-4" ref={contentRef}>
                            {message.message}
                        </p>
                        <div className="flex items-center gap-3 mt-6" ref={footerRef}>
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
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-indigo-300">Dashboard</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Overview · {currentMonth}</p>
                    </div>
                </div>

               <SummaryCard transcations={transcations} loading={loading} setTranscation={setTranscations} setLoading={setLoading}  predictExpense={predictExpense}/>

                <IncomeExpense transcations={transcations} loading={loading} setTranscation={setTranscations} chartData={chartData} chartOptions={chartOptions} categoryOptions={categoryOptions}/>
                
               <CategorySpending loading={loading} chartBarData={chartBarData} chartBarOptions={chartBarOptions} categoryOptions={categoryOptions} chartMonthlyData={chartMonthlyData} chartMonthlyOptions={chartMonthlyOptions} transcations={transcations} setTranscation={setTranscations} />
               <BudgetMeters loading={loading} charts={charts} chartData={chartData}/>
                <Card className="p-4 shadow rounded-lg dark:border dark:border-white">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 dark:text-white">Transactions</h3>
                    <Transcation transcations={transcations} setTranscations={setTranscations} />
                </Card>
            </div>
        </div>
    );
};

export default DashboardL;