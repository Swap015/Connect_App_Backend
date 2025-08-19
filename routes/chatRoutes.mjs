import express from "express";
import verifyToken from "../middlewares/authMiddleware.mjs";
import {
    getOrCreateConversation,
    listConversations,
    sendMessage,
    getMessages,
    markConversationRead, deleteMessageForMe,
    deleteConversation, deleteMessageForEveryone
} from "../controllers/chatController.mjs";

const router = express.Router();

router.post("/conversation", verifyToken, getOrCreateConversation);
router.get("/getAllConversation", verifyToken, listConversations);
router.get("/conversation/:conversationId/messages", verifyToken, getMessages);
router.post("/sendMessage", verifyToken, sendMessage);
router.patch("/read/conversation/:conversationId", verifyToken, markConversationRead);
router.delete("/message/:messageId", verifyToken, deleteMessageForMe);
router.delete("/message/:messageId/for-everyone", verifyToken, deleteMessageForEveryone);
router.delete("/conversation/:conversationId", verifyToken, deleteConversation);


export default router;
