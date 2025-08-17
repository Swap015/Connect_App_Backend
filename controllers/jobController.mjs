import Job from "../models/jobModel.js";


export const addJob = async (req, res) => {
    try {
        const {
            title, description, companyName, jobType, skills, requirements, location, salaryRange, isJobActive
        } = req.body;

        if (!title || !companyName || !location || !jobType || !requirements || !description) {
            return res.status(400).json({ msg: "All the fields are required" });
        }

        //  job type validation
        const validJobTypes = ["Full Time", "Part Time", "Internship"];
        if (!validJobTypes.includes(jobType)) {
            return res.status(400).json({ msg: "Invalid job type" });
        }

        // salary validation
        if (salaryRange) {
            if (salaryRange.min < 0 || salaryRange.max < 0) {
                return res.status(400).json({ msg: "Salary cannot be negative" });
            }
            if (salaryRange.min > salaryRange.max) {
                return res.status(400).json({ msg: "Minimum salary cannot be greater than maximum salary" });
            }
        }

        // skills validation
        if (!Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({ msg: "At least one skill is required" });
        }

        // requirements validation
        if (!Array.isArray(requirements) || requirements.length === 0) {
            return res.status(400).json({ msg: "At least one requirement is required" });
        }


        const job = await Job.create({
            title,
            companyName,
            location,
            jobType,
            salaryRange,
            skills,
            description,
            requirements,
            postedBy: req.user.userId
        });

        res.status(200).json({ msg: "Job added successfully", job });

    }
    catch (err) {
        return res.status(500).json({ msg: 'Failed to Add job', error: err.message });
    }

};


export const editJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const recruiterId = req.user.userId;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: "Job not found" });
        }

        if (job.postedBy.toString() !== recruiterId) {
            return res.status(403).json({ msg: "Unauthorized to edit this job" });
        }

        const fieldsToUpdate = [
            "title",
            "description",
            "companyName",
            "jobType",
            "skills",
            "requirements",
            "location",
            "salaryRange",
            "isJobActive"
        ];

        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                job[field] = req.body[field];
            }
        });

        await job.save();

        res.status(200).json({
            msg: "Job details updated successfully",
            job
        });
    } catch (err) {
        res.status(500).json({
            msg: "Failed to edit job",
            error: err.message
        });
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isJobActive: true })
            .populate("postedBy", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({ jobs });
    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch jobs", error: err.message });
    }
};


export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId)
            .populate("postedBy", "name email");
        if (!job) return res.status(404).json({ msg: "Job not found" });

        res.status(200).json({ job });
    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch job", error: err.message });
    }
};


export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ msg: "Job not found" });

        if (job.postedBy.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Unauthorized" });
        }

        await job.deleteOne();
        res.status(200).json({ msg: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to delete job", error: err.message });
    }
};
