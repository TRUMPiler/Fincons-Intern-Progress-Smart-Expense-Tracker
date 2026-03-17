import { useEffect, type FC } from "react";
import Chats from "../components/Chats";

const Chat: FC = () => {
    useEffect(()=>{
        if(!sessionStorage.getItem("id"))
        {
            window.location.href="/login";
        }

    },[])
    return <Chats />;
}

export default Chat;