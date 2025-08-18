import mongoose from "mongoose";
import Message from '../models/messageModel.js';
import Conversation from "../models/conversationModel.mjs";
import User from "../models/userModel.js";


export const getOrCreateConversation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { otherUserId } = req.body;

        if (!mongoose.isValidObjectId(otherUserId)) {
            return res.status(400).json({ msg: "Invalid otherUserId" });
        }
        if (otherUserId === userId) {
            return res.status(400).json({ msg: "Cannot create conversation with yourself" });
        }

        const otherUser = await User.findById(otherUserId).select("_id");
        if (!otherUser) return res.status(404).json({ msg: "User not found" });

        const pair = [userId, otherUserId].sort();

        let convo = await Conversation.findOne({ participants: pair });
        if (!convo) {
            convo = await Conversation.create({
                participants: pair,
                unreadCount: { [otherUserId]: 0, [userId]: 0 },
            });
        }

        res.status(200).json({ conversation: convo });
    } catch (err) {
        res.status(500).json({ msg: "Failed to get/create conversation", error: err.message });
    }
};


export const listConversations = async (req, res) => {
    try {
        const userId = req.user.userId;

        const conversations = await Conversation
            .find({ participants: userId })
            .populate({
                path: "participants",
                select: "name email profileImage",
            })
            .populate({
                path: "lastMessage",
                select: "text sender receiver createdAt readAt",
            })
            .sort({ updatedAt: -1 });

        res.status(200).json({ conversations });
    } catch (err) {
        res.status(500).json({ msg: "Failed to list conversations", error: err.message });
    }
};


export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.userId;
        const { conversationId, receiverId, text } = req.body;

        if (!conversationId || !receiverId || typeof text !== "string") {
            return res.status(400).json({ msg: "conversationId, receiverId and text are required" });
        }

        const convo = await Conversation.findById(conversationId);
        if (!convo) return res.status(404).json({ msg: "Conversation not found" });
        if (!convo.participants.map(String).includes(senderId) ||
            !convo.participants.map(String).includes(receiverId)) {
            return res.status(403).json({ msg: "Not a participant of this conversation" });
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            receiver: receiverId,
            text,
        });

        convo.lastMessage = message._id;
        const currentUnread = Number(convo.unreadCount.get(receiverId) || 0);
        convo.unreadCount.set(receiverId, currentUnread + 1);
        await convo.save();

        res.status(201).json({ message });
    } catch (err) {
        res.status(500).json({ msg: "Failed to send message", error: err.message });
    }
};


export const getMessages = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;

        const convo = await Conversation.findById(conversationId);
        if (!convo) return res.status(404).json({ msg: "Conversation not found" });
        if (!convo.participants.map(String).includes(userId)) {
            return res.status(403).json({ msg: "Not a participant of this conversation" });
        }

        const messages = await Message
            .find({ conversation: conversationId })
            .sort({ createdAt: 1 });

        res.status(200).json({ messages });
    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch messages", error: err.message });
    }
};


export const markConversationRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;

        const convo = await Conversation.findById(conversationId);
        if (!convo) return res.status(404).json({ msg: "Conversation not found" });
        if (!convo.participants.map(String).includes(userId)) {
            return res.status(403).json({ msg: "Not a participant of this conversation" });
        }

        await Message.updateMany(
            { conversation: conversationId, receiver: userId, readAt: null },
            { $set: { readAt: new Date() } }
        );


        convo.unreadCount.set(userId, 0);
        await convo.save();

        res.status(200).json({ msg: "Marked as read" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to mark as read", error: err.message });
    }
};
