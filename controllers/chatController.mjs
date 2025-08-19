import mongoose from "mongoose";
import Message from '../models/messageModel.js';
import Conversation from "../models/conversationModel.js";
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

        const { conversationId, text, attachments } = req.body;

        if (!conversationId || (!text && (!attachments || attachments.length === 0))) {
            return res.status(400).json({ msg: "conversationId, receiverId and at least text or attachments are required" });
        }


        const convo = await Conversation.findById(conversationId);
        if (!convo) return res.status(404).json({ msg: "Conversation not found" });
        if (!convo.participants.some(p => p.toString() === senderId)) {
            return res.status(403).json({ msg: "Not a participant" });
        }

        const receiverId = convo.participants.find(p => p.toString() !== senderId);

        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            receiver: receiverId,
            text,
            attachments: attachments || [],
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
        if (!convo.participants.some(p => p.toString() === userId)) {
            return res.status(403).json({ msg: "Not a participant" });
        }


        const messages = await Message
            .find({ conversation: conversationId, deletedBy: { $ne: userId } })
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
        if (!convo.participants.some(p => p.toString() === userId)) {
            return res.status(403).json({ msg: "Not a participant" });
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


export const deleteMessageForMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ msg: "Message not found" });

        // Only participants can delete
        if (![message.sender.toString(), message.receiver.toString()].includes(userId)) {
            return res.status(403).json({ msg: "Not allowed to delete this message" });
        }

        // Mark as deleted for this user
        if (!message.deletedBy.includes(userId)) {
            message.deletedBy.push(userId);
            await message.save();
        }

        res.status(200).json({ msg: "Message deleted for you" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to delete message", error: err.message });
    }
};


export const deleteMessageForEveryone = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ msg: "Message not found" });

        // Only the sender can delete for everyone
        if (message.sender.toString() !== userId) {
            return res.status(403).json({ msg: "Only sender can delete message for everyone" });
        }

        await message.deleteOne();

        res.status(200).json({ msg: "Message deleted for everyone" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to delete message for everyone", error: err.message });
    }
};


export const deleteConversation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;

        const convo = await Conversation.findById(conversationId);
        if (!convo) return res.status(404).json({ msg: "Conversation not found" });

        if (!convo.participants.some(p => p.toString() === userId)) {
            return res.status(403).json({ msg: "Not a participant" });
        }

        // Delete all messages in this conversation
        await Message.deleteMany({ conversation: conversationId });

        // Delete the conversation itself
        await convo.deleteOne();

        res.status(200).json({ msg: "Conversation deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to delete conversation", error: err.message });
    }
};
