import express from 'express';
import { addJob, editJob, getAllJobs, getJobById, deleteJob } from '../controllers/jobController.mjs';
import { verifyRecruiter } from '../middlewares/isRecruiter.mjs';
import verifyToken from '../middlewares/authMiddleware.mjs';

const router = express.Router();

router.post("/addJob", verifyToken, verifyRecruiter, addJob);
router.get("/", getAllJobs);
router.get("/:jobId", verifyToken, getJobById);
router.put("/update/:jobId", verifyToken, verifyRecruiter, editJob);
router.delete("/remove/:jobId", verifyToken, verifyRecruiter, deleteJob);


export default router;