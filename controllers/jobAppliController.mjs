import Application from '../models/jobApplicationModel.js';
import Job from '../models/jobModel.js';

export const applyForJob = async (req, res) => {
    try {
        const { jobId, coverLetter } = req.body;
        const userId = req.user.userId;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: "Job not found" });
        }

        if (job.postedBy.toString() === userId) {
            return res.status(400).json({ msg: "You cannot apply to your own job" });
        }

        const application = await Application.create({
            job: jobId,
            applicant: userId,
            coverLetter
        });

        job.applicantsCount += 1;
        await job.save();

        res.status(201).json({ msg: "Applied successfully", application });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: "You have already applied for this job" });
        }
        res.status(500).json({ msg: "Failed to apply", error: err.message });
    }
};


export const viewApplicants = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.userId;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: "Job not found" });
        }

        if (job.postedBy.toString() !== userId) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        const applicants = await Application.find({ job: jobId })
            .populate("applicant", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ applicants });

    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch applicants", error: err.message });
    }
};


export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;

        const application = await Application.findById(applicationId).populate("job");
        if (!application) {
            return res.status(404).json({ msg: "Application not found" });
        }

        if (application.job.postedBy.toString() !== userId) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        application.status = status;
        await application.save();

        res.status(200).json({ msg: "Status updated successfully", application });

    } catch (err) {
        res.status(500).json({ msg: "Failed to update status", error: err.message });
    }
};


export const myApplications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const applications = await Application.find({ applicant: userId })
            .populate("job", "title companyName location")
            .sort({ createdAt: -1 });

        res.status(200).json({ applications });

    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch applications", error: err.message });
    }
};
