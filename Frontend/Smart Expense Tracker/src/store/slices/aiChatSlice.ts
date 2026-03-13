import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export interface AiChat {
    _id: string;
    content?: string;
    role: string;
    isStart: boolean;
    userId: string;
    isDeleted: boolean;
}
export type ChatState = {
    Firstchat: AiChat | undefined;
    chats: AiChat[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
     error: string | null;
}

const initialState: ChatState = {
    Firstchat: undefined,
    chats: [],
    status: 'idle',
    error:null,
}

export const fetchFirstChat = createAsyncThunk<AiChat, void, { rejectValue: string }>("chat/intialchat",
    async (_, thunkAPI) => {
        try {
            const jwt = sessionStorage.getItem("jwtToken");
            const userid = sessionStorage.getItem("id");
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/chats/first/` + userid, {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            });
            return res.data.data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(
                err?.response?.data?.message ?? err.message ?? String(err)
            );
        }
    }
);

export const fetchChats = createAsyncThunk<AiChat[], void, { rejectValue: string }>("chat/fetchChats",
    async (_, thunkAPI) => {
        try {
            const jwt = sessionStorage.getItem("jwtToken");
            const userid = sessionStorage.getItem("id");
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/chats/` + userid, {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            });
            return res.data.data ?? [];
        } catch (err: any) {
            return thunkAPI.rejectWithValue(
                err?.response?.data?.message ?? err.message ?? String(err)
            );
        }
    }
);

export const sendChat = createAsyncThunk<AiChat[], { message: string }, { rejectValue: string }>("chat/send",
    async (payload, thunkAPI) => {
        try {
            const jwt = sessionStorage.getItem("jwtToken");
            const userid = sessionStorage.getItem("id");
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chats/`, { userId: userid, message: payload.message }, {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            });
            return res.data.data ?? [];
        } catch (err: any) {
            return thunkAPI.rejectWithValue(
                err?.response?.data?.message ?? err.message ?? String(err)
            );
        }
    }
);

const chatSlice = createSlice({
    name: "chats",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFirstChat.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchFirstChat.fulfilled,(state,action)=>{
                state.status="succeeded";
                state.Firstchat=action.payload??undefined;
            })
            .addCase(fetchFirstChat.rejected,(state,action)=>{
                state.status="failed";
                state.error=action.payload??"Failed to Fetch Data";
            })
            .addCase(fetchChats.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchChats.fulfilled, (state, action) => { state.status = 'succeeded'; state.chats = action.payload ?? []; })
            .addCase(fetchChats.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload ?? 'Failed to fetch chats'; })
            .addCase(sendChat.pending, (state) => { state.status = 'loading'; })
            .addCase(sendChat.fulfilled, (state, action) => { state.status = 'succeeded'; state.chats = action.payload ?? []; })
            .addCase(sendChat.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload ?? 'Failed to send message'; })
    }
});

export default chatSlice.reducer