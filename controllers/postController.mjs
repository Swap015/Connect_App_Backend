import Post from "../models/postModel.js";

export const createPost = async (req, res) => {
    try {
        const { content, file } = req.body;
        if (!content || !file) {
            return res.status(400).json({ msg: "At least one field is required" });
        }
        const post = new Post({ content, file, postedBy: req.user.userId });
        await post.save();
        res.status(201).json({ msg: "Post created", post });
    }
    catch (err) {
        res.status(400).json({ msg: "Post creation failed", err });
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
        post.content = content;
        post.file = file;
        await post.save();
        res.status(200).json({ msg: "Post edited", post });
    }
    catch (err) {
        res.status(400).json({ msg: "Post editing failed", err });
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
        await Post.deleteOne(req.params.id);
        res.status(200).json({ msg: "Post deleted " });
    }
    catch (err) {
        res.status(400).json({ msg: "Post deletion failed" });
    }
};


