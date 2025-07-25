import express from 'express';
import { registerUser, loginUser, getAllUsers, getUser, logoutUser } from '../controllers/userController.mjs';
import { refreshAccessToken } from '../controllers/refreshAccessController.mjs';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getUsers', getAllUsers);
router.get('/getUser/:id', getUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshAccessToken);

export default router;
