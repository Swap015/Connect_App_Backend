import express from 'express';
import verifyToken from "../middlewares/authMiddleware.mjs";
import {
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
    removeConnection,
    getMyConnections,
    getReceivedRequests,
    getSentRequests
} from "../controllers/connectionController.mjs";

const router = express.Router();

router.post("/send/:id", verifyToken, sendConnectionRequest);
router.post("/accept/:id", verifyToken, sendConnectionRequest);
router.post("/reject/:id", verifyToken, sendConnectionRequest);
router.post("/cancel/:id", verifyToken, sendConnectionRequest);
router.post("/remove/:id", verifyToken, sendConnectionRequest);


router.post("/my-connections", verifyToken, sendConnectionRequest);
router.post("/received-requests", verifyToken, sendConnectionRequest);
router.post("/sent-requests", verifyToken, sendConnectionRequest);

export default router;
