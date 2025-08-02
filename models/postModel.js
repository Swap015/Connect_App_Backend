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
        ref: "User"
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        text: {
            type: String,
            trim: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true })

export default mongoose.model("Post", postSchema);