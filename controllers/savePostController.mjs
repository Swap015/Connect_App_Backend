import Post from "../models/postModel.js";
import User from "../models/userModel.js";

export const savePost = async (req, res) => {
    try {
        myId = req.user.userId;
        postId = req.params.postId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(400).json({ msg: "Post not found" });
        }
        const me = await User.findById(myId);
        if (me.savedPosts.includes(postId)) {
            return res.status(400).json({ msg: "Post already exists" });
        }
        me.savedPosts.push(postId);
        await me.save();
        res.status(200).json({ msg: "Post saved" });

    }
    catch (err) {
        res.status(400).json({ msg: "Failed to save post", error: err.message });
    }
};


export const unSavePost = async (req, res) => {
    try {
        const myId = req.user.userId;
        const postId = req.params.postId;

        const me = await User.findById(myId);
        if (!me.savedPosts.includes(postId)) {
            return res.status(400).json({ msg: "Post is not saved" });
        }
        me.savedPosts = me.savedPosts.filter(id => id.toString() !== postId);
        await me.save();
        res.status(200).json({ msg: "Post unsaved" });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to unsave post" });
    }
};

export const getSavedPosts = async (req, res) => {
    try {
        const myId = req.user.userId;

        const me = await User.findById(myId).populate("savedPosts");
        if (!me.savedPosts) {
            return res.status(400).json({ msg: "No saved Posts" });
        }
        return res.status(200).json({ posts: me.savedPosts });
    }
    catch (err) {
        return res.status(400).json({ msg: "Failed to fetch saved posts" });
    }
};