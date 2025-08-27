import User from '../models/userModel.js';
import cloudinary from '../config/cloudinaryConfig.mjs';
import { extractPublicId } from '../utils/extractPublicId.mjs';
import defaultProfilePics from '../config/defaultprofilePics.js';

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

export const updateProfilePic = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!req.file || !req.file.path) {
            return res.status(400).json({ msg: 'New image is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Delete old image
        if (user.profileImage) {
            const publicId = extractPublicId(user.profileImage);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        user.profileImage = req.file.path;
        await user.save();

        res.status(200).json({
            msg: 'Profile picture updated successfully',
            profileImage: user.profileImage,
        });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to update profile picture', error: err.message });
    }
};


export const deleteProfilePic = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user || !user.profileImage) {
            return res.status(400).json({ msg: 'No profile picture to delete' });
        }

        if (user.profileImage) {
            const publicId = extractPublicId(user.profileImage);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }
        //assign default profile pic
        const DEFAULT_PROFILE_PIC = defaultProfilePics[user.gender.toLowerCase()];
        user.profileImage = DEFAULT_PROFILE_PIC;
        await user.save();

        res.status(200).json({
            msg: 'Profile picture deleted successfully',
            profileImage: user.profileImage
        });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to delete profile picture', error: err.message });
    }
};
