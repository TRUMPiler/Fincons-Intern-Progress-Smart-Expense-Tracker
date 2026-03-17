import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/axiosInstance'
import { createContext } from 'react';

export type SpendingCategory = { total: number; category: string }
export type MonthTrend = { totalSpent: number; month: number; year: number }
export type Totals = { income: number; expense: number }
export type AvailableMonth = { month: number; year: number }
export type DashboardProps={month:number,year:number};
export type Alert = { _id: string, message: string, type: "budget_exceeded" | "overspending", isRead: boolean };
const getCategoryId = (cat: any) => typeof cat === "string" ? cat : cat?._id ?? cat?.id ?? "";
const getCategoryName = (cat: any) => typeof cat === "object" && cat ? cat.name ?? cat.label : "";

export interface DashboardContextType extends DashboardProps {
    setMonth: (m: number) => void;
    setYear: (y: number) => void;
}
export const DashboardContext = createContext<DashboardContextType>({
    month: 0,
    year: 0,
    setMonth: () => {},
    setYear: () => {}
});
export type breakdown={
    savings:number;
    budget: number;
    control: number;
    stability: number;
}
export type summary={
    income: number;
    expense: number;
    savings: number;
}
export interface FinancialHealth{
     score: number;
     label: string;
    breakdown:breakdown;
    summary:summary;
}
// (method) ChartService.getFinancialHealthScore(userId: any, month: any, year: any): Promise<{
//     score: number;
//     label: any;
//     breakdown: {
//         savings: number;
//         budget: number;
//         control: number;
//         stability: number;
//     };
//     summary: {
//         income: number;
//         expense: number;
//         savings: number;
//     };
type BudgetProp = {
    _id: string;
    categoryId?: string; 
    categoryName?: string;
    month: number;
    year: number;
    limit: number;
    spent?: number;
    remaining?: number;
};
// type CategoryOption = { label: string; value: string; };
interface ChartsState {
    categorySpending: SpendingCategory[]
    monthlyTrend: MonthTrend[]
    predictExpense: number | null
    totals: Totals,
    budget: BudgetProp[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null,
    Alerts:Alert[],
    financialHealth:FinancialHealth|null,
    availableMonths: AvailableMonth[]
}

const initialState: ChartsState = {
    categorySpending: [],
    monthlyTrend: [],
    predictExpense: null,
    totals: { income: 0, expense: 0 },
    status: 'idle',
    error: null,
    budget: [],
    Alerts:[],
    financialHealth:null,
    availableMonths: [],
}
export const fetchAlerts = createAsyncThunk<Alert[], void, { rejectValue: string }>("charts/alerts",
    async (_, thunkAPI) => {
        try {
            console.log("fetch called");
            const userid = sessionStorage.getItem("id");

            if (!userid) return thunkAPI.rejectWithValue("No user id");
            const res=await api.get(`/api/alert/`+userid,{
                headers:{
                    "Accept":"application/json"
                }
            });
            console.log(res);
            return res.data.data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(
                err?.response?.data?.message ?? err.message ?? String(err)
            );
        }
    })

export const fetchBudgetWiseUsage = createAsyncThunk<
    BudgetProp[],
    DashboardProps | undefined,
    { rejectValue: string }
>(
    "charts/fetchBudgetWise",
    async (payload, thunkApi) => {
        try {
            const userid = sessionStorage.getItem("id");
            const month = payload?.month==-1?0:payload?.month;
            const year = payload?.year==-1?0:payload?.year;
            if (!userid) return thunkApi.rejectWithValue("No user id");
            
            const response = await api.get(
                `/api/budget/?userId=${userid}&month=${month}&year=${year}`
            );

            const fetchedBudgets = response?.data?.data ?? [];

            if (!Array.isArray(fetchedBudgets) || fetchedBudgets.length === 0) {
                return [];
            }

            const result: BudgetProp[] = await Promise.all(
                fetchedBudgets.map(async (budget: any) => {
                    const categoryId = getCategoryId(budget.categoryId);
                    const categoryName =
                        getCategoryName(budget.categoryId) || budget.categoryName;

                    try {
                        const { data } = await api.get(
                            `/api/budget/usage`,
                            {
                                params: {
                                    userId: userid,
                                    categoryId,
                                    month: budget.month + 1,
                                    year: budget.year,
                                }
                            }
                        );

                        return {
                            ...budget,
                            categoryId,
                            categoryName,
                            spent: data?.data?.spent ?? 0,
                            remaining: data?.data?.remaining ?? budget.limit,
                        };
                    } catch (err) {
                        console.error("Budget usage fetch failed", err);

                        return {
                            ...budget,
                            categoryId,
                            categoryName,
                            spent: 0,
                            remaining: budget.limit,
                        };
                    }
                })
            );

            return result;
        } catch (err: any) {
            return thunkApi.rejectWithValue(
                err?.response?.data?.message ?? err.message ?? String(err)
            );
        }
    }
);

export const fetchCategorySpending = createAsyncThunk<SpendingCategory[], DashboardProps | undefined, { rejectValue: string }>(
    'charts/fetchCategorySpending',
    async (payload, thunkAPI) => {
        try {
            const userid = sessionStorage.getItem('id')
            if (!userid) return thunkAPI.rejectWithValue('No user id')
            const month = payload?.month === -1 ? 0 : payload?.month;
            const year = payload?.year === -1 ? 0 : payload?.year;
            const res = await api.get(`/api/charts/cspending/${userid}`, {
                headers: { Accept: 'application/json' },
                params: { month, year }
            })
            return res.data?.data ?? []
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err?.response?.data?.message ?? err.message ?? String(err))
        }
    }
)

