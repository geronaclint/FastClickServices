import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { parsePagination } from "../middleware/pagination.js";
import {
  createServiceRequest,
  getServiceRequests,
  updateServiceRequestStatus,
  deleteServiceRequest,
} from "../controllers/serviceRequestController.js";

const router = express.Router();

router.post("/", protect, createServiceRequest);
router.get("/", protect, parsePagination, getServiceRequests);
router.put("/:id/status", protect, updateServiceRequestStatus);
router.delete("/:id", protect, deleteServiceRequest);

export default router;
