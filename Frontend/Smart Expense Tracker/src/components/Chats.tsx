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
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

    return (
        <div className="h-screen flex flex-col bg-white mt-7">
            <div className="flex-1 overflow-y-auto px-4 " >
                {/* <div className="flex items-center mb-4">
                    <img className="w-10 h-10 rounded-full mr-3" src={AIImage} alt="AI Avatar" />
                    <div className="font-medium">Model</div>
                </div> */}

                <div className="space-y-4">

                    {(chats && chats.length > 0 ? chats : (firstChat ? [firstChat] : [])).map((c) => (
                        <>
                            <div key={c._id} className={c.role === 'Model' || c.role === 'model' ? 'bg-black text-white rounded-lg p-4 shadow max-w-2xl' : 'bg-blue-500 text-white rounded-lg p-3 shadow ml-auto max-w-2xl'}>
                              {c.role=="Model"&&(<div className="flex items-center mb-4">
                                    <img className="w-10 h-10 rounded-full mr-3" src={AIImage} alt="AI Avatar" />
                                    <div className="font-medium">Arturo</div>
                                </div>)}
                                
                                {c.content}
                            </div>
                        </>
                    ))}
                </div>
            </div>

            <div className="bg-gray-100 px-4 py-3">
                <div className="flex items-center">
                    <input value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border rounded-full py-2 px-4 mr-2" type="text" placeholder="Type your message..." />
                    <button onClick={handleSend} className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chats;