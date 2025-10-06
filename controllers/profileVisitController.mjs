import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

export const visitProfile = async (req, res) => {
    try {
        const visitorId = req.user.userId;
        const profileToVisitId = req.params.id;


        const profileToVisit = await User.findById(profileToVisitId);
        if (!profileToVisit) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        const alreadyVisited = profileToVisit.profileVisits.some(
            (visit) => visit.user.toString() === visitorId
        );

        if (!alreadyVisited) {
            profileToVisit.profileVisits.push({
                user: visitorId,
                visitedAt: new Date()
            });

            await Notification.create({
                type: "profileVisit",
                sender: visitorId,
                receiver: profileToVisitId
            });

            await profileToVisit.save();
        }

        res.status(200).json({ msg: "Profile visit tracked" });
    } catch (err) {
        res.status(400).json({ msg: "Failed to visit profile", error: err.message });
    }
};


export const getProfileVisits = async (req, res) => {
    try {
        const userId = req.user.userId; 

        const user = await User.findById(userId)
            .populate("profileVisits.user", "name email profileImage headline");

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.status(200).json({
            total: user.profileVisits.length,
            visits: user.profileVisits,
        });
    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch profile visits", error: err.message });
    }
};