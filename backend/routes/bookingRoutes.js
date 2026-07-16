import express from "express";
import {
  createBooking,
  getMyBookings,
  updateBookingStatus
} from "../controllers/bookingController.js";
import { protect, providerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createBooking)
  .get(protect, getMyBookings);

router.route("/:id/status")
  .put(protect, providerOnly, updateBookingStatus);

export default router;
