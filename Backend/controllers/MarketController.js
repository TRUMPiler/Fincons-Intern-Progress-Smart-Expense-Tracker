import MarketService from "../services/MarketService.js";
import Response from "../utils/Response.js";

class MarketController {
    async Overview(req, res, next) {
        try {
            const data = await MarketService.getOverview();
            res.status(200).json(Response.success(data, "Market overview fetched", 200));
        } catch (err) {
            next(err);
        }
    }
}

export default new MarketController();
