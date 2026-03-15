import Response from "../utils/Response.js";
import JWTauthentication from "../authentication/JWTauthentication.js";

const authHandler = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json(Response.error("Token missing", 401));
        }

        const token = authHeader.split(" ")[1];

        const decodedJwtToken = JWTauthentication.decodeAccessToken(token);

        req.userId = decodedJwtToken.userId;

        next();

    } catch (error) {
        return res.status(401).json(Response.error("Invalid or expired token", 401));
    }
};

export default authHandler;