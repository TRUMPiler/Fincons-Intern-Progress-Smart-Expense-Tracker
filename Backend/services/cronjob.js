import Response from '../utils/Response';
class CronJobService{
    SendReq=async(req,res,next)=>{
        try{
            res.status(200).json(Response.success(null,"Cronjob Request Complete",200));
        }catch(exception)
        {
            next(exception)
        }
    }
}
export default new CronJobService();