import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

export const followUser = async (req, res) => {
    try {
        const myId = req.user.userId;
        const targetUserId = req.params.id;

        if (myId === targetUserId) {
            return res.status(400).json({ msg: "You cannot follow yourself" });
        }
        const me = await User.findById(myId);
        const targeted_User = await User.findById(targetUserId);

        if (!targeted_User) {
            return res.status(400).json({ msg: "User not found" });
        }
        if (me.following.some(id => id.toString() === targetUserId)) {
            return res.status(400).json({ msg: "Already following this User" });
        }
        me.following.push(targetUserId);
        targeted_User.followers.push(myId);
        await me.save();
        await targeted_User.save();

        // Notification
        const existing = await Notification.findOne({
            sender: myId,
            receiver: targetUserId,
            type: "follow"
        });

        if (!existing) {
            await Notification.create({
                sender: myId,
                receiver: targetUserId,
                type: "follow"
            });
        }
        res.status(200).json({ msg: `Folowed to ${targeted_User.name}` });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to follow user", err });
    }
};


export const unfollowUser = async (req, res) => {
    try {
        const myId = req.user.userId;
        const targetedUserId = req.params.id;

        const me = await User.findById(myId);
        const targeted_User = await User.findById(targetedUserId);
        if (!targeted_User) {
            return res.status(400).json({ msg: "User not found" });
        }
        if (!me.following.some(id => id.toString() === targetedUserId)) {
            return res.status(400).json({ msg: "You are not following this user" });
        }
        me.following.pull(targetedUserId);
        targeted_User.followers.pull(myId);
        await me.save();
        await targeted_User.save();
        res.status(200).json({ msg: " Unfollowed...... " });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to unfollow user", err });
    }
};