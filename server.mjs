import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.mjs';
import userRoutes from './routes/userRoute.mjs';
import postRoutes from './routes/postRoute.mjs';
import notificationRoutes from './routes/notificationRoute.mjs';
import connectionRoutes from './routes/connectionRoutes.mjs'
import searchRoute from './routes/searchRoute.mjs';

const app = express();
const PORT = process.env.PORT || 7000;
app.use(express.json());
app.use(cors({ credentials: true }));

// connection to database
connectDB();


//routes
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/connection', connectionRoutes);
app.use('/api/global', searchRoute);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});