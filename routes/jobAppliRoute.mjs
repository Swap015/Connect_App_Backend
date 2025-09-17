import express from 'express';
import verifyToken from '../middlewares/authMiddleware.mjs';
import {verifyRecruiter} from '../middlewares/isRecruiter.mjs';
import { applyForJob, myApplications, deleteJobApplication, editJobApplication, viewApplicants, changeApplicationStatus } from '../controllers/jobAppliController.mjs';
import { uploadResume } from '../middlewares/uploadMiddleware.mjs';


const router = express.Router();

//user routes

router.post(
    "/apply/:jobId",
    verifyToken,
    uploadResume.single("resume"),
    applyForJob
);

router.put(
    "/editApplication/:applicationId",
    verifyToken,
    uploadResume.single("resume"),
    editJobApplication
);

router.get("/userApplications",
    verifyToken,
    myApplications);

router.delete("/delete/:applicationId",
    verifyToken,
    deleteJobApplication);


//recruiter routes

router.get("/getApplicants/:jobId",
    verifyToken, verifyRecruiter,
    viewApplicants);

router.put("/updateStatus/:applicationId",
    verifyToken, verifyRecruiter,
    changeApplicationStatus);



export default router;