import express from "express";
import verifyToken from "../middlewares/authMiddleware.mjs";
import { verifyAdmin } from "../middlewares/isAdminMiddleware.mjs";
import {
    adminGetAllUsers,
    adminDeleteUser,
    adminChangeUserRole,
    adminBanUser,
    adminGetAllPosts,
    adminDeletePost,
    adminGetAllJobs,
    adminToggleJobStatus,
    adminDeleteJob
} from "../controllers/AdminController.mjs";
import { getAdminReports } from "../controllers/adminReportController.mjs";


const router = express.Router();

// user routes
router.get("/getusers", verifyToken, verifyAdmin, adminGetAllUsers);
router.delete("/users/:userId", verifyToken, verifyAdmin, adminDeleteUser);
router.patch("/users/:userId/role", verifyToken, verifyAdmin, adminChangeUserRole);
router.patch("/users/:userId/suspend", verifyToken, verifyAdmin, adminBanUser);


// post routes
router.get("/posts", verifyToken, verifyAdmin, adminGetAllPosts);
router.delete("/posts/:postId", verifyToken, verifyAdmin, adminDeletePost);


// job routes
router.get("/getJobs", verifyToken, verifyAdmin, adminGetAllJobs);
router.patch("/:jobId/toggle-status", verifyToken, verifyAdmin, adminToggleJobStatus);
router.delete("/:jobId", verifyToken, verifyAdmin, adminDeleteJob);

// report routes
router.get("/reports", verifyToken, verifyAdmin, getAdminReports);



export default router;
