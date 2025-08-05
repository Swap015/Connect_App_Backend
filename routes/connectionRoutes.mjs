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
router.post("/accept/:id", verifyToken, acceptConnectionRequest);
router.post("/reject/:id", verifyToken, rejectConnectionRequest);
router.post("/cancel/:id", verifyToken, cancelConnectionRequest);
router.delete("/remove/:id", verifyToken, removeConnection);


router.get("/my-connections", verifyToken, getMyConnections);
router.get("/received-requests", verifyToken, getReceivedRequests);
router.get("/sent-requests", verifyToken, getSentRequests);

export default router;
