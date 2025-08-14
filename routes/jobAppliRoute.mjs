import express from 'express';
import verifyToken from '../middlewares/authMiddleware.mjs';
import { applyForJob, myApplications, deleteJobApplication, editJobApplication, viewApplicants, updateApplicationStatus } from '../controllers/jobAppliController.mjs';
import { uploadResume } from '../middlewares/uploadMiddleware.mjs';


const router = express.Router();

router.post(
    "/apply",
    verifyToken,
    uploadResume.single("resume"),
    applyForJob
);

router.put(
    "/:applicationId",
    verifyToken,
    uploadResume.single("resume"),
    editJobApplication
);

router.get("/userApplications",
    verifyToken,
    myApplications);

router.get("/getApplicants/:applicationId",
    verifyToken,
    viewApplicants);

router.put("/edit/:applicationId",
    verifyToken,
    updateApplicationStatus);

router.delete("/delete/:applicationId",
    verifyToken,
    deleteJobApplication);


export default router;