import AlertService from "../services/AlertService.js";
import Response from "../utils/Response.js";

class AlertController
{
    /**
     * Retrieve all unread alerts for a specific user.
     * @async
     * @param {Object} req - Express request object with userId in params
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with alerts array
     */
    async GetAlert(req,res,next)
    {
        try{
            const data=await AlertService.GetAlert(req.params.userId);
            res.status(200).json(Response.success(data,"Alerts Fetched",200));
        }catch(Error)
        {
            next(Error);
        }
    }
    /**
     * Mark an alert as read/updated by its ID.
     * @async
     * @param {Object} req - Express request object with AlertId in params
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with updated alert
     */
    async updateAlert(req,res,next)
    {
        try{
            const data=await AlertService.UpdateAlert(req.params.AlertId);
            res.status(200).json(Response.success(data,"Alert Updated",200));
        }catch(Error)
        {
            next(Error);
        }
    }
}
export default new AlertController();