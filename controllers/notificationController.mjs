import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user.userId })
            .sort({ createdAt: -1 })
            .populate("sender", "name profileImage");

        res.status(200).json({ notifications });
    } catch (err) {
        res.status(400).json({ msg: "Failed to fetch notifications", error: err.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { receiver: req.user.userId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ msg: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to mark notifications", error: err.message });
    }
};

export const markOneAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, receiver: req.user.userId },
            { $set: { read: true } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ msg: "Notification not found" });
        }

        res.status(200).json({ msg: "Notification marked as read", notification });
    } catch (err) {
        res.status(500).json({ msg: "Failed to update notification", error: err.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const deleted = await Notification.findOneAndDelete({
            _id: notificationId,
            receiver: req.user.userId
        });

        if (!deleted) {
            return res.status(404).json({ msg: "Notification not found" });
        }

        res.status(200).json({ msg: "Notification deleted" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to delete notification", error: err.message });
    }
};
