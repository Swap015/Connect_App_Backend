import express from 'express';
import verifyToken from '../middlewares/authMiddleware.mjs';
import { applyForJob, myApplications, deleteJobApplication, editJobApplication, viewApplicants, updateApplicationStatus } from '../controllers/jobAppliController.mjs';
import { uploadResume } from '../middlewares/uploadMiddleware.mjs';


const router = express.Router();

//user routes

router.post(
    "/apply",
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

router.get("/getApplicants/:applicationId",
    verifyToken,
    viewApplicants);

router.put("/updateStatus/:applicationId",
    verifyToken,
    updateApplicationStatus);




export default router;