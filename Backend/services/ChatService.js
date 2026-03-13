import Chat from "../models/chats.js";
import user from "../models/user.js";
import mongoose from "mongoose";
import AiInteraction from "../ai/AiInteraction.js";
import Transaction from "../models/Transaction.js";
import ChartsService from "./ChartsService.js";


class ChatService {
    async ChatIntialization(userId) {
        try {
            const userData = await user.findOne({ _id: userId });
            if (!userData) {
                const err = new Error("User Doesn't Exists");
                err.statusCode = 404;
                throw err;
            }

            const data = await AiInteraction.ChatIntialization(userData.name);
            console.log('raw ai reply:', data);

            const sanitized = data;
            const finalContent = sanitized && sanitized.length > 0 ? sanitized : `Hello ${userData.name}, how can I help you today?`;

            const chatData = new Chat({
                content: finalContent,
                role: "Model",
                userId: new mongoose.Types.ObjectId(userData._id),
                isStart: true,
                isDeleted: false
            });

            await chatData.save();

            return chatData;
        }
        catch (error) {
            throw error;
        }
    }
    async GetChats(userId) {
        console.log("invoked");
        try {
            const chatData = await Chat.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: 1 });
            
            return chatData ?? [];
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
    async SendChat(userId, message) {
        try {

            const userData = await user.findOne({ _id: userId });
            if (!userData) {
                const err = new Error("User Doesn't Exists");
                err.statusCode = 404;
                throw err;
            }

            const userObjId = new mongoose.Types.ObjectId(userId);

        
            const userMessage = new Chat({
                content: String(message),
                role: "User",
                userId: userObjId,
                isStart: false,
                isDeleted: false
            });
            await userMessage.save();

            const allChats = await Chat.find({ userId: userObjId }).sort({ createdAt: 1 });
            const conversationHistory = allChats.map((c) => ({
                role: (String(c.role).toLowerCase() === 'model' ? 'assistant' : 'user'),
                content: String(c.content)
            }));


            const transactionsData = await ChartsService.CategorywiseSpendingChart(userId).catch(() => null);
            const IncomeExpense=await ChartsService.IncomeExpense(userId).catch(()=>null);

            const aiReply = await AiInteraction.ChatComplete(conversationHistory, message, transactionsData,IncomeExpense);

            const modelMessage = new Chat({
                content: aiReply || `Hello ${userData.name}, I couldn't process that right now.`,
                role: "Model",
                userId: userObjId,
                isStart: false,
                isDeleted: false
            });
            await modelMessage.save();

            const updated = await Chat.find({ userId: userId }).sort({ createdAt: 1 });
            return updated;

        } catch (error) {
            throw new Error(error);
        }
    }

}

export default new ChatService();