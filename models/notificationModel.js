import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({

    type: {
        type: String,
        enum: ["like", "comment", "follow", "newPost", "profileVisit", "mention"],
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
    createdAt: {
        type: Date,
        default: Date.now
    }


})

export default mongoose.model("Notification", notificationSchema);