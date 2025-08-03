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
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "male"
    },
    role: {
        type: String,
        enum: ["user", "recruiter", "admin"],
        default: "user",
        required: true
    },
    refreshToken: {
        type: String,
        default: null,
    },
    experience: {
        type: String,
    },
    location: {
        type: String
    },
    profileImage: {
        type: String
    },
    education: [{
        SSC: { type: String },
        HSC: { type: String },
        diploma: { type: String },
        degree: { type: String }
    }],
    skills: [{
        type: String
    }],
    companyName: {
        type: String,

    },
    headline: {
        type: String,


    },
    positionAtCompany: {
        type: String,

    },
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    connectionRequests: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    sentRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
},
    {
        timestamps: true
    }
);

export default mongoose.model('User', userSchema);