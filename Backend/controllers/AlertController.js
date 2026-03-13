import AlertService from "../services/AlertService.js";
import Response from "../utils/Response.js";

class AlertController
{
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