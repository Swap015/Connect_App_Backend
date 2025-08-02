import User from "../models/userModel.js";

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
        if (me.following.includes(targeted_User)) {
            return res.status(400).json({ msg: "Already following this User" });
        }
        me.following.push(targeted_User);
        targeted_User.followers.push(me);
        await me.save();
        await targeted_User.save();
        res.status(200).json({ msg: `Folowed to ${targeted_User}` });
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
        if (!me.following.includes(targeted_User)) {
            return res.status(400).json({ msg: "You are not following this user" });
        }
        me.following.pull(targeted_User);
        targeted_User.followers.pull(me);
        await me.save();
        res.status(200).json({ msg: " Unfollowed...... " });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to unfollow user", err });
    }
};