export const fetchMonthlyTrend = createAsyncThunk<MonthTrend[], DashboardProps|null, { rejectValue: string }>(
    'charts/fetchMonthlyTrend',
    async (payload, thunkAPI) => {
        try {
            const userid = sessionStorage.getItem('id')
            if (!userid) return thunkAPI.rejectWithValue('No user id')
                console.log(payload?.month);
            console.log(payload?.year);
            const res = await api.get(`/api/charts/monthlytrend/${userid}?month=${payload?.month}&year=${payload?.year}`, {
                headers: { Accept: 'application/json' },
            })
            return res.data?.data ?? []
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err?.response?.data?.message ?? err.message ?? String(err))
        }
    }
)
export const fetchFinancialHealth=createAsyncThunk<FinancialHealth,DashboardProps|null,{rejectValue:string}>(
    'charts/fetchFinancialHealth',
    async(payload,thunkAPI)=>{
         try {
            const userid = sessionStorage.getItem('id')
            if (!userid) return thunkAPI.rejectWithValue('No user id')
            const res = await api.get(`/api/charts/healthUpdate/?userId=${userid}&month=${payload?.month}&year=${payload?.year}`, {
                headers: { Accept: 'application/json' },
            })
            return res.data.data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err?.response?.data?.message ?? err.message ?? String(err))
        }
    }
)
export const fetchPredict = createAsyncThunk<number | null, void, { rejectValue: string }>(
    'charts/fetchPredict',
    async (_, thunkAPI) => {
        try {
            const userid = sessionStorage.getItem('id')
            if (!userid) return thunkAPI.rejectWithValue('No user id')
            const res = await api.get(`/api/charts/predict/${userid}`, {
                headers: { Accept: 'application/json' },
            })

            return res.data?.data?.data ?? res.data?.data ?? null
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err?.response?.data?.message ?? err.message ?? String(err))
        }
    }
)

export const fetchTotals = createAsyncThunk<Totals, DashboardProps | undefined, { rejectValue: string }>(
    'charts/fetchTotals',
    async (payload, thunkAPI) => {
        try {
            const userid = sessionStorage.getItem('id')
            if (!userid) return thunkAPI.rejectWithValue('No user id')
            const month = payload?.month === -1 ? 0 : payload?.month;
            const year = payload?.year === -1 ? 0 : payload?.year;
            const res = await api.get(`/api/charts/${userid}`, {
                headers: { Accept: 'application/json' },
                params: { month, year }
            })
            const data = res.data?.data ?? res.data
            return {
                income: data?.totals?.income ?? 0,
                expense: data?.totals?.expense ?? 0,
            }
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err?.response?.data?.message ?? err.message ?? String(err))
        }
    }
)

export const fetchAvailableMonths = createAsyncThunk<AvailableMonth[], void, { rejectValue: string }>(
    'charts/fetchAvailableMonths',
    async (_, thunkAPI) => {
        try {
            const userid = sessionStorage.getItem('id')
            if (!userid) return thunkAPI.rejectWithValue('No user id')
            const res = await api.get(`/api/charts/months/${userid}`, {
                headers: { Accept: 'application/json' },
            })
            return res.data?.data ?? []
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err?.response?.data?.message ?? err.message ?? String(err))
        }
    }
)

const chartsSlice = createSlice({
    name: 'charts',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategorySpending.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchCategorySpending.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.categorySpending = action.payload
            })
            .addCase(fetchCategorySpending.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload ?? 'Failed to fetch category spending'
            })

            .addCase(fetchMonthlyTrend.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchMonthlyTrend.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.monthlyTrend = action.payload
            })
            .addCase(fetchMonthlyTrend.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload ?? 'Failed to fetch monthly trend'
            })

            .addCase(fetchPredict.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchPredict.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.predictExpense = action.payload as number | null
            })
            .addCase(fetchPredict.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload ?? 'Failed to fetch prediction'
            })

            .addCase(fetchTotals.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchTotals.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.totals = action.payload
            })
            .addCase(fetchTotals.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload ?? 'Failed to fetch totals'
            })
            .addCase(fetchBudgetWiseUsage.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchBudgetWiseUsage.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.budget = action.payload
            })
            .addCase(fetchBudgetWiseUsage.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload ?? 'Failed to fetch totals'
            }).addCase(fetchAlerts.pending,(state)=>{
                state.status='loading';
            }).addCase(fetchAlerts.fulfilled,(state,action)=>{

                state.Alerts=action.payload??[];
            }).addCase(fetchAlerts.rejected,(state,action)=>{
                state.status="failed";
                state.error=action.payload??"Failed to Fetch Alerts"
            })
            .addCase(fetchFinancialHealth.pending,(state)=>{
                state.status='loading';
            })
            .addCase(fetchFinancialHealth.fulfilled,(state,action)=>{
                state.status='succeeded';
                state.financialHealth=action.payload??null;
            })
            .addCase(fetchFinancialHealth.rejected,(state,action)=>{
                state.status="failed";
                state.error=action.payload??"Failed to Fetch Financial Health"
            })
            .addCase(fetchAvailableMonths.pending,(state)=>{
                state.status='loading';
            })
            .addCase(fetchAvailableMonths.fulfilled,(state,action)=>{
                state.status='succeeded';
                state.availableMonths=action.payload??[];
            })
            .addCase(fetchAvailableMonths.rejected,(state,action)=>{
                state.status="failed";
                state.error=action.payload??"Failed to Fetch Available Months"
            });
    },
})

export default chartsSlice.reducer
