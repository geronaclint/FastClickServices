/**
 * Centralized error-handling middleware.
 * Must be registered LAST in the middleware chain (after all routes).
 *
 * Catches any errors thrown or passed via next(err) from controllers
 * and returns a consistent JSON error shape:
 *   { success: false, message, code }
 */
export default function errorHandler(err, req, res, _next) {
  // Log the full error for debugging — don't leak details to the client
  console.error("[ErrorHandler]", err);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Build safe client-facing message
  const message =
    statusCode === 500
      ? "Internal server error"
      : err.message || "An error occurred";

  res.status(statusCode).json({
    success: false,
    message,
    code: err.code || "INTERNAL_ERROR",
  });
}

/**
 * Helper to create an error with a status code.
 * Usage: throw createError(404, "Ticket not found")
 */
export function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}
