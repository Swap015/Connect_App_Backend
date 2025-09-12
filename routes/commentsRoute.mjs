
import express from 'express';
import { addComment, deleteComment, editComment, getSingleComment, getPostComments } from '../controllers/commentController.mjs';
import verifyToken from '../middlewares/authMiddleware.mjs';


const router = express.Router();

//Routes of comments

router.post('/addComment/:postId', verifyToken, addComment);
router.patch('/editComment/:commentId/:postId', verifyToken, editComment);
router.delete('/deleteComment/:commentId/:postId', verifyToken, deleteComment);
router.get('/getPostComments/:postId', verifyToken, getPostComments);
router.get('/getSingleComment/:commentId', verifyToken, getSingleComment);

export default router;