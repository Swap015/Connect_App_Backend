import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        trim: true
    },
    commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Comment", commentSchema);