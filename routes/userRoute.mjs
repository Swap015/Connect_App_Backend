import express from 'express';
import { registerUser, loginUser, getAllUsers, getUser, logoutUser } from '../controllers/userController.mjs';
import { refreshAccessToken } from '../controllers/refreshAccessController.mjs';
import verifyToken from '../middlewares/authMiddleware.mjs';
import { followUser, unfollowUser } from '../controllers/followController.mjs';
import { uploadProfilePic } from '../controllers/profileImgController.mjs';
import {filterUsers}  from "../controllers/userController.mjs";
import { uploadProfile } from '../middlewares/uploadMiddleware.mjs';
const router = express.Router();
import { visitProfile } from '../controllers/profileVisitController.mjs';


//routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getUsers', verifyToken, getAllUsers);
router.get('/getUser/:userId', verifyToken, getUser);
router.post('/logout', verifyToken, logoutUser);
router.post('/refresh', refreshAccessToken);

// Profile picture
router.post('/updateProfilePic', verifyToken, uploadProfile.single('profileImage'), uploadProfilePic);

// Follow/unfollow

router.post('/follow/:id', verifyToken, followUser);
router.post('/unfollow/:id', verifyToken, unfollowUser);

//search users
router.get('/search', verifyToken, filterUsers);

//profile visits
router.put('profileVisit/:id', verifyToken, visitProfile);


export default router;
