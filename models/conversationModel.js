import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
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


conversationSchema.index({ participants: 1 });
conversationSchema.index({ participants: 1, updatedAt: -1 });


export default mongoose.model("Conversation", conversationSchema);
