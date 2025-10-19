import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

let io;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Map<userId, Set<socketId>>
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

        // Add user
        socket.on("addUser", (userId) => {
            if (onlineUsers.has(userId)) {
                onlineUsers.get(userId).add(socket.id);
            } else {
                onlineUsers.set(userId, new Set([socket.id]));
            }
            io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
            console.log("Online Users:", onlineUsers);
        });

        // Typing events
        socket.on("typing", ({ conversationId, senderId, receiverId }) => {
            const receiverSockets = onlineUsers.get(String(receiverId)) || new Set();
            receiverSockets.forEach(sockId => io.to(sockId).emit("typing", { conversationId, senderId }));
        });

        socket.on("stopTyping", ({ conversationId, senderId, receiverId }) => {
            const receiverSockets = onlineUsers.get(String(receiverId)) || new Set();
            receiverSockets.forEach(sockId => io.to(sockId).emit("stopTyping", { conversationId, senderId }));
        });

        // Send message
        socket.on("sendMessage", ({ receiverId, message }) => {
            const receiverSockets = onlineUsers.get(String(receiverId)) || new Set();
            receiverSockets.forEach(sockId => io.to(sockId).emit("getMessage", message));
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.log("❌ Socket disconnected:", socket.id);
            for (const [userId, sockets] of onlineUsers) {
                if (sockets.has(socket.id)) {
                    sockets.delete(socket.id);
                    if (sockets.size === 0) onlineUsers.delete(userId);
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
