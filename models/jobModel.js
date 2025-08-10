import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    jobType: {
        type: String, enum: ["Full Time", "Part Time", "Internship"], default: "Full Time"
    },
    skills: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    location: { type: String, trim: true },
    salaryRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 }
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    applicantsCount: { type: Number, default: 0 },
    isJobActive: { type: Boolean, default: true },

}, {
    timestamps: true
});


export default mongoose.model("Job", jobSchema);