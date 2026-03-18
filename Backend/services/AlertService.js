import mongoose from "mongoose";
import Alert from "../models/Alert.js";

class AlertService
{
    /**
     * Retrieve all unread alerts for a specific user.
     * @param {string} userId - The ID of the user
     * @returns {Promise<Array>} Array of unread alert objects
     * @throws {Error} If alerts cannot be retrieved from the database
     */
    async GetAlert(userId)
    {
     try{
        console.log("fetch Alerts");
            const alerts=await Alert.find({userId:new mongoose.Types.ObjectId(userId),isRead:false});
            if(!alerts)
            {
                throw new Error("No Alerts Found",{statusCode:404});
            }
            console.log("Alerts"+alerts);
            return alerts;

      }catch(error)
      {
        throw new Error(error);
      }
    }

    /**
     * Create a new alert for a user.
     * @param {string} userId - The ID of the user to create alert for
     * @param {string} type - The type of alert (e.g., "budget_exceeded", "overspending")
     * @param {string} message - The alert message content
     * @returns {Promise<Object>} The created alert object
     * @throws {Error} If alert creation fails
     */
    async CreateAlert(userId, type, message) {
        try {
            const alert = await Alert.create({
                userId,
                type,
                message,
                isRead: false
            });
            return alert;
        } catch (error) {
            console.error("Failed to create alert", error);
            throw error;
        }
    }

    /**
     * Mark an alert as read by updating its isRead status to true.
     * @param {string} _id - The ID of the alert to update
     * @returns {Promise<Object>} The updated alert object
     * @throws {Error} If alert not found or update fails
     */
    async UpdateAlert(_id)
    {
        try{
            const updateAlert = await Alert.findByIdAndUpdate(_id, {isRead:true}, { new: true });
            if(!updateAlert)
            {
                throw new Error("No Alert found with this id "+_id,{statusCode:404});
            }
            return updateAlert;
        }
        catch(error)
        {
            throw new Error(error);
        }

    }
}
export default new AlertService();