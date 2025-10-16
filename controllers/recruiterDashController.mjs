
import Job from "../models/jobModel.js";
import Application from "../models/jobApplicationModel.js";

export const getRecruiterDashboard = async (req, res) => {
    try {
        const recruiterId = req.user.userId;

        const totalJobs = await Job.countDocuments({ postedBy: recruiterId });

        const jobIds = await Job.find({ postedBy: recruiterId }).distinct("_id");

        const totalApplicants = await Application.countDocuments({
            job: { $in: jobIds }
        });

        const statusCounts = await Application.aggregate([
            { $match: { job: { $in: jobIds } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
      

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
            statusSummary
        });

    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch dashboard data", error: err.message });
    }
};
