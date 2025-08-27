import Post from "../models/postModel.js";
import Notification from "../models/notificationModel.js";

export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) return res.status(404).json({ msg: "Post not found" });

        const userId = req.user.userId;

        const index = post.likes.indexOf(userId);

        if (index === -1) {
            post.likes.push(userId);

            // Notification 
            if (post.postedBy.toString() !== userId) {

                const existing = await Notification.findOne({
                    sender: userId,
                    receiver: post.postedBy,
                    type: "like",
                    post: post._id
                });

                if (!existing) {
                    await Notification.create({
                        sender: userId,
                        receiver: post.postedBy,
                        type: "like",
                        post: post._id,
                    });
                }

            }
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.status(200).json({
            msg: "Post like status updated",
            likesCount: post.likes.length,
            likes: post.likes 
        });

    } catch (err) {
        res.status(400).json({ msg: "Like action failed", error: err.message });
    }
};
