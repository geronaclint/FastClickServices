import db from "../db.js";

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, full_name, email, phone, address, role, subscription, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, address, subscription } = req.body;

    await db.query(
      `UPDATE users
       SET full_name  = COALESCE($1, full_name),
           email      = COALESCE($2, email),
           phone      = COALESCE($3, phone),
           address    = COALESCE($4, address),
           subscription = COALESCE($5, subscription)
       WHERE id = $6`,
      [fullName, email, phone, address, subscription, req.user.id]
    );

    return res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get dashboard stats for buyer
// @route   GET /api/profile/dashboard-stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const uid = req.user.id;

    const ticketCount = await db.query(
      "SELECT COUNT(*) AS c FROM tickets WHERE user_id = $1",
      [uid]
    );
    const srCount = await db.query(
      "SELECT COUNT(*) AS c FROM service_requests WHERE user_id = $1",
      [uid]
    );
    const pendingTickets = await db.query(
      "SELECT COUNT(*) AS c FROM tickets WHERE user_id = $1 AND status IN ('Pending', 'Processing')",
      [uid]
    );

    return res.json({
      success: true,
      data: {
        totalTickets: parseInt(ticketCount.rows[0].c),
        totalServiceRequests: parseInt(srCount.rows[0].c),
        pendingTickets: parseInt(pendingTickets.rows[0].c),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get dashboard stats for seller/provider
// @route   GET /api/profile/seller-stats
// @access  Private
export const getSellerStats = async (req, res) => {
  try {
    const totalRequests = await db.query("SELECT COUNT(*) AS c FROM service_requests");
    const totalTickets = await db.query("SELECT COUNT(*) AS c FROM tickets");
    const processingRequests = await db.query("SELECT COUNT(*) AS c FROM service_requests WHERE status = 'Processing'");
    const finishedRequests = await db.query("SELECT COUNT(*) AS c FROM service_requests WHERE status = 'Finished'");
    const pendingRequests = await db.query("SELECT COUNT(*) AS c FROM service_requests WHERE status = 'Pending'");
    const cancelledRequests = await db.query("SELECT COUNT(*) AS c FROM service_requests WHERE status = 'Cancelled'");
    const processingTickets = await db.query("SELECT COUNT(*) AS c FROM tickets WHERE status = 'Processing'");
    const finishedTickets = await db.query("SELECT COUNT(*) AS c FROM tickets WHERE status = 'Finished'");
    const pendingTickets = await db.query("SELECT COUNT(*) AS c FROM tickets WHERE status = 'Pending'");

    let avgRating = "0.0";
    let totalRatings = 0;
    try {
      const ratingsStat = await db.query("SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_ratings FROM ratings");
      avgRating = ratingsStat.rows[0].avg_rating ? parseFloat(ratingsStat.rows[0].avg_rating).toFixed(1) : "0.0";
      totalRatings = parseInt(ratingsStat.rows[0].total_ratings || 0);
    } catch {}

    return res.json({
      success: true,
      data: {
        totalRequests: parseInt(totalRequests.rows[0].c),
        totalTickets: parseInt(totalTickets.rows[0].c),
        processingRequests: parseInt(processingRequests.rows[0].c),
        finishedRequests: parseInt(finishedRequests.rows[0].c),
        pendingRequests: parseInt(pendingRequests.rows[0].c),
        cancelledRequests: parseInt(cancelledRequests.rows[0].c),
        processingTickets: parseInt(processingTickets.rows[0].c),
        finishedTickets: parseInt(finishedTickets.rows[0].c),
        pendingTickets: parseInt(pendingTickets.rows[0].c),
        avgRating,
        totalRatings,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
