
export const isRecruiter = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        if (req.user.role !== "recruiter") {
            return res.status(403).json({ msg: "Access denied ,Only recruiter allowed" });
        }
        next();
    }
    catch (err) {
        return res.status(500).json({ msg: "Internal Server Error", error: err.message });
    }

};