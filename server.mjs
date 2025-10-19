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
import jobRoutes from './routes/jobRoutes.mjs';
import jobApplicationRoutes from './routes/jobAppliRoute.mjs';
import commentRoutes from './routes/commentsRoute.mjs';
import profilePicRoutes from './routes/profilePicRoute.mjs';
import chatRoutes from "./routes/chatRoutes.mjs";
import AdminRoutes from './routes/adminRoutes.mjs';
import { initSocket } from './socket/socket.mjs';
import { createServer } from "http";


const app = express();
const PORT = process.env.PORT || 7000;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(express.json());

app.use(cors({
    origin: FRONTEND_URL,
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (FRONTEND_URL.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true
}));

app.use(cookieParser());

// connection to database
connectDB();


//Socket io
const server = createServer(app);

initSocket(server);


//routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/connection', connectionRoutes);
app.use('/api/global', searchRoute);
app.use('/api/job', jobRoutes);
app.use('/api/applications', jobApplicationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/profilePic', profilePicRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", AdminRoutes);




server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});