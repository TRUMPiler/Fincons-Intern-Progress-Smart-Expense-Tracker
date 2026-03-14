import type { FC } from "react";
import AIImage from '../assets/Ai Image.gif';
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useEffect, useState, useRef } from "react";
import { fetchChats, fetchFirstChat, sendChat } from "../store/slices/aiChatSlice";

const Chats: FC = () => {
    const dispatch = useAppDispatch();
    const chats = useAppSelector((s) => s.chats.chats);
    const firstChat = useAppSelector((s) => s.chats.Firstchat);
    const status = useAppSelector((s) => s.chats.status);
    const [message, setMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const userName = typeof window !== 'undefined' ? (sessionStorage.getItem('name') || 'You') : 'You';

    useEffect(() => {
        dispatch(fetchChats()).then((res: any) => {
            const payload = res.payload ?? [];
            if (!payload || payload.length === 0) {
                dispatch(fetchFirstChat()).then(() => dispatch(fetchChats()));
            }
        });
    }, [dispatch]);

    useEffect(() => {
        if (scrollRef.current) {
            try {
                scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            } catch (e) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [chats, firstChat, status]);

    const handleSend = async () => {
        if (!message.trim()) return;
        try {
            await dispatch(sendChat({ message })).unwrap();
            setMessage("");
        } catch (err) {
            console.error('Send failed', err);
        }
    };

    const onKeyDown = (e: any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const messages = (chats && chats.length > 0 ? chats : (firstChat ? [firstChat] : []));

    return (
        <div className="flex flex-col h-screen   bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm mt-9">
                <div className="flex items-center gap-3">
                    <img src={AIImage} alt="AI" className="w-10 h-10 rounded-full" />
                    <div>
                        <div className="font-semibold">Arturo</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Personal finance assistant</div>
                    </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{status === 'loading' ? 'Thinking...' : ''}</div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((c: any) => {
                    const role = String(c.role ?? '').toLowerCase();
                    const isModel = role === 'model' || role === 'ai' || role === 'assistant';
                    const time = c.date ? new Date(c.date).toLocaleString() : '';
                    return (
                        <div key={c._id} className={`flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
                            {isModel && (
                                <img src={AIImage} alt="AI" className="w-9 h-9 rounded-full flex-shrink-0" />
                            )}

                            <div className={`max-w-[80%] md:max-w-[60%] p-3 rounded-lg shadow-sm break-words whitespace-pre-wrap ${isModel ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'bg-indigo-600 dark:bg-indigo-500 text-white'}`}>
                                {isModel && <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Arturo</div>}
                                <div className="text-sm leading-6">{c.content}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">{time}</div>
                            </div>

                            {!isModel && (
                                <div className="flex items-center">
                                    <div className="hidden md:flex md:items-center md:justify-center w-9 h-9 rounded-full bg-indigo-500 text-white font-semibold">{(userName || 'Y')[0].toUpperCase()}</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Ask Arturo about your expenses..."
                        rows={1}
                        className="flex-1 resize-none min-h-[44px] max-h-36 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button onClick={handleSend} disabled={!message.trim()} className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l14-8v8l-14 8v-8z" />
                        </svg>
                        <span className="sr-only">Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chats;