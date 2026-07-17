import db from "../db.js";
import { validatePriority } from "../middleware/subscriptionMiddleware.js";

// @desc    Create a ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res) => {
  try {
    const { ticketType, priority = "Normal", description = "", contactPerson = "", phone = "" } = req.body;

    if (!ticketType || !ticketType.trim()) {
      return res.status(400).json({ success: false, message: "Ticket type is required." });
    }

    // Enforce subscription-based priority gating
    const userSubscription = req.user.subscription || "Free";
    const priorityCheck = validatePriority(userSubscription, priority);
    if (!priorityCheck.valid) {
      return res.status(403).json({
        success: false,
        message: `The "${priority}" priority level requires a higher subscription plan. Your current plan (${userSubscription}) allows: ${priorityCheck.allowed.join(", ")}.`,
      });
    }

    let result;
    try {
      result = await db.query(
        `INSERT INTO tickets (user_id, ticket_type, priority, contact_person, phone, description, preferred_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [req.user.id, ticketType.trim(), priority, contactPerson, phone, description, req.body.preferredDate || null]
      );
    } catch (colErr) {
      // Fallback: preferred_date column may not exist yet
      result = await db.query(
        `INSERT INTO tickets (user_id, ticket_type, priority, contact_person, phone, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [req.user.id, ticketType.trim(), priority, contactPerson, phone, description]
      );
    }

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticketId: result.rows[0].id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get tickets (buyer sees own, provider/admin sees all)
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let result;

    if (user.role === "provider" || user.role === "admin" || user.role === "seller") {
      try {
        result = await db.query(
          `SELECT t.*, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone, u.address AS customer_address, u.subscription AS customer_subscription
           FROM tickets t JOIN users u ON t.user_id = u.id
           ORDER BY t.created_at DESC`
        );
      } catch {
        // Fallback: subscription/address columns may not exist
        result = await db.query(
          `SELECT t.*, u.full_name AS customer_name, u.email AS customer_email
           FROM tickets t JOIN users u ON t.user_id = u.id
           ORDER BY t.created_at DESC`
        );
      }
    } else {
      result = await db.query(
        "SELECT * FROM tickets WHERE user_id = $1 ORDER BY created_at DESC",
        [user.id]
      );
    }

    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tickets WHERE id = $1", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Processing", "Finished", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const ticket = await db.query("SELECT * FROM tickets WHERE id = $1", [req.params.id]);
    if (ticket.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const user = req.user;
    if (ticket.rows[0].user_id !== user.id && user.role !== "provider" && user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await db.query("UPDATE tickets SET status = $1 WHERE id = $2", [status, req.params.id]);
    return res.json({ success: true, message: "Ticket status updated" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await db.query("SELECT * FROM tickets WHERE id = $1", [req.params.id]);
    if (ticket.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const user = req.user;
    if (ticket.rows[0].user_id !== user.id && user.role !== "provider" && user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await db.query("DELETE FROM tickets WHERE id = $1", [req.params.id]);
    return res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
