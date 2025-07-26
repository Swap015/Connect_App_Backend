import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        trim: true
    },
    file: [{
        type: String
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

export default mongoose.model("Post", postSchema);