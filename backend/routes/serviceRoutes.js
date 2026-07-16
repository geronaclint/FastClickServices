import express from "express";
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from "../controllers/serviceController.js";
import { protect, providerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getServices)
  .post(protect, providerOnly, createService);

router.route("/:id")
  .get(getServiceById)
  .put(protect, providerOnly, updateService)
  .delete(protect, providerOnly, deleteService);

export default router;
