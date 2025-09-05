
import User from "../models/userModel.js";

export const verifyRecruiter = async (req, res) => {
    try {
        const { recruiterId } = req.params;

        const user = await User.findById(recruiterId);
        if (!user) {
            return res.status(404).json({ msg: "Recruiter not found" });
        }

        if (user.role !== "recruiter") {
            return res.status(400).json({ msg: "Only recruiters can be verified" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ msg: "Recruiter not verified yet" });
        }

        res.status(200).json({ msg: "Recruiter verified successfully", user });
        next();
    } catch (err) {
        res.status(500).json({ msg: "Failed to verify recruiter", error: err.message });
    }
};
