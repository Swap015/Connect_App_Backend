import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({

    type: {
        type: String,
        enum: ["like", "comment", "follow", "newPost", "profileVisit", "mention", "jobApplication",
            "jobStatusUpdate"],
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    read: {
        type: Boolean,
        default: false
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }


})

export default mongoose.model("Notification", notificationSchema);