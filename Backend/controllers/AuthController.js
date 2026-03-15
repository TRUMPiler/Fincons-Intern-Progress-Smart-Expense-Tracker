import AuthService from "../services/AuthService.js";
import Response from "../utils/Response.js";

class AuthController {

    async RefreshToken(req, res, next) {
        try {
            // Get refresh token from HTTP-only cookie (auto-sent by browser)
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

    async VerifyRefreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json(Response.error("Refresh token missing", 401));
            }

            const decodedToken = await AuthService.verifyRefreshToken(refreshToken);
            
            res.status(200).json(Response.success({ valid: true, userId: decodedToken.userId }, "Refresh token is valid", 200));
        } catch (error) {
            return res.status(401).json(Response.error("Invalid refresh token", 401));
        }
    }

    async Logout(req, res, next) {
        try {
            // Clear the HTTP-only refresh token cookie
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
            
            res.status(200).json(Response.success(null, "Logged out successfully", 200));
        } catch (error) {
            console.error("Logout error:", error.message);
            return res.status(500).json(Response.error("Logout failed", 500));
        }
    }
}

export default new AuthController();
