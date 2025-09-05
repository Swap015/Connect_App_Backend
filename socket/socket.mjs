
import { Server } from "socket.io";

let io;
export const onlineUsers = new Map();

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
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

