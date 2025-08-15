import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Shortlisted", "Rejected", "Hired"],
        default: "Pending"
    },
    resumeUrl: {
        type: String,
        required: true
    },
    coverLetter: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
