import mongoose from "mongoose";
import Alert from "../models/Alert.js";

class AlertService
{
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
   async UpdateAlert(_id)
    {
        try{
            const updateAlert=Alert.findByIdAndUpdate({_id:_id},{isRead:true});
            if(!updateAlert)
            {
                throw new Error("No Alert found with this id"+_id,{statusCode:404});
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