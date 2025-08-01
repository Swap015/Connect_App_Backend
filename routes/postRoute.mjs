import express from 'express';
import { createPost, editPost, deletePost, getUserPosts, getAllPosts } from '../controllers/postController.mjs';
import { addComment, deleteComment, editComment, getSingleComment, getPostComments } from '../controllers/commentController.mjs';
import verifyToken from '../middlewares/authMiddleware.mjs';

const router = express.Router();

router.post('/createPost/:postId', verifyToken, createPost);
router.patch('/editPost/:postId', verifyToken, editPost);
router.delete('/deletePost/:postId', verifyToken, deletePost);
router.get('/userPosts/:userId', verifyToken, getUserPosts);
router.get('/allPosts', verifyToken, getAllPosts);

//Routes of comments on the post 
router.post('/addComment/:postId', verifyToken, addComment);
router.patch('/editComment/:commentId/:postId', verifyToken, editComment);
router.delete('/deleteComment/:commentId/:postId', verifyToken, deleteComment);
router.get('/getPostComments/:postId', verifyToken, getPostComments);
router.get('/getSingleComment/:commentId', verifyToken, getSingleComment);

export default router;