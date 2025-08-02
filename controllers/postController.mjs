import Post from "../models/postModel.js";

export const createPost = async (req, res) => {
    try {
        const { content, file } = req.body;
        if (!content || !file) {
            return res.status(400).json({ msg: "At least one field is required" });
        }
        const post = new Post({ content, file, postedBy: req.user.userId });
        await post.save();

        //Notification
        const user = await User.findById(req.user.userId);
        const followerIds = user.followers;

        const notifications = followerIds.map(followerId => ({
            sender: req.user.userId,
            receiver: followerId,
            type: "new_post",
            post: post._id
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
        res.status(201).json({ post });
    }
    catch (err) {
        res.status(400).json({ msg: "Post creation failed", error: err.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ postedBy: req.params.userId }).sort({ createdAt: -1 });

        if (!posts || posts.length === 0) {
            return res.status(404).json({ msg: "No posts found for this user" });
        }

        res.status(200).json({ posts });
    }
    catch (err) {
        return res.status(400).json({ msg: "Post fetching failed", error: err.message });
    }
};


export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        if (posts.length === 0) {
            return res.status(404).json({ msg: "No Post found" })
        }
        res.status(200).json({ posts });

    }
    catch (err) {
        return res.status(400).json({ msg: "Post fetching failed" });
    }
};

export const editPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }
        if (post.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Unauthorized User" });
        }
        const { content, file } = req.body;

        if (content !== undefined) { post.content = content }
        if (file !== undefined) { post.file = file }
        await post.save();
        res.status(200).json({ msg: "Post edited", post });
    }
    catch (err) {
        res.status(400).json({ msg: "Post editing failed", error: err.message });
    }
};

export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate("postedBy", "name email")
            .populate({
                path: "comments",
                populate: { path: "commentedBy", select: "name" }
            });

        if (!post) return res.status(404).json({ msg: "Post not found" });

        res.status(200).json({ post });
    } catch (err) {
        res.status(400).json({ msg: "Failed to fetch post", error: err.message });
    }
};

//Search Posts
export const searchPosts = async (req, res) => {
    try {
        const { keyword } = req.query;

        const posts = await Post.find({
            content: { $regex: keyword, $options: "i" }
        }).populate("postedBy", "name");

        res.status(200).json({ posts });
    } catch (err) {
        res.status(400).json({ msg: "Search failed", error: err.message });
    }
};


export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }
        if (post.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Unauthorized User" });
        }
        await Post.findByIdAndDelete(req.params.postId);
        res.status(200).json({ msg: "Post deleted " });
    }
    catch (err) {
        res.status(400).json({ msg: "Post deletion failed" });
    }
};






