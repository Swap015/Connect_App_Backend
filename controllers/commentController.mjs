import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ msg: "Comment cannot be empty" });

        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: "Post not found" });

        const comment = new Comment({
            text,
            commentedBy: req.user.userId,
            post: req.params.postId,
        });

        await comment.save();
        post.comments.push(comment._id);
        await post.save();

        //Notification
        if (post.postedBy.toString() !== req.user.userId) {
            await Notification.create({
                sender: req.user.userId,
                receiver: post.postedBy,
                type: "comment",
                post: post._id
            });
        }

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

export const editComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;

        const post = await Post.findById(postId);
        if (!post) { return res.status(400).json({ msg: "Post not found" }) };

        const comment = await Comment.findById(commentId);
        if (!comment) { return res.status(400).json({ msg: "Comment not found" }) };

        const { text } = req.body;
        if (text) { comment.text = text };
        await comment.save();
        res.status(200).json({ msg: "Comment edited", comment });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to edit comment" });
    }
};

export const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId }).populate("commentedBy", "name").sort({ createdAt: -1 });
        res.status(200).json({ comments });

    }
    catch (err) {
        res.status(400).json({ msg: "Failed to fetch comments", error: err.message });
    }
};

export const getSingleComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId)
            .populate("commentedBy", "name");

        if (!comment) {
            return res.status(404).json({ msg: "Comment not found" });
        }
        res.status(200).json({ comment });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to fetch comment", error: err.message });
    }
};
