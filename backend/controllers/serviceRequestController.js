import db from "../db.js";
import { validatePriority } from "../middleware/subscriptionMiddleware.js";

// @desc    Create a service request
// @route   POST /api/service-requests
// @access  Private
export const createServiceRequest = async (req, res) => {
  try {
    const {
      serviceType,
      priority = "Normal",
      location,
      contactPerson = "",
      phone = "",
      date,
      time = "",
      description = "",
    } = req.body;

    if (!serviceType || !serviceType.trim() || !location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service type and location are required.",
      });
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
        `INSERT INTO service_requests
         (user_id, service_type, priority, location, contact_person, phone, preferred_date, preferred_time, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          req.user.id,
          serviceType.trim(),
          priority,
          location.trim(),
          contactPerson,
          phone,
          date || null,
          time,
          description,
        ]
      );
    } catch (colErr) {
      // Fallback: preferred_date/preferred_time columns may not exist
      result = await db.query(
        `INSERT INTO service_requests
         (user_id, service_type, priority, location, contact_person, phone, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          req.user.id,
          serviceType.trim(),
          priority,
          location.trim(),
          contactPerson,
          phone,
          description,
        ]
      );
    }

    return res.status(201).json({
      success: true,
      message: "Service request created successfully",
      requestId: result.rows[0].id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get service requests (buyer sees own, provider/admin sees all)
// @route   GET /api/service-requests
// @access  Private
export const getServiceRequests = async (req, res) => {
  try {
    const user = req.user;
    const { limit, offset } = req.pagination || { limit: 20, offset: 0 };
    let result;
    let countResult;

    if (user.role === "provider" || user.role === "admin" || user.role === "seller") {
      try {
        countResult = await db.query("SELECT COUNT(*) FROM service_requests");
        result = await db.query(
          `SELECT sr.*, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone, u.address AS customer_address, u.subscription AS customer_subscription
           FROM service_requests sr JOIN users u ON sr.user_id = u.id
           ORDER BY sr.created_at DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
      } catch {
        // Fallback: subscription/address columns may not exist
        countResult = await db.query("SELECT COUNT(*) FROM service_requests");
        result = await db.query(
          `SELECT sr.*, u.full_name AS customer_name, u.email AS customer_email
           FROM service_requests sr JOIN users u ON sr.user_id = u.id
           ORDER BY sr.created_at DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
      }
    } else {
      countResult = await db.query(
        "SELECT COUNT(*) FROM service_requests WHERE user_id = $1",
        [user.id]
      );
      result = await db.query(
        "SELECT * FROM service_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [user.id, limit, offset]
      );
    }

    const totalCount = parseInt(countResult.rows[0].count, 10);
    return res.json({
      success: true,
      data: result.rows,
      page: req.pagination?.page || 1,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update service request status
// @route   PUT /api/service-requests/:id/status
// @access  Private
export const updateServiceRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Processing", "Finished", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const sr = await db.query("SELECT * FROM service_requests WHERE id = $1", [req.params.id]);
    if (sr.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Service request not found" });
    }

    const user = req.user;
    if (sr.rows[0].user_id !== user.id && user.role !== "provider" && user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await db.query("UPDATE service_requests SET status = $1 WHERE id = $2", [status, req.params.id]);
    return res.json({ success: true, message: "Service request status updated" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete service request
// @route   DELETE /api/service-requests/:id
// @access  Private
export const deleteServiceRequest = async (req, res) => {
  try {
    const sr = await db.query("SELECT * FROM service_requests WHERE id = $1", [req.params.id]);
    if (sr.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Service request not found" });
    }

    const user = req.user;
    if (sr.rows[0].user_id !== user.id && user.role !== "provider" && user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await db.query("DELETE FROM service_requests WHERE id = $1", [req.params.id]);
    return res.json({ success: true, message: "Service request deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
