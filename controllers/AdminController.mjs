import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import cloudinary from "../config/cloudinaryConfig.mjs";
import { extractPublicId } from "../utils/extractPublicId.mjs";
import Job from "../models/jobModel.js";


export const adminGetAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password -refreshToken");
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ msg: "Failed to fetch users" });
    }
};


export const adminDeleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.status(200).json({ msg: "User deleted successfully" });
    } catch (err) {
        res.status(400).json({ msg: "Failed to delete user" });
    }
};


export const adminChangeUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!["user", "recruiter", "admin"].includes(role)) {
            return res.status(400).json({ msg: "Invalid role" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.status(200).json({ msg: "User role updated", user: updatedUser });
    } catch (err) {
        res.status(400).json({ msg: "Failed to update role" });
    }
};

// ban user
export const adminBanUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isVerified: false },
            { new: true }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.status(200).json({ msg: "User suspended", user: updatedUser });
    } catch (err) {
        res.status(400).json({ msg: "Failed to suspend user" });
    }
};

//POSTS

export const adminGetAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("postedBy", "name email role profileImage")
            .sort({ createdAt: -1 });

        res.status(200).json({ posts });
    } catch (err) {
        res.status(400).json({ msg: "Failed to fetch posts", error: err.message });
    }
};

export const adminDeletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // Delete media from Cloudinary
        if (Array.isArray(post.file) && post.file.length > 0) {
            for (const img of post.file) {
                const publicId = extractPublicId(img);
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await Post.findByIdAndDelete(req.params.postId);
        res.status(200).json({ msg: "Post deleted by admin" });
    } catch (err) {
        res.status(400).json({ msg: "Admin post deletion failed", error: err.message });
    }
};

//jobs

export const adminGetAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate("postedBy", "name email")
            .sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ msg: "No jobs found" });
        }

        res.status(200).json({ jobs });
    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch jobs", error: err.message });
    }
};

// Update job status 
export const adminToggleJobStatus = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ msg: "Job not found" });

        job.isJobActive = !job.isJobActive;
        await job.save();

        res.status(200).json({ msg: "Job status updated", job });
    } catch (err) {
        res.status(500).json({ msg: "Failed to update job status", error: err.message });
    }
};

// Delete  job
export const adminDeleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ msg: "Job not found" });

        await job.deleteOne();
        res.status(200).json({ msg: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to delete job", error: err.message });
    }
};