import express from 'express';
import { createPost, editPost, deletePost } from '../controllers/postController.mjs';
import verifyToken from '../middlewares/authMiddleware.mjs';

const router = express.Router();

router.post('/createPost', verifyToken, createPost);
router.put('/editPost/:id', verifyToken, editPost);
router.delete('/deletePost/:id', verifyToken, deletePost);

export default router;