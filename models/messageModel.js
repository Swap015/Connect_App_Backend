import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String },     // cloudinary id 
    type: { type: String, enum: ['image', 'video', 'file'], required: true },
    mimeType: { type: String },
    size: { type: Number },
    originalName: { type: String },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number }        //for videos
}, { _id: false });

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    attachments: { type: [attachmentSchema], default: [] },

    readAt: { type: Date, default: null },
    deletedBy: [{
        type: mongoose.Schema.Types.ObjectId, ref: "User",
    }]

}, { timestamps: true });

messageSchema.index({ conversation: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema); 
