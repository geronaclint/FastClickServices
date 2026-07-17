/**
 * Middleware that parses ?page=&limit= query params and attaches
 * pagination info to req. Use in routes that need pagination.
 *
 * Query params:
 *   page  - (int, default 1) current page number
 *   limit - (int, default 20, max 100) items per page
 *
 * Attaches to req:
 *   req.pagination = { page, limit, offset }
 */
export function parsePagination(req, res, next) {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 20;
  if (limit > 100) limit = 100;

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
  };

  next();
}

/**
 * Wraps a paginated result from the database into a standard response shape.
 *
 * @param {Array} data - The rows for the current page
 * @param {number} totalCount - Total number of matching rows
 * @param {object} pagination - The pagination object from req: { page, limit }
 * @returns {object} { success, data, page, totalPages, totalCount }
 */
export function paginatedResponse(data, totalCount, { page, limit }) {
  return {
    success: true,
    data,
    page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
}
