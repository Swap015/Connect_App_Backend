import express from 'express';
import verifyToken from '../middlewares/authMiddleware.mjs';
import { getNotifications, markAllAsRead, markOneAsRead, deleteNotification } from '../controllers/notificationController.mjs';

const router = express.Router();

router.get('/getNotifications', verifyToken, getNotifications);
router.patch('/markAllAsRead', verifyToken, markAllAsRead);
router.patch('/markOneAsRead/:id', verifyToken, markOneAsRead);
router.delete('/deleteNotification/:id', verifyToken, deleteNotification);

export default router;