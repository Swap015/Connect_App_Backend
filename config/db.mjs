import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI)
        console.log("MongoDB connected ✅✅");
    }
    catch (err) {
        console.log("MongoDB connection failed ❌❌", err);
    }
}
export default connectDB;