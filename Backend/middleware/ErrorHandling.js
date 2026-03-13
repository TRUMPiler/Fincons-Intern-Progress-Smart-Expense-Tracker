import Response from "../utils/Response.js";

/**
 * Centralized error handling middleware.
 * - Logs the error stack to the server console.
 * - Sends a standardized error response using the Response utility.
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const response = Response.error(err.message, statusCode);
    res.status(statusCode).json(response);
};

export default errorHandler;