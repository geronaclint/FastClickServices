import db from "../db.js";

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
  try {
    const { limit, offset } = req.pagination || { limit: 20, offset: 0 };

    const countResult = await db.query("SELECT COUNT(*) FROM services");
    const services = await db.query(
      `SELECT s.*, u.full_name as provider_name
       FROM services s
       JOIN users u ON s.provider_id = u.id
       ORDER BY s.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalCount = parseInt(countResult.rows[0].count, 10);
    res.json({
      success: true,
      data: services.rows,
      page: req.pagination?.page || 1,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const service = await db.query(
      `
      SELECT s.*, u.full_name as provider_name 
      FROM services s
      JOIN users u ON s.provider_id = u.id
      WHERE s.id = $1
      `,
      [req.params.id]
    );

    if (service.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      data: service.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Provider
export const createService = async (req, res) => {
  try {
    const { title, description, price, category, image_url } = req.body;
    const provider_id = req.user.id;

    if (!title || !price) {
      return res.status(400).json({
        success: false,
        message: "Title and price are required.",
      });
    }

    const result = await db.query(
      `
      INSERT INTO services 
      (provider_id, title, description, price, category, image_url) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [provider_id, title, description, price, category, image_url || null]
    );

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      serviceId: result.rows[0].id,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Provider
export const updateService = async (req, res) => {
  try {
    const { title, description, price, category, image_url } = req.body;
    const provider_id = req.user.id;

    const service = await db.query(
      "SELECT * FROM services WHERE id = $1",
      [req.params.id]
    );

    if (service.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (service.rows[0].provider_id !== provider_id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this service",
      });
    }

    await db.query(
      `
      UPDATE services 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        category = COALESCE($4, category),
        image_url = COALESCE($5, image_url)
      WHERE id = $6
      `,
      [title, description, price, category, image_url, req.params.id]
    );

    res.json({
      success: true,
      message: "Service updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Provider
export const deleteService = async (req, res) => {
  try {
    const provider_id = req.user.id;

    const service = await db.query(
      "SELECT * FROM services WHERE id = $1",
      [req.params.id]
    );

    if (service.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (service.rows[0].provider_id !== provider_id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this service",
      });
    }

    await db.query("DELETE FROM services WHERE id = $1", [req.params.id]);

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};