
import User from '../models/userModel.js';

export const uploadProfilePic = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!req.file || !req.file.path) {
            return res.status(400).json({ msg: 'Image is required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profileImage: req.file.path },
            { new: true }
        );

        res.status(200).json({
            msg: 'Profile picture uploaded successfully',
            profileImage: updatedUser.profileImage,
        });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to upload profile picture', err });
    }
};


