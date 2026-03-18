import ChatService from "../services/ChatService.js";
import Response from "../utils/Response.js";
class ChatController{
    /**
     * Initialize chat conversation for a user.
     * Fetches initial chat data and setup.
     * @async
     * @param {Object} req - Express request object with user id in params
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with initial chat data (200)
     */
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
    /**
     * Retrieve all chat messages for a user.
     * @async
     * @param {Object} req - Express request object with userId in params
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with chats array (200)
     */
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

    /**
     * Send a chat message from user and receive AI response.
     * @async
     * @param {Object} req - Express request object with userId and message in body
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with chat result and AI response (200)
     */
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