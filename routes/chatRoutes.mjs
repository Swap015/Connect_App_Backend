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

router.post("/conversation", verifyToken, getOrCreateConversation);
router.get("/getConversations", verifyToken, listConversations);
router.get("/conversation/:conversationId/messages", verifyToken, getMessages);
router.post("/sendMessage", verifyToken, sendMessage);
router.patch("/conversations/:conversationId/read", verifyToken, markConversationRead);



export default router;
