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

    /**
     * Update user profile fields such as name, email and password.
     * - If email changes, user's isVerified flag is set to false and caller should trigger verification email.
     * - If password is changed, currentPassword must be provided and verified.
     * @async
     * @param {string} id - The user id to update
     * @param {Object} updates - Fields to update: { name, email, password, currentPassword }
     * @returns {Promise<Object>} Returns object { user, emailChanged: boolean }
     * @throws {Error} If user not found, current password mismatch, or email already in use
     */
    async updateUser(id, updates) {
        try {
            const user = await UserSchema.findById(id);
            if (!user) {
                const err = new Error("User not found");
                err.statusCode = 404;
                throw err;
            }

            let emailChanged = false;

            // Email update: check uniqueness and mark unverified
            if (updates.email && updates.email !== user.email) {
                const existing = await UserSchema.findOne({ email: updates.email });
                if (existing && existing._id.toString() !== id) {
                    const err = new Error("Email already in use");
                    err.statusCode = 409;
                    throw err;
                }
                user.email = updates.email;
                user.isVerified = false;
                emailChanged = true;
            }

            if (updates.name) {
                user.name = updates.name;
            }

            // Password update requires currentPassword verification
            if (updates.password) {
                if (!updates.currentPassword) {
                    const err = new Error("Current password required to change password");
                    err.statusCode = 400;
                    throw err;
                }

                const isMatch = await new Promise((resolve, reject) => {
                    user.comparePassword(updates.currentPassword, (err, matched) => {
                        if (err) return reject(err);
                        resolve(matched);
                    });
                });

                if (!isMatch) {
                    const err = new Error("Current password incorrect");
                    err.statusCode = 401;
                    throw err;
                }

                // assign new password (pre-save hook will hash it)
                user.password = updates.password;
            }

            await user.save();

            return { user, emailChanged };
        } catch (err) {
            throw err;
        }
    }
}

export default new UserService();