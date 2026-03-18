import Response from "../utils/Response.js";

/**
 * Express centralized error handling middleware.
 * Logs error stack and sends standardized error response with appropriate HTTP status code.
 * Should be used as the last middleware in Express app setup.
 * @param {Error} err - The error object with statusCode, message, and stack properties
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON error response with status code
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const response = Response.error(err.message, statusCode);
    res.status(statusCode).json(response);
};

export default errorHandler;