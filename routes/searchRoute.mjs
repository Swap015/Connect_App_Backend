import verifyToken from "../middlewares/authMiddleware.mjs";
import express from "express";
import globalSearch from "../controllers/searchController.mjs";

const router = express.Router();

router.get("/global-search", verifyToken, globalSearch);

export default router;