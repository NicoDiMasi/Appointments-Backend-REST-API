
import mongoose from 'mongoose';

export class MongoDBClient {
    static async connect() {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI);

            console.log(`MongoDB is connected: ${conn.connection.host}`);
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    }
}