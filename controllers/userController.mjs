import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken }
    from '../utils/tokenUtil.mjs';
import defaultProfilePics from "../config/defaultprofilePics.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, location, companyName, gender, education, skills, headline, positionAtCompany } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }
        if (!name || !email || !password || !role || !gender) {
            return res.status(400).json({ msg: "All fields are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        //Set default profile pic
        const profileImage = defaultProfilePics[gender.toLowerCase()];

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            location,
            companyName,
            positionAtCompany,
            profileImage,
            education,
            skills,
            headline,
        });

        await user.save();
        res.status(201).json({ msg: "User Registered" });
    }
    catch (err) {
        res.status(400).json({ msg: "Registration failed" });
    }

};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        })

        res.status(200).json({ msg: "Login successful", accessToken, refreshToken });
    }
    catch (err) {
        res.status(400).json({ msg: "Login failed" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ users });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to fetch users" });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        res.status(200).json({ user });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to fetch user" });
    }
};

export const logoutUser = async (req, res) => {

    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(401).json({ msg: "something's wrong" });
        }
        user.refreshToken = null;
        await user.save();
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });
        res.status(200).json({ msg: "Logged Out" });
    }
    catch (err) {
        res.status(400).json({ msg: "Logout failed" });

    }
};

//Search user

export const searchUsers = async (req, res) => {
    try {
        const { keyword } = req.query;
        const users = await User.find({
            name: { $regex: keyword, $options: "i" }
        }).select("-password");

        res.status(200).json({ users });
    } catch (err) {
        res.status(400).json({ msg: "User search failed", error: err.message });
    }
};
