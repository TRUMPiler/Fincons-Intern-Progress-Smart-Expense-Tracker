import { configureStore } from '@reduxjs/toolkit'
import chartsReducer from './slices/chartsSlice'
import chatReducer from './slices//aiChatSlice.ts';
const store = configureStore({
  reducer: {
    charts: chartsReducer,
    chats:chatReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
