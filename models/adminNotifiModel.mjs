import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: ["info", "warning", "alert"],
        default: "info"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isGlobal: { type: Boolean, default: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export default mongoose.model("AdminNotification", adminNotificationSchema);
