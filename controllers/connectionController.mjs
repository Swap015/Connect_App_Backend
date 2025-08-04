import User from "../models/userModel.js";

export const sendConnectionRequest = async (req, res) => {
    const myId = req.user.userId;
    const targetId = req.params.id;

    if (myId === targetId) return res.status(400).json({ msg: "You cannot connect with yourself" });

    const me = await User.findById(myId);
    const targetUser = await User.findById(targetId);

    if (!targetUser) return res.status(404).json({ msg: "Target user not found" });

    if (me.connections.includes(targetId)) {
        return res.status(400).json({ msg: "Already connected" });
    }


    if (targetUser.connection_Requests.some(r => r.user.toString() === myId)) {
        return res.status(400).json({ msg: "Request already sent" });
    }

    targetUser.connection_Requests.push({ user: myId });
    me.sentRequests.push(targetId);

    await targetUser.save();
    await me.save();

    res.status(200).json({ msg: "Connection request sent" });
};


export const acceptConnectionRequest = async (req, res) => {
    const myId = req.user.userId;
    const senderId = req.params.id;

    const me = await User.findById(myId);
    const sender = await User.findById(senderId);

    if (!sender) return res.status(404).json({ msg: "Sender not found" });


    me.connection_Requests = me.connection_Requests.filter(req => req.user.toString() !== senderId);


    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== myId);


    me.connections.push(senderId);
    sender.connections.push(myId);

    await me.save();
    await sender.save();

    res.status(200).json({ msg: "Connection request accepted" });
};


export const rejectConnectionRequest = async (req, res) => {
    const myId = req.user.userId;
    const senderId = req.params.id;

    const me = await User.findById(myId);
    const sender = await User.findById(senderId);

    if (!sender) return res.status(404).json({ msg: "Sender not found" });

    me.connection_Requests = me.connection_Requests.filter(req => req.user.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== myId);

    await me.save();
    await sender.save();

    res.status(200).json({ msg: "Connection request rejected" });
};


export const cancelConnectionRequest = async (req, res) => {
    const myId = req.user.userId;
    const targetId = req.params.id;

    const me = await User.findById(myId);
    const targetUser = await User.findById(targetId);

    if (!targetUser) return res.status(404).json({ msg: "Target user not found" });

    me.sentRequests = me.sentRequests.filter(id => id.toString() !== targetId);
    targetUser.connection_Requests = targetUser.connection_Requests.filter(req => req.user.toString() !== myId);

    await me.save();
    await targetUser.save();

    res.status(200).json({ msg: "Connection request cancelled" });
};


export const removeConnection = async (req, res) => {
    const myId = req.user.userId;
    const otherUserId = req.params.id;

    const me = await User.findById(myId);
    const otherUser = await User.findById(otherUserId);

    if (!otherUser) return res.status(404).json({ msg: "User not found" });

    me.connections = me.connections.filter(id => id.toString() !== otherUserId);
    otherUser.connections = otherUser.connections.filter(id => id.toString() !== myId);

    await me.save();
    await otherUser.save();

    res.status(200).json({ msg: "Connection removed" });
};


export const getMyConnections = async (req, res) => {
    const me = await User.findById(req.user.userId).populate("connections", "name profileImage");

    res.status(200).json({ connections: me.connections });
};


export const getReceivedRequests = async (req, res) => {
    const me = await User.findById(req.user.userId)
        .populate("connection_Requests.user", "name profileImage");

    res.status(200).json({ requests: me.connection_Requests });
};


export const getSentRequests = async (req, res) => {
    const me = await User.findById(req.user.userId)
        .populate("sentRequests", "name profileImage");

    res.status(200).json({ sentRequests: me.sentRequests });
};
