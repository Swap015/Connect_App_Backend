import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken }
    from '../utils/tokenUtil.mjs';

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, bio, location, avatar, companyName, positionAtCompany } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }
        if (!name || !email || !password || !role) {
            return res.status(400).json({ msg: "All fields are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            name,
            email,
            password: hashedPassword,
            role,
            bio,
            location,
            avatar,
            companyName,
            positionAtCompany
        }
        const user = new User(userData);
        await user.save();
        res.status(201).json({ msg: "User Registered" });
    }
    catch (err) {
        res.status(400).json({ msg: "Registration failed" });
    }

};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET;
    const EXPIRY_DATE = process.env.EXPIRY_DATE;
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
        res.status(200).json({ msg: "Login successful", token });
    }
    catch (err) {
        res.status(400).json({ msg: "Login failed" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to fetch users" });
    }
};
