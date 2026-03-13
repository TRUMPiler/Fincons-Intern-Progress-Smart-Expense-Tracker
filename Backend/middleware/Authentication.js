import Response from "../utils/Response.js";
import JWTauthentication from "../authentication/JWTauthentication.js";

const authHandler = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json(Response.error("Token missing",401));
        }

        const token = authHeader.split(" ")[1];

        const decodedJwtToken = JWTauthentication.decodeJwtToken(token);

        const requestIp = req.ip;
        console.log(requestIp);
        if (decodedJwtToken.ip !== requestIp) {
            return res.status(403).json(Response.error("IP mismatch. Unauthorized access.",403));
        }

        req.userId = decodedJwtToken.userId;

        next();

    } catch (error) {
        return res.status(401).json(Response.error("Invalid token",401));
    }
};

export default authHandler;