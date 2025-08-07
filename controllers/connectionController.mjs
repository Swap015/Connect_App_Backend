import User from "../models/userModel.js";

export const sendConnectionRequest = async (req, res) => {
    try {
        const myId = req.user.userId;
        const targetId = req.params.id;

        if (myId === targetId) return res.status(400).json({ msg: "You cannot connect with yourself" });

        const me = await User.findById(myId);
        const targetUser = await User.findById(targetId);

        if (!targetUser) return res.status(404).json({ msg: "Target user not found" });

        if (me.connections.includes(targetId)) {
            return res.status(400).json({ msg: "Already connected" });
        }


        if (targetUser.connectionRequests.some(r => r.user.toString() === myId)) {
            return res.status(400).json({ msg: "Request already sent" });
        }

        targetUser.connectionRequests.push({ user: myId });
        me.sentRequests.push(targetId);

        await targetUser.save();
        await me.save();

        res.status(200).json({ msg: "Connection request sent" });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to send connection request", error: err.message });
    }
};


export const acceptConnectionRequest = async (req, res) => {
    try {

        const myId = req.user.userId;
        const senderId = req.params.id;

        const me = await User.findById(myId);
        const sender = await User.findById(senderId);

        if (!sender) return res.status(404).json({ msg: "Sender not found" });

        if (!me.connectionRequests.some(req => req.user.toString() === senderId)) {
            return res.status(400).json({ msg: "No connection request found from this user" });
        }

        if (me.connections.includes(senderId)) {
            return res.status(400).json({ msg: "You are already connected with this user" });
        }

        // Remove request after accepting
        me.connectionRequests = me.connectionRequests.filter(req => req.user.toString() !== senderId);
        sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== myId);

        me.connections.push(senderId);
        sender.connections.push(myId);

        await me.save();
        await sender.save();

        res.status(200).json({ msg: "Connection request accepted" });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to accept connection request", error: err.message });
    }
};


export const rejectConnectionRequest = async (req, res) => {
    try {
        const myId = req.user.userId;
        const senderId = req.params.id;

        const me = await User.findById(myId);
        const sender = await User.findById(senderId);

        if (!sender) return res.status(404).json({ msg: "Sender not found" });

        if (!me.connectionRequests.some(req => req.user.toString() === senderId)) {
            return res.status(400).json({ msg: "No connection request from this user" });
        }

        // Remove connection request
        me.connectionRequests = me.connectionRequests.filter(req => req.user.toString() !== senderId);
        sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== myId);

        await me.save();
        await sender.save();

        res.status(200).json({ msg: "Connection request rejected" });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to reject connection request", error: err.message });
    }
};


export const cancelConnectionRequest = async (req, res) => {
    try {
        const myId = req.user.userId;
        const targetId = req.params.id;

        const me = await User.findById(myId);
        const targetUser = await User.findById(targetId);

        if (!targetUser) return res.status(404).json({ msg: "Target user not found" });

        if (!me.sentRequests.includes(targetId)) {
            return res.status(400).json({ msg: "No connection request sent to this user" });
        }
        // Remove connection request
        me.sentRequests = me.sentRequests.filter(id => id.toString() !== targetId);
        targetUser.connectionRequests = targetUser.connectionRequests.filter(req => req.user.toString() !== myId);

        await me.save();
        await targetUser.save();

        res.status(200).json({ msg: "Connection request cancelled" });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to cancel connection request", error: err.message });
    }
};

export const removeConnection = async (req, res) => {
    try {
        const myId = req.user.userId;
        const targetId = req.params.id;

        const me = await User.findById(myId);
        const targetUser = await User.findById(targetId);

        if (!targetUser) return res.status(404).json({ msg: "User not found" });

        if (!me.connections.includes(targetId)) {
            return res.status(400).json({ msg: "You are not connected with this user" });
        }
        // Remove connection request
        me.connections = me.connections.filter(id => id.toString() !== targetId);
        targetUser.connections = targetUser.connections.filter(id => id.toString() !== myId);

        await me.save();
        await targetUser.save();

        res.status(200).json({ msg: "Connection removed" });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to remove connection", error: err.message });
    }
};


export const getMyConnections = async (req, res) => {
    try {
        const me = await User.findById(req.user.userId).populate("connections", "name profileImage");

        res.status(200).json({ connections: me.connections });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to fetch connections", error: err.message });
    }
};


export const getReceivedRequests = async (req, res) => {
    try {
        const me = await User.findById(req.user.userId)
            .populate("connectionRequests.user", "name profileImage");
        res.status(200).json({ requests: me.connectionRequests });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to fetch requests", error: err.message });
    }
};


export const getSentRequests = async (req, res) => {
    try {
        const me = await User.findById(req.user.userId)
            .populate("sentRequests", "name profileImage");
        res.status(200).json({ sentRequests: me.sentRequests });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to fetch sent requests", error: err.message });
    }
};
