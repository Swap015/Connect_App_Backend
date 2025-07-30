import Post from "../models/postModel.js";

export const createPost = async (req, res) => {
    try {
        const { content, file } = req.body;
        if (!content || !file) {
            return res.status(400).json({ msg: "At least one field is required" });
        }
        const post = new Post({ content, file, postedBy: req.user.userId });
        await post.save();
        res.status(201).json({ post });
    }
    catch (err) {
        res.status(400).json({ msg: "Post creation failed", error: err.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const post = await Post.findById({ postedBy: req.params.userId }).sort({ createdAt: -1 });
        if (!post) {
            return res.status(404).json({ msg: "Post not found" })
        }
        res.status(200).json({ post });

    }
    catch (err) {
        return res.status(400).json({ msg: "Post fetching failed" });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        if (!posts) {
            return res.status(404).json({ msg: "Mo Post found" })
        }
        res.status(200).json({ posts });

    }
    catch (err) {
        return res.status(400).json({ msg: "Post fetching failed" });
    }
};

export const editPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }
        if (post.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Unauthorized User" });
        }
        const { content, file } = req.body;

        if (content !== undefined) post.content = content;
        if (file !== undefined) post.file = file;
        await post.save();
        res.status(200).json({ msg: "Post edited", post });
    }
    catch (err) {
        res.status(400).json({ msg: "Post editing failed", error: err.message });
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }
        if (post.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Unauthorized User" });
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ msg: "Post deleted " });
    }
    catch (err) {
        res.status(400).json({ msg: "Post deletion failed" });
    }
};






