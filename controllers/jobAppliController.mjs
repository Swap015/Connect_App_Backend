import Application from '../models/jobApplicationModel.js';
import Job from '../models/jobModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import cloudinary from '../config/cloudinaryConfig.mjs';
import { extractPublicId } from '../utils/extractPublicId.mjs';

//for Applicants

export const applyForJob = async (req, res) => {
    try {
        const { coverLetter } = req.body;
        const userId = req.user.userId;
        const { jobId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (user.role !== "user") {
            return res.status(403).json({ msg: "Only users can apply for job" });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: "Job not found" });
        }

        if (job.postedBy.toString() === userId) {
            return res.status(400).json({ msg: "You cannot apply to your own job" });
        }

        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({ msg: "You have already applied for this job" });
        }

        if (!req.file || !req.file.path) {
            return res.status(400).json({ msg: "Resume file is required" });
        }

        const application = new Application({
            job: jobId,
            applicant: userId,
            resumeUrl: req.file?.path || req.file?.secure_url,
            coverLetter
        });
        await application.save();

        job.applications.push(application._id);
        await job.save();

        //Notification
        await Notification.create({
            type: "jobApplication",
            sender: userId,           // Applicant
            receiver: job.postedBy,  // Recruiter
            job: jobId,
            message: `${user.name} has applied for your job "${job.title}"`
        });

        res.status(201).json({ msg: "Applied successfully", application });

    } catch (err) {
        res.status(500).json({ msg: "Failed to apply", error: err.message });
    }
};


export const myApplications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const applications = await Application.find({ applicant: userId })
            .populate("job", "title companyName location resumeUrl ")
            .sort({ createdAt: -1 });

        res.status(200).json({ applications });

    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch applications", error: err.message });
    }
};


export const deleteJobApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const userId = req.user.userId;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ msg: "Application not found" });
        }

        if (application.applicant.toString() !== userId) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        if (application.resumeUrl) {
            const publicId = extractPublicId(application.resumeUrl);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await Job.findByIdAndUpdate(application.job, {
            $pull: { applications: application._id }
        });

        await application.deleteOne();

        res.status(200).json({ msg: "Application deleted successfully" });

    } catch (err) {
        res.status(500).json({ msg: "Failed to delete application", error: err.message });
    }
};

export const editJobApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { coverLetter, resume } = req.body;
        const userId = req.user.userId;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ msg: "Application not found" });
        }

        if (application.applicant.toString() !== userId) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        if (coverLetter !== undefined) {
            application.coverLetter = coverLetter;
        }
        // If a new resume is uploaded
        if (req.file && req.file.path) {

            // Delete old resume from Cloudinary
            if (application.resumeUrl) {
                const publicId = extractPublicId(application.resumeUrl);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }

            application.resumeUrl = req.file.path;
        }

        await application.save();

        res.status(200).json({
            msg: "Application updated successfully",
            application
        });

    } catch (err) {
        res.status(500).json({ msg: "Failed to update application", error: err.message });
    }
};

//for Recruiters 

export const viewApplicants = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.userId;
        const { status, location, skills, search } = req.query;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: "Job not found" });
        }

        if (job.postedBy.toString() !== userId) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        const query = { job: jobId };
        if (status) query.status = status;

        let applications = await Application.find(query)
            .populate("applicant", "name email location skills resumeUrl coverLetter")
            .sort({ createdAt: -1 });

        const filtered = applications.filter(app => {
            const user = app.applicant;
            if (!user) return false;

            if (location) {
                if (!user.location || user.location.toLowerCase() !== location.toLowerCase()) {
                    return false;
                }
            }

            if (skills) {
                const expected = skills.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
                const userSkills = (user.skills || []).map(s => String(s).toLowerCase());
                if (!expected.every(sk => userSkills.includes(sk))) return false;
            }

            if (search) {
                const q = search.toLowerCase();
                const name = (user.name || "").toLowerCase();
                const email = (user.email || "").toLowerCase();
                if (!name.includes(q) && !email.includes(q)) return false;
            }

            return true;
        });

        return res.status(200).json({ applicants: filtered });
    } catch (err) {
        console.error("viewApplicants error:", err);
        return res.status(500).json({ msg: "Failed to fetch applicants", error: err.message });
    }
};


export const changeApplicationStatus = async (req, res) => {
    try {
        const { applicationId, jobId } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;

        const allowedStatuses = ["Pending", "Shortlisted", "Rejected", "Hired"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ msg: "Invalid status value" });
        }

        const application = await Application.findById(applicationId)
            .populate("job")
            .populate("applicant", "name email");
        if (!application) {
            return res.status(404).json({ msg: "Application not found" });
        }

        if (application.job.postedBy.toString() !== userId) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        application.status = status;
        await application.save();

        await Notification.create({
            type: "jobStatusUpdate",
            sender: userId,                        // recruiter
            receiver: application.applicant._id,   // applicant
            job: application.job._id,
            message: `Your application for "${application.job.title}" is now "${status}".`
        });

        res.status(200).json({
            msg: "Status updated successfully",
            application
        });

    } catch (err) {
        res.status(500).json({ msg: "Failed to update status", error: err.message });
    }
};


