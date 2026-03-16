import JWTauthentication from "../authentication/JWTauthentication.js";
import UserSchema from "../models/user.js";

class AuthService {
    
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
