
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
        transports: ["websocket", "polling"]
    });

    io.on("connection", (socket) => {
        console.log("⚡ New socket connected:", socket.id);

        socket.on("addUser", (userId) => {
            const uid = String(userId);
            if (onlineUsers.has(uid)) {
                onlineUsers.get(uid).add(socket.id);
            } else {
                onlineUsers.set(uid, new Set([socket.id]));
            }
            console.log("Online Users:", [...onlineUsers.entries()].map(([u, s]) => [u, Array.from(s)]));
            io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
        });

        socket.on("typing", ({ conversationId, senderId, receiverId }) => {
            const receiverSockets = onlineUsers.get(String(receiverId)) || new Set();
            receiverSockets.forEach(sockId => {
                io.to(sockId).emit("typing", { conversationId, senderId });
            });
        });

        socket.on("stopTyping", ({ conversationId, senderId, receiverId }) => {
            const receiverSockets = onlineUsers.get(String(receiverId)) || new Set();
            receiverSockets.forEach(sockId => {
                io.to(sockId).emit("stopTyping", { conversationId, senderId });
            });
        });

        socket.on("sendMessage", ({ receiverId, message }) => {
            const receiverSockets = onlineUsers.get(String(receiverId)) || new Set();
            receiverSockets.forEach(sockId => {
                io.to(sockId).emit("getMessage", message);
                console.log("📩 Emitted getMessage to", sockId, "for receiver", receiverId);
            });

        });

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

