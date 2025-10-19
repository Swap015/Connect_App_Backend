
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

let io;
const FRONTEND_URL = process.env.FRONTEND_URL;
export const onlineUsers = new Map();

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: FRONTEND_URL,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("⚡ New socket connected:", socket.id);

        socket.on("addUser", (userId) => {
            onlineUsers.set(String(userId), socket.id);
            console.log("Online Users:", onlineUsers);
            io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
        });

        socket.on("typing", ({ conversationId, senderId, receiverId }) => {
            const receiverSocketId = onlineUsers.get(String(receiverId));
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing", { conversationId, senderId });
            }
        });

        socket.on("stopTyping", ({ conversationId, senderId, receiverId }) => {
            const receiverSocketId = onlineUsers.get(String(receiverId));
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("stopTyping", { conversationId, senderId });
            }
        });
        
        socket.on("sendMessage", ({ receiverId, message }) => {
            const receiverSocketId = onlineUsers.get(String(receiverId));
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("getMessage", message);
                console.log("📩 Message sent to:", receiverSocketId);
            }
           
        });

        socket.on("disconnect", () => {
            console.log("❌ Socket disconnected:", socket.id);
            for (const [userId, sockId] of onlineUsers) {
                if (sockId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
};

