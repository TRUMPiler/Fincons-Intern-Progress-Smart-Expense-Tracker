import Response from "../utils/Response.js";
import JWTauthentication from "../authentication/JWTauthentication.js";

/**
 * Express middleware to authenticate requests using JWT tokens.
 * Validates Bearer token from Authorization header and attaches userId to request.
 * If token is missing or invalid, returns 401 Unauthorized response.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() if token valid, or sends 401 error response
 */
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