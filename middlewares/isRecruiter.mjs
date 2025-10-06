
import User from "../models/userModel.js";

export const verifyRecruiter = async (req, res, next) => {
    try {

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ msg: "Recruiter not found" });
        }

        if (user.role !== "recruiter") {
            return res.status(400).json({ msg: "Only recruiters can be verified" });
        }

        next();
    } catch (err) {
        res.status(500).json({ msg: "Failed to verify recruiter", error: err.message });
    }
};

export default verifyRecruiter;