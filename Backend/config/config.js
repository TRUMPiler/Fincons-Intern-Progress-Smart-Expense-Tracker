import mongoose from "mongoose";

class DBconfig {
    async connect() {
        try {
            let uri = process.env.MONGODB + '';
            await mongoose.connect(uri, {
                dbName: 'SmartExpenseApp'
            })
                .then(() => console.log('Connected to MongoDB'))
                .catch(err => console.error('Error connecting to MongoDB:', err));
            return await mongoose.connection;
        }
        catch (Exception) {
            throw new Error(Exception);
        }
    }
}

export { DBconfig };