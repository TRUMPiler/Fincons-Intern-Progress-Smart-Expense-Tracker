import jwt from "jsonwebtoken";

class JwtAuth {

    createAccessToken(userId, email, isVerified, ip) {
        const payload = { userId, email, verified: isVerified, ip };

        return jwt.sign(payload, process.env.JWTSECRET, {
            expiresIn: "15m"
        });
    }

    createRefreshToken(userId) {
        return jwt.sign(
            { userId },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );
    }

    decodeAccessToken(token) {
        return jwt.verify(token, process.env.JWTSECRET);
    }

    decodeRefreshToken(token) {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    }

    // Alias for backward compatibility
    CreateToken(userId, email, isVerified, ip) {
        return this.createAccessToken(userId, email, isVerified, ip);
    }

    decodeJwtToken(token) {
        return this.decodeAccessToken(token);
    }
}
 
export default new JwtAuth();