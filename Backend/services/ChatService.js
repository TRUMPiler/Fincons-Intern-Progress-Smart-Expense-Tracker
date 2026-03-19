import Chat from "../models/chats.js";
import user from "../models/user.js";
import mongoose from "mongoose";
import AiInteraction from "../ai/AiInteraction.js";
import Transaction from "../models/Transaction.js";
import ChartsService from "./ChartsService.js";
import Budget from "../models/Budget.js";
import MarketService from "./MarketService.js";

class ChatService {

    /**
     * Initialize chat session for a user with welcome message.
     * Creates first chat message from AI model to user.
     * @async
     * @param {string} userId - The ID of the user initializing chat
     * @returns {Promise<Object>} The created chat message document
     * @throws {Error} If user not found (404 status) or creation fails
     */
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
    /**
     * Retrieve all chat messages for a user sorted by creation time.
     * @async
     * @param {string} userId - The ID of the user
     * @returns {Promise<Array>} Array of chat message objects, empty array if none exist
     * @throws {Error} If retrieval fails
     */
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

    /**
     * Send a user message and get AI response.
     * Stores both user and AI messages in database, includes financial context.
     * @async
     * @param {string} userId - The ID of the user sending message
     * @param {string} message - The user's message content
     * @returns {Promise<Array>} Array of all chat messages including new AI response
     * @throws {Error} If user not found (404 status) or message processing fails
     */
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
            const IncomeExpense = await ChartsService.IncomeExpense(userId).catch(() => null);
            const predictedExpense=await ChartsService.PredictedExpense(userId).catch(()=>null);
            const marketData = await MarketService.getOverview().catch(() => null);
            const aiReply = await AiInteraction.ChatComplete(conversationHistory, message, transactionsData, IncomeExpense, predictedExpense, marketData);

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