import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

function getDbConfig() {
  // Production: DATABASE_URL from Supabase via Render env
  if (process.env.DATABASE_URL) {
    // Strip sslmode from query string — we handle SSL ourselves
    const cleanUrl = process.env.DATABASE_URL.replace(
      /[?&]sslmode=[^&]+/g,
      ""
    ).replace(/[?&]supa=[^&]+/g, "");

    return {
      connectionString: cleanUrl,
      ssl: { rejectUnauthorized: false },
    };
  }

  // Local development: individual DB_* env vars or defaults
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sureserve_db",
    port: process.env.DB_PORT || 5432,
  };
}

const db = new Pool(getDbConfig());

export default db;
