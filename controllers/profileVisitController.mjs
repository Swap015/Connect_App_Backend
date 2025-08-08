import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

export const visitProfile = async (req, res) => {
    try {
        const visitorId = req.user.userId;
        const profileToVisitId = req.params.id;

        if (visitorId === profileToVisitId) {
            return res.status(400).json({ msg: "This is your profile & therefore it will not counted" });
        }

        const profileToVisit = await User.findById(profileToVisitId);
        if (!profileToVisit) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        const alreadyVisited = profileOwner.profileVisits.some(
            visit => visit.user.toString() === visitorId
        );

        if (!alreadyVisited) {
            // Add visit
            profileOwner.profileVisits.push({
                user: visitorId
            });

            // Create notification
            await Notification.create({
                type: "profileVisit",
                sender: visitorId,
                receiver: profileToVisitId
            });

            await profileOwner.save();
        }

        res.status(200).json({ msg: "Profile visit tracked" });
    }
    catch (err) {
        res.status(400).json({ msg: "Failed to visit profile", error: err.message });
    }
};