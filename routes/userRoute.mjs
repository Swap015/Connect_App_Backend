import express from 'express';
import { registerUser, loginUser, getAllUsers, getUser, logoutUser } from '../controllers/userController.mjs';
import { refreshAccessToken } from '../controllers/refreshAccessController.mjs';
import verifyToken from '../middlewares/authMiddleware.mjs';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getUsers', verifyToken, getAllUsers);
router.get('/getUser/:id', verifyToken, getUser);
router.post('/logout', verifyToken, logoutUser);
router.post('/refresh', refreshAccessToken);

export default router;
