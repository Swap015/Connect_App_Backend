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
import jobRoute from './routes/jobRoutes.mjs';
import jobApplicationRoutes from './routes/jobAppliRoute.mjs';
import commentRoutes from './routes/commentsRoute.mjs';
import Message from './models/messageModel.mjs';
import { createServer } from "http";
import { Server } from "socket.io";


const app = express();
const PORT = process.env.PORT || 7000;
app.use(express.json());
app.use(cors({ credentials: true }));

// connection to database
connectDB();



//Socket io
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // frontend URL
        credentials: true
    }
});

app.use(cookieParser());

let onlineUsers = new Map();

// When a socket connects
io.on("connection", (socket) => {
    console.log("⚡ New socket connected:", socket.id);

    socket.on("addUser", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log("Online Users:", onlineUsers);
    });

    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
        // Save message to DB
        const newMessage = await Message.create({ sender: senderId, receiver: receiverId, message });

        // Emit message to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("getMessage", newMessage);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
        for (let [userId, sockId] of onlineUsers) {
            if (sockId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
    });
});






//routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/connection', connectionRoutes);
app.use('/api/global', searchRoute);
app.use('/api/job', jobRoute);
app.use('/api/applications', jobApplicationRoutes);
app.use('/api/comments', commentRoutes);


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});