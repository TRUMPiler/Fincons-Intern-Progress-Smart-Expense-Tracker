import UserSchema from "../models/user.js";
// import mailer from "../mailer/Transport.js";

class UserService {

    async createUser(user) {
        try {
            // const FindUser=UserSchema.findOne({email:user.email});

            // if(FindUser)
            // {
            //     throw new Error("User Already Exists",{statusCode:401});
            // }
            const saveUser = new UserSchema(user);
            await saveUser.save();
            console.log(saveUser.password);
            return saveUser;
        } catch (err) {
            throw err;
        }
    }

    async VerifyUser(id) {
        try {
            const user = await UserSchema.findById(id);
            if (user) {
                await UserSchema.findByIdAndUpdate(id, { isVerified: true });
                return user;
            }
            throw new Error("User Not Found", { statusCode: 404 });
        } catch (error) {
            throw new Error(error);
        }
    }

    async LoginUser(email, password) {
        try {
            const login = await UserSchema.findOne({ email: email });
            if (!login) return false;
            const isMatch = await new Promise((resolve, reject) => {
                login?.comparePassword(password, (err, matched) => {
                    if (err) return reject(err);
                    resolve(matched);
                });

            });
            if (isMatch) {
                return login;
            }
            else {
                return null;
            }
        } catch (err) {
            throw err;
        }
    }

    async getUserById(id) {
        try {
            const user = await UserSchema.findById(id);
            if (!user) {
                throw new Error("User not found", { statusCode: 404 });
            }
            return user;
        } catch (err) {
            throw err;
        }
    }
}

export default new UserService();