import Post from "../models/postModel.js";

export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ msg: "Post not found" });

        const userId = req.user.userId;

        const index = post.likes.indexOf(userId);

        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.status(200).json({ msg: "Post like status updated", likes: post.likes });
    } catch (err) {
        res.status(400).json({ msg: "Like action failed", error: err.message });
    }
};
