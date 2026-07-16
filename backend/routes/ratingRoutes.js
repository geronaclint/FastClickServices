import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  submitRating,
  getRating,
  getBulkRatings
} from "../controllers/ratingController.js";

const router = express.Router();

router.post("/", protect, submitRating);
router.get("/bulk", protect, getBulkRatings);
router.get("/:itemType/:itemId", protect, getRating);

export default router;
