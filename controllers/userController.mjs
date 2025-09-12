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
            gender
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
            maxAge: 15 * 60 * 1000
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ msg: "Login successful", accessToken, refreshToken });
    }
    catch (err) {
        res.status(400).json({ msg: "Login failed", error: err.message });

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


// search & filter users
export const filterUsers = async (req, res) => {
    try {
        const { keyword, location, skills, company, role } = req.query;

        let query = {};

        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { headline: { $regex: keyword, $options: "i" } }
            ];
        }

        if (location) query.location = { $regex: location, $options: "i" };
        if (company) query.companyName = { $regex: company, $options: "i" };
        if (role) query.role = role;

        if (skills) {
            const skillsArray = skills.split(",").filter(s => s.trim() !== "");
            if (skillsArray.length > 0) {
                query.skills = { $in: skillsArray.map(skill => new RegExp(skill, "i")) };
            }
        }

        const users = await User.find(query).select("-password");

        res.status(200).json({ users });
    } catch (err) {
        res.status(400).json({ msg: "User filter failed", error: err.message });
    }
};


// logged in user
export const getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.status(200).json({ user });
    } catch (err) {
        res.status(400).json({ msg: "Failed to fetch logged-in user" });
    }
};


// update profile details
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updates = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.status(200).json({
            msg: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (err) {
        res.status(400).json({ msg: "Failed to update profile", error: err.message });
    }
};

// mention by name
export const mentionSearch = async (req, res) => {
    try {
        const { q } = req.query; // frontend sends ?q=swap
        if (!q) return res.status(400).json({ msg: "Query is required" });

        const users = await User.find({
            name: { $regex: q, $options: "i" }
        }).select("name profileImage");

        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ msg: "Mention search failed", error: err.message });
    }
};
