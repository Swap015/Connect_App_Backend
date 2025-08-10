import Job from "../models/jobModel.js";
import User from "../models/userModel.js"

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

        //Add job
        const job = await Job.create({
            title,
            companyName,
            location,
            jobType,
            salaryRange,
            skills,
            description,
            requirements,
            postedBy: req.user._id
        });
        await job.save();
        res.status(200).json({ msg: "Job added successfully", job });

    }
    catch (err) {
        return res.status(500).json({ msg: 'Failed to Add job', error: err.message });
    }

};

