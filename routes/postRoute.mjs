import express from 'express';
import { createPost, editPost, deletePost, getUserPosts, getAllPosts, searchPosts } from '../controllers/postController.mjs';
import { addComment, deleteComment, editComment, getSingleComment, getPostComments } from '../controllers/commentController.mjs';
import { likePost } from '../controllers/likeController.mjs';
import verifyToken from '../middlewares/authMiddleware.mjs';

const router = express.Router();

router.post('/createPost', verifyToken, uploadPost.array('file', 5), createPost);
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

//Route for like
router.patch('/likePost/:postId', verifyToken, likePost);

//Search posts
router.get("/sesrch", verifyToken, searchPosts);

export default router;