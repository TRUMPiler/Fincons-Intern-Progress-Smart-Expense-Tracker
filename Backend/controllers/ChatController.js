import ChatService from "../services/ChatService.js";
import Response from "../utils/Response.js";
class ChatController{
    async FirstChat(req,res,next)
    {
        try{
            const chatData=await ChatService.ChatIntialization(req.params.id);
           res.status(200).json(Response.success(chatData,"First ChatData Sent",200));
          
        }catch(error)
        {
            console.log(error);
            next(error);
        }
    }
    async GetChats(req, res, next) {
        console.log('GetChats called for userId=', req.params.userId);
        try {
            console.log("invoked 2");   
            const chats = await ChatService.GetChats(req.params.userId);
            res.status(200).json(Response.success(chats, "Chats fetched", 200));
        } catch (error) {
             console.log(error);
            next(error);
        }
    }

    async SendChat(req, res, next) {
        console.log('SendChat called, body=', req.body);
        try {
            const { userId, message } = req.body;
            if (!userId || !message) return res.status(400).json(Response.error("userId and message are required", 400));
            const result = await ChatService.SendChat(userId, message);
            res.status(200).json(Response.success(result, "Message sent", 200));
        } catch (error) {
            next(error);
        }
    }
}
export default new ChatController();