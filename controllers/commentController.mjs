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

export const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ msg: "Comment not found" });

        if (comment.commentedBy.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        await Comment.findByIdAndDelete(commentId);
        await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

        res.status(200).json({ msg: "Comment deleted" });
    } catch (err) {
        res.status(400).json({ msg: "Failed to delete comment" });
    }
};

