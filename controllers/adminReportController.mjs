import User from "../models/userModel.js";
import Job from "../models/jobModel.js";
import Application from "../models/jobApplicationModel.js";
import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";

export const getAdminReports = async (req, res) => {
    try {
        // Users
        const totalUsers = await User.countDocuments();
        const recruitersCount = await User.countDocuments({ role: "recruiter" });
        const candidatesCount = await User.countDocuments({ role: "candidate" });

        // Jobs
        const totalJobs = await Job.countDocuments();
        const activeJobs = await Job.countDocuments({ isJobActive: true });
        const inactiveJobs = await Job.countDocuments({ isJobActive: false });

        const jobsByType = await Job.aggregate([
            { $group: { _id: "$jobType", count: { $sum: 1 } } }
        ]);

        // Applications
        const totalApplications = await Application.countDocuments();
        const applicationsPerJob = await Application.aggregate([
            { $group: { _id: "$jobId", count: { $sum: 1 } } }
        ]);

        // Posts & Engagement
        const totalPosts = await Post.countDocuments();
        const totalComments = await Comment.countDocuments();

        // Return analytics
        res.status(200).json({
            users: {
                totalUsers,
                recruitersCount,
                candidatesCount
            },
            jobs: {
                totalJobs,
                activeJobs,
                inactiveJobs,
                jobsByType
            },
            applications: {
                totalApplications,
                applicationsPerJob
            },
            engagement: {
                totalPosts,
                totalComments
            }
        });
    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch reports", error: err.message });
    }
};
