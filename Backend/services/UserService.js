import UserSchema from "../models/user.js";
// import mailer from "../mailer/Transport.js";

class UserService {

    /**
     * Create a new user account with validation.
     * Checks for existing email and hashes password before saving.
     * @async
     * @param {Object} user - User object with name, email, password
     * @returns {Promise<Object>} The created user document
     * @throws {Error} If email already exists or creation fails (409 status)
     */
    async createUser(user) {
        try {
            // Check if user already exists
            const existingUser = await UserSchema.findOne({ email: user.email });
            if (existingUser) {
                const error = new Error("User with this email already exists");
                error.statusCode = 409; // Conflict
                throw error;
            }
            const saveUser = new UserSchema(user);
            await saveUser.save();
            return saveUser;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Mark a user as verified by ID.
     * Updates isVerified flag to true after email confirmation.
     * @async
     * @param {string} id - The user ID to verify
     * @returns {Promise<Object>} The user object (from before update)
     * @throws {Error} If user not found (404 status)
     */
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

    /**
     * Authenticate user with email and password.
     * Compares provided password against hashed password in database.
     * @async
     * @param {string} email - The user's email address
     * @param {string} password - The plain text password to verify
     * @returns {Promise<Object|null>} The user object if authenticated, null if password doesn't match, false if email not found
     * @throws {Error} If comparison fails
     */
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

    /**
     * Retrieve a user by their ID.
     * @async
     * @param {string} id - The user ID to fetch
     * @returns {Promise<Object>} The user document
     * @throws {Error} If user not found (404 status)
     */
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