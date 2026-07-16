import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTicket,
  getTickets,
  getTicket,
  updateTicketStatus,
  deleteTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/", protect, createTicket);
router.get("/", protect, getTickets);
router.get("/:id", protect, getTicket);
router.put("/:id/status", protect, updateTicketStatus);
router.delete("/:id", protect, deleteTicket);

export default router;
