import User from "../models/userModel.mjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { generateAccessToken } from "../utils/tokenUtil.mjs";


export const refreshAccessToken = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ msg: "Access token is missing" });
        }
        let decoded = jwt.verify(accessToken, process.env.JWT_SECRET, {
            ignoreExpiration: true,
        });

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ msg: "User not found" });
        }
        const refreshToken = user.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ msg: "Refresh token is missing" });
        }

        try {
            const valid = jwt.verify(user.refreshToken, process.env.JWT_SECRET);
            if (valid.userId !== user.id) {
                return res.status(403).json({ msg: "Refresh token not valid" });
            }
        } catch (err) {
            return res.status(403).json({ msg: "Refresh token expired or invalid" });
        }

        const newAccessToken = generateAccessToken(user._id);
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        })

        res.status(200).json({ msg: "Access token refreshed", accessToken: newAccessToken });
    }
    catch (err) {
        res.status(400).json({ msg: "Access token refresh failed" });
    }
};