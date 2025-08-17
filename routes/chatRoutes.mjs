import express from "express";
import verifyToken from "../middlewares/authMiddleware.mjs";
import {
    getOrCreateConversation,
    listConversations,
    sendMessage,
    getMessages,
    markConversationRead
} from "../controllers/chatController.mjs";

const router = express.Router();

router.post("/conversations", verifyToken, getOrCreateConversation);
router.get("/conversations", verifyToken, listConversations);
router.get("/conversations/:conversationId/messages", verifyToken, getMessages);
router.post("/messages", verifyToken, sendMessage);
router.patch("/conversations/:conversationId/read", verifyToken, markConversationRead);

export default router;
