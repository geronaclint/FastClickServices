import express from "express";
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from "../controllers/serviceController.js";
import { protect, providerOnly } from "../middleware/authMiddleware.js";
import { parsePagination } from "../middleware/pagination.js";

const router = express.Router();

router.route("/")
  .get(parsePagination, getServices)
  .post(protect, providerOnly, createService);

router.route("/:id")
  .get(getServiceById)
  .put(protect, providerOnly, updateService)
  .delete(protect, providerOnly, deleteService);

export default router;
