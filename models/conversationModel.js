import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    { timestamps: true }
);


conversationSchema.index({ participants: 1, updatedAt: -1 });

//prevent duplicate conversation
conversationSchema.index(
    { "participants.0": 1, "participants.1": 1 },
    { unique: true, partialFilterExpression: { "participants.2": { $exists: false } } }
);


export default mongoose.model("Conversation", conversationSchema);
