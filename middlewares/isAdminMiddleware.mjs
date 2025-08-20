
import User from "../models/userModel.js";

export const verifyAdmin = (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied, Admins only" });
        }
        next();
    } catch (err) {
        res.status(401).json({ msg: "Not authorized" });
    }
};
