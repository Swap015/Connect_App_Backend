import cloudinary from '../config/cloudinaryConfig.mjs';
import { extractPublicId } from '../utils/extractPublicId.mjs';
import Post from "../models/postModel.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";




export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const images = req.files;
        if (!content && (!images || images.length === 0)) {
            return res.status(400).json({ msg: "At least content or one image is required" });
        }
        const imageUrls = images ? images.map(file => file.path) : [];

        const post = new Post({
            content,
            file: imageUrls,
            postedBy: req.user.userId
        });
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
        res.status(201).json({ msg: 'Post created successfully', post });
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
        const { content } = req.body;
        const newFiles = req.files;

        //delete old files from Cloudinary
        if (newFiles && newFiles.length > 0) {
            if (Array.isArray(post.file) && post.file.length > 0) {
                for (const img of post.file) {
                    const publicId = extractPublicId(img);
                    await cloudinary.uploader.destroy(publicId);
                }
            }
            // replace with new uploaded file URLs
            post.file = newFiles.map(file => file.path);
        }

        if (content !== undefined) {
            post.content = content
        }
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
        const keyword = req.query.keyword?.trim() || "";

        const posts = await Post.find({
            content: { $regex: keyword, $options: "i" }
        }).populate("postedBy", "name profileImage");

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

        // Delete images from Cloudinary
        if (Array.isArray(post.file) && post.file.length > 0) {
            for (const img of post.file) {
                const publicId = extractPublicId(img);
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await Post.findByIdAndDelete(req.params.postId);
        res.status(200).json({ msg: "Post deleted " });
    }
    catch (err) {
        res.status(400).json({ msg: "Post deletion failed" });
    }
};






