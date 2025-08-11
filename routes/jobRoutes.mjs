import express from 'express';
import verifyToken from '../middlewares/authMiddleware.mjs';
import { addJob, editJob, getAllJobs, getJobById, deleteJob } from '../controllers/jobController.mjs';

const router = express.Router();

router.post("/addJob", verifyToken, addJob);
router.get("/", getAllJobs);
router.get("/:jobId", getJobById);
router.put("/update/:jobId", verifyToken, editJob);
router.delete("/remove/:jobId", verifyToken, deleteJob);

export default router;