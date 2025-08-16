import express from 'express';
import verifyToken from "../middlewares/authMiddleware.mjs";
import { uploadProfilePic, updateProfilePic, deleteProfilePic } from "../controllers/profileController.mjs";
import { uploadProfile } from "../middlewares/uploadMiddleware.mjs";

const router = express.Router();

router.post('/upload', verifyToken, uploadProfile.single('file'), uploadProfilePic);
router.put('/update', verifyToken, uploadProfile.single('file'), updateProfilePic);
router.delete('/delete', verifyToken, deleteProfilePic);

export default router;