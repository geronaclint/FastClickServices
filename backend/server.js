import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import db from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is required");
  process.exit(1);
}

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: [
      "https://sureserve-frontend-mauve.vercel.app",
      "https://sureserve-frontend-git-main-jego-agbayani-s-projects.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts, please try again later.",
  },
});

app.use(globalLimiter);

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/ratings", ratingRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SureServe backend is running",
  });
});

// Database test route
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");

    res.json({
      success: true,
      message: "PostgreSQL Connected Successfully",
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});