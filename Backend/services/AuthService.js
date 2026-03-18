import JWTauthentication from "../authentication/JWTauthentication.js";
import UserSchema from "../models/user.js";

class AuthService {
    /**
     * Generate a new access token using a valid refresh token.
     * Verifies the refresh token and user ID match, then creates new access token.
     * @async
     * @param {string} userId - The ID of the user
     * @param {string} ip - The IP address of the request
     * @param {string} refreshToken - The refresh token from cookies
     * @returns {Promise<string>} The newly generated access token
     * @throws {Error} If token is invalid, user not found, or token creation fails
     */
    async refreshAccessToken(userId, ip, refreshToken) {
        try {
         
            const decodedToken = JWTauthentication.decodeRefreshToken(refreshToken);
            
            if (decodedToken.userId !== userId) {
                throw new Error("Token userId mismatch");
            }

            // Get user from database
            const user = await UserSchema.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // Generate new access token
            const newAccessToken = JWTauthentication.createAccessToken(user._id, user.email, user.isVerified, ip);
            
            return newAccessToken;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify and decode a refresh token without generating new tokens.
     * @async
     * @param {string} refreshToken - The refresh token to verify
     * @returns {Promise<Object>} The decoded token object containing userId and other claims
     * @throws {Error} If refresh token is invalid or verification fails
     */
    async verifyRefreshToken(refreshToken) {
        try {
            const decodedToken = JWTauthentication.decodeRefreshToken(refreshToken);
            return decodedToken;
        } catch (error) {
            throw new Error("Invalid refresh token");
        }
    }
}

export default new AuthService();
