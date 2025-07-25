import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "recruiter", "admin"],
        default: "user",
        required: true
    },
    refreshToken: {
        type: String
    },
    bio: {
        type: String,
    },
    location: {
        type: String
    },
    avatar: {
        type: String
    },
    companyName: {
        type: String,

    },
    positionAtCompany: {
        type: String,

    },
},
    {
        timestamps: true
    }
);

export default mongoose.model('User', userSchema);