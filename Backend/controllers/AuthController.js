import AuthService from "../services/AuthService.js";
import Response from "../utils/Response.js";

class AuthController {

    /**
     * Refresh access token using valid refresh token from cookies.
     * @async
     * @param {Object} req - Express request object with refreshToken cookie and userId in body
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with new access token (200)
     */
    async RefreshToken(req, res, next) {
        try {
            // Get refresh token from HTTP-only cookie
            const refreshToken = req.cookies.refreshToken;
            const userId = req.body.userId;
            const ip = req.ip;

            if (!refreshToken) {
                return res.status(401).json(Response.error("Refresh token missing", 401));
            }

            if (!userId) {
                return res.status(401).json(Response.error("User ID missing", 401));
            }

            const newAccessToken = await AuthService.refreshAccessToken(userId, ip, refreshToken);
            
            res.status(200).json(Response.success({ accessToken: newAccessToken }, "Token refreshed successfully", 200));
        } catch (error) {
            console.error("Token refresh error:", error.message);
            return res.status(401).json(Response.error("Invalid refresh token", 401));
        }
    }

    /**
     * Verify if refresh token is still valid.
     * @async
     * @param {Object} req - Express request object with refreshToken cookie
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response with validity status and userId (200)
     */
    async VerifyRefreshToken(req, res, next) {
        try {
            // Get refresh token from HTTP-only cookie
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(401).json(Response.error("Refresh token missing", 401));
            }

            const decodedToken = await AuthService.verifyRefreshToken(refreshToken);
            
            res.status(200).json(Response.success({ valid: true, userId: decodedToken.userId }, "Refresh token is valid", 200));
        } catch (error) {
            return res.status(401).json(Response.error("Invalid refresh token", 401));
        }
    }

    /**
     * Logout user by clearing refresh token cookie.
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object with refreshToken cookie to clear
     * @param {Function} next - Express next middleware function
     * @returns {void} JSON response confirming logout (200)
     */
    async Logout(req, res, next) {
        try {
            // Clear the refresh token cookie
            res.clearCookie('refreshToken', {
                httpOnly: true,
                path: '/'
            });
            
            res.status(200).json(Response.success(null, "Logged out successfully", 200));
        } catch (error) {
            console.error("Logout error:", error.message);
            return res.status(500).json(Response.error("Logout failed", 500));
        }
    }
}

export default new AuthController();
