import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { generateAccessToken } from "../utils/tokenUtil.mjs";


export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ msg: "Refresh token is missing" });
        }
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(403).json({ msg: "Refresh token expired or invalid" });
        }
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ msg: "Refresh token not valid" });
        }
        const newAccessToken = generateAccessToken(user._id);
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({ msg: "Access token refreshed" });
    } catch (err) {
        res.status(400).json({ msg: "Access token refresh failed" });
    }
};
