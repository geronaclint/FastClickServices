import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireSubscription } from "../middleware/subscriptionMiddleware.js";
import {
  getProfile,
  updateProfile,
  getDashboardStats,
  getSellerStats,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.get("/dashboard-stats", protect, getDashboardStats);
router.get(
  "/seller-stats",
  protect,
  requireSubscription("Professional"),
  getSellerStats
);

export default router;
