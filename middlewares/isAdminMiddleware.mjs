import User from "../models/userModel.js";

 export const verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied, Admins only" });
        }
        next();
    } catch (err) {
        res.status(500).json({ msg: "Failed to verify admin", error: err.message });
    }
};

export default verifyAdmin;