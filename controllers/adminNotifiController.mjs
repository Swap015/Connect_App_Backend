import AdminNotification from "../models/adminNotificationModel.js";
import User from "../models/userModel.js";

// Send global notification
export const sendGlobalNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body;

        if (!title || !message) {
            return res.status(400).json({ msg: "Title and message are required" });
        }

        const newNotification = await AdminNotification.create({
            title,
            message,
            type,
            createdBy: req.user.userId,
            isGlobal: true
        });

        res.status(201).json({ msg: "Global notification sent", notification: newNotification });
    } catch (err) {
        res.status(500).json({ msg: "Failed to send notification", error: err.message });
    }
};

// Get all global notifications (for users)
export const getGlobalNotifications = async (req, res) => {
    try {
        const notifications = await AdminNotification.find()
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({ notifications });
    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch notifications", error: err.message });
    }
};

// Mark as read
export const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.userId;

        const notification = await AdminNotification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ msg: "Notification not found" });
        }

        if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
            await notification.save();
        }

        res.status(200).json({ msg: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to update notification", error: err.message });
    }
};
