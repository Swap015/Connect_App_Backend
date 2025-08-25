import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

export const visitProfile = async (req, res) => {
    try {
        const visitorId = req.user.userId;
        const profileToVisitId = req.params.id;

        if (visitorId === profileToVisitId) {
            return res.status(400).json({ msg: "This is your profile & therefore it will not be counted" });
        }

        const profileToVisit = await User.findById(profileToVisitId);
        if (!profileToVisit) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        // Check if already visited
        const alreadyVisited = profileToVisit.profileVisits.some(
            (visit) => visit.user.toString() === visitorId
        );

        if (!alreadyVisited) {
            // Add visit
            profileToVisit.profileVisits.push({
                user: visitorId,
                visitedAt: new Date()
            });

            // Create notification
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
        const userId = req.user.userId; // logged-in user

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