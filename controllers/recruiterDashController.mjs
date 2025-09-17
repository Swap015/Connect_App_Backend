
import Job from "../models/jobModel.js";
import Application from "../models/jobApplicationModel.js";

export const getRecruiterDashboard = async (req, res) => {
    try {
        const recruiterId = req.user.userId;

        const totalJobs = await Job.countDocuments({ postedBy: recruiterId });

        const totalApplicants = await Application.countDocuments({
            job: { $in: await Job.find({ postedBy: recruiterId }).distinct("_id") }
        });

        const statusCounts = await Application.aggregate([
            {
                $lookup: {
                    from: "jobs",
                    localField: "job",
                    foreignField: "_id",
                    as: "jobData"
                }
            },
            { $unwind: "$jobData" },
            { $match: { "jobData.postedBy": recruiterId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format status counts
        const statusSummary = {
            Pending: 0,
            Shortlisted: 0,
            Rejected: 0,
            Hired: 0,
        };
        statusCounts.forEach(item => {
            statusSummary[item._id] = item.count;
        });

        res.status(200).json({
            totalJobs,
            totalApplicants,
            statusSummary,
        });

    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch dashboard data", error: err.message });
    }
};
