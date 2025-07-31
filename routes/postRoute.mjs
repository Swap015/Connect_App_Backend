import express from 'express';
import { createPost, editPost, deletePost, getUserPosts, getAllPosts } from '../controllers/postController.mjs';
import verifyToken from '../middlewares/authMiddleware.mjs';

const router = express.Router();

router.post('/createPost', verifyToken, createPost);
router.patch('/editPost/:id', verifyToken, editPost);
router.delete('/deletePost/:id', verifyToken, deletePost);
router.get('/userPosts/:userId', verifyToken, getUserPosts);
router.get('/allPosts', verifyToken, getAllPosts);

export default router;