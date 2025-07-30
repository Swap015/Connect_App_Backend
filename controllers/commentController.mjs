import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ msg: "Comment cannot be empty" });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: "Post not found" });

        const comment = new Comment({
            text,
            commentedBy: req.user.userId,
            post: req.params.id,
        });

        await comment.save();
        post.comments.push(comment._id);
        await post.save();

        res.status(201).json({ msg: "Comment added", comment });
    } catch (err) {
        res.status(400).json({ msg: "Comment failed", error: err.message });
    }
};
