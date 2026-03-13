import jwt from "jsonwebtoken";

class JwtAuth {
    CreateToken(userId, UserEmail, isVerified, ip) {
        const payload = { userid: userId, email: UserEmail, verified: isVerified, ip: ip };
        const token = jwt.sign(payload, process.env.JWTSECRET, {
            expiresIn: "3h",
        });
        return token;
    }
    decodeJwtToken(token) {
        try {
            return jwt.verify(token, process.env.JWTSECRET);
        } catch (error) {
            throw new Error("Invalid token");
        }
    }
}

export default new JwtAuth();