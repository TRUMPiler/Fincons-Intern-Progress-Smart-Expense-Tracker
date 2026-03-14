import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export type SpendingCategory = { total: number; category: string }
export type MonthTrend = { totalSpent: number; month: number; year: number }
export type Totals = { income: number; expense: number }
export type Alert = { _id: string, message: string, type: "budget_exceeded" | "overspending", isRead: boolean };
const getCategoryId = (cat: any) => typeof cat === "string" ? cat : cat?._id ?? cat?.id ?? "";
const getCategoryName = (cat: any) => typeof cat === "object" && cat ? cat.name ?? cat.label : "";

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
    Alerts:Alert[]
}

const initialState: ChartsState = {
    categorySpending: [],
    monthlyTrend: [],
    predictExpense: null,
    totals: { income: 0, expense: 0 },
    status: 'idle',
    error: null,
    budget: [],
    Alerts:[]
}
export const fetchAlerts = createAsyncThunk<Alert[], void, { rejectValue: string }>("charts/alerts",
    async (_, thunkAPI) => {
        try {
            console.log("fetch called");
            const jwt = sessionStorage.getItem("jwtToken");
            const userid = sessionStorage.getItem("id");

            if (!userid) return thunkAPI.rejectWithValue("No user id");
            const res=await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/alert/`+userid,{
                headers:{
                    "Accept":"application/json",
                    "Authorization":`Bearer ${jwt}`
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
    void,
    { rejectValue: string }
>(
    "charts/fetchBudgetWise",
    async (_, thunkApi) => {
        try {
            const jwt = sessionStorage.getItem("jwtToken");
            const userid = sessionStorage.getItem("id");

            if (!userid) return thunkApi.rejectWithValue("No user id");

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/budget/${userid}`,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
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
                        const { data } = await axios.get(
                            `${import.meta.env.VITE_BACKEND_URL}/api/budget/usage`,
                            {
                                params: {
                                    userId: userid,
                                    categoryId,
                                    month: budget.month + 1,
                                    year: budget.year,
                                },
                                headers: {
                                    Authorization: `Bearer ${jwt}`,
                                },
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

export const fetchCategorySpending = createAsyncThunk<SpendingCategory[], void, { rejectValue: string }>(
    'charts/fetchCategorySpending',
    async (_, thunkAPI) => {
        try {
            const jwt = sessionStorage.getItem('jwtToken')
            const userid = sessionStorage.getItem('id')
            if (!userid) return thunkAPI.rejectWithValue('No user id')
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/charts/cspending/${userid}`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${jwt}` },
            })
            return res.data?.data ?? []
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err?.response?.data?.message ?? err.message ?? String(err))
        }
    }
)

export const fetchMonthlyTrend = createAsyncThunk<MonthTrend[], void, { rejectValue: string }>(
    'charts/fetchMonthlyTrend',
    async (_, thunkAPI) => {
        try {
            const jwt = sessionStorage.getItem('jwtToken')
            const userid = sessionStorage.getItem('id')
            if (!userid) return thunkAPI.rejectWithValue('No user id')
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/charts/monthlytrend/${userid}`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${jwt}` },
            })
            return res.data?.data ?? []
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err?.response?.data?.message ?? err.message ?? String(err))
        }
    }
)

export const fetchPredict = createAsyncThunk<number | null, void, { rejectValue: string }>(
    'charts/fetchPredict',
    async (_, thunkAPI) => {
        try {
            const jwt = sessionStorage.getItem('jwtToken')
            const userid = sessionStorage.getItem('id')
            if (!userid) return thunkAPI.rejectWithValue('No user id')
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/charts/predict/${userid}`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${jwt}` },
            })

            return res.data?.data?.data ?? res.data?.data ?? null
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err?.response?.data?.message ?? err.message ?? String(err))
        }
    }
)

export const fetchTotals = createAsyncThunk<Totals, void, { rejectValue: string }>(
    'charts/fetchTotals',
    async (_, thunkAPI) => {
        try {
            const jwt = sessionStorage.getItem('jwtToken')
            const userid = sessionStorage.getItem('id')
            if (!userid) return thunkAPI.rejectWithValue('No user id')
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/charts/${userid}`, {
                headers: { Accept: 'application/json', Authorization: `Bearer ${jwt}` },
            })
            const payload = res.data?.data ?? res.data
            return {
                income: payload?.totals?.income ?? 0,
                expense: payload?.totals?.expense ?? 0,
            }
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
            });
    },
})

export default chartsSlice.reducer
