import express from 'express';
import { registerUser, loginUser, getAllUsers, getUser, logoutUser } from '../controllers/userController.mjs';
import { refreshAccessToken } from '../controllers/refreshAccessController.mjs';
import verifyToken from '../middlewares/authMiddleware.mjs';
import { followUser, unfollowUser } from '../controllers/followController.mjs';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getUsers', verifyToken, getAllUsers);
router.get('/getUser/:userId', verifyToken, getUser);
router.post('/logout', verifyToken, logoutUser);
router.post('/refresh', refreshAccessToken);

// Follow/unfollow

router.post('/follow/:id', verifyToken, followUser);
router.post('/unfollow/:id', verifyToken, unfollowUser);


export default router;
