import UserService from "../services/UserService.js";
import Response from "../utils/Response.js";
import mailer from "../mailer/Transport.js";
import Token from "../authentication/JWTauthentication.js";

class UserController {
    async Login(req, res, next) {
        const UserLogin = await UserService.LoginUser(req.body.email, req.body.password);

        if (!UserLogin) {
            console.log(UserLogin);
            return res.status(404).json(Response.error("Data is Not Found", 404));
        }
        console.log(UserLogin);
        const accessToken = Token.createAccessToken(UserLogin._id, UserLogin.email, UserLogin.isVerified, req.ip);
        const refreshToken = Token.createRefreshToken(UserLogin._id);
        

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        });
        

        res.status(200).json(Response.success({ user: { _id: UserLogin._id, email: UserLogin.email, name: UserLogin.name }, accessToken }, "User Login Success", 200));
    }

    async Register(req, res, next) {
        try {
            const UserRegister = await UserService.createUser(req.body);
            if (!UserRegister) {
                res.status(200).json(Response.success(null, "Registration Successfull", 200));
            }
            res.status(200).json(Response.success({ UserRegister }, "Registration Successfull", 200));
            (async () => {
                const info = await mailer.emails.send({
                // const info=await mailer.sendMail({
                    from: '"MoneyMint" <fincons@moneymint.tech>',
                    to: req.body.email,
                    subject: "Welcome to MoneyMint 🎉",
                    text: "Welcome to MoneyMint! Please verify your email.",
                    html: `
  <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      
      <h2 style="color:#2c3e50;">Welcome to MoneyMint 💰</h2>
      
      <p style="font-size:16px; color:#555;">
        Thank you for registering with <b>MoneyMint</b>.
        Please verify your email address to activate your account.
      </p>

      <a href="${process.env.FRONTEND_URL}/verify/${UserRegister._id}" 
         style="
           display:inline-block;
           margin-top:20px;
           padding:12px 25px;
           background-color:#28a745;
           color:white;
           text-decoration:none;
           border-radius:6px;
           font-size:16px;
           font-weight:bold;
         ">
         Verify Email
      </a>

      <p style="margin-top:30px; font-size:14px; color:#888;">
        If you did not create this account, you can safely ignore this email.
      </p>

      <hr style="margin:25px 0;">

      <p style="font-size:12px; color:#aaa;">
        © ${new Date().getFullYear()} MoneyMint. All rights reserved.
      </p>

    </div>
  </div>
  `
                });
                console.log("Message sent:", info.messageId);
            })();
        }
        catch (error) {
            next(error);
        }
    }

    async verify(req, res, next) {
        try {
            const id = req.params.id;
            console.log(id);

            const verifiedUser = await UserService.VerifyUser(id);

            if (verifiedUser) {
                return res
                    .status(200)
                    .json(Response.success(verifiedUser, "User Verified", 200));
            }

            return res
                .status(404)
                .json(Response.error("User not found or already verified", 404));

        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();