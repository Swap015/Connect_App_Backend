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
            resumeUrl: req.file.path,
            coverLetter
        });
        await application.save();

        // Update job applicants list & count
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
            .populate("job", "title companyName location")
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

        //filters
        let filters = { job: jobId };
        if (status) filters.status = status;
        if (location) filters["applicant.location"] = location;
        if (skill) filters["applicant.skills"] = skill;

        let applicants = await Application.find({ job: jobId })
            .populate({
                path: "applicant",
                select: "name email location skills",
                match: {
                    ...(location ? { location } : {}),
                    ...(skill ? { skills: skill } : {})
                }
            }).sort({ createdAt: -1 });


        applicants = applicants.filter(app => {
            const user = app.applicant;
            if (!user) return false;

            let matches = true;

            // filter by location
            if (location && user.location?.toLowerCase() !== location.toLowerCase()) {
                matches = false;
            }

            // filter by skills 
            if (skills) {
                const skillArray = skills.split(",").map(s => s.trim().toLowerCase());
                const userSkills = user.skills.map(s => s.toLowerCase());
                const hasAllSkills = skillArray.every(skill => userSkills.includes(skill));
                if (!hasAllSkills) matches = false;
            }

            // search by name or email 
            if (search) {
                const q = search.toLowerCase();
                if (!user.name.toLowerCase().includes(q) && !user.email.toLowerCase().includes(q)) {
                    matches = false;
                }
            }

            return matches;
        });

        res.status(200).json({ applicants });

    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch applicants", error: err.message });
    }
};

export const changeApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;

        const application = await Application.findById(applicationId).populate("job").populate("applicant", "name");
        if (!application) {
            return res.status(404).json({ msg: "Application not found" });
        }

        if (application.job.postedBy.toString() !== userId) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        application.status = status;
        await application.save();

        //Notification 
        await Notification.create({
            type: "jobStatusUpdate",
            sender: userId,                    // recruiter
            receiver: application.applicant._id, // applicant
            job: application.job._id,
            message: `Your application for "${application.job.title}" is now "${status}".`
        });

        res.status(200).json({ msg: "Status updated successfully", application });

    } catch (err) {
        res.status(500).json({ msg: "Failed to update status", error: err.message });
    }
};



