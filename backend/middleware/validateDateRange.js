/**
 * Middleware to validate startDate/endDate query params.
 * - Must be valid ISO 8601 date strings
 * - startDate must be before endDate if both are provided
 */
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate) {
    const d = new Date(startDate);
    if (isNaN(d.getTime())) {
      return res.status(400).json({ error: "startDate không hợp lệ. Vui lòng sử dụng định dạng ISO 8601 (ví dụ: 2025-01-01T00:00:00.000Z)." });
    }
  }

  if (endDate) {
    const d = new Date(endDate);
    if (isNaN(d.getTime())) {
      return res.status(400).json({ error: "endDate không hợp lệ. Vui lòng sử dụng định dạng ISO 8601 (ví dụ: 2025-12-31T23:59:59.999Z)." });
    }
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({ error: "startDate phải trước endDate." });
    }
  }

  next();
};

export default validateDateRange;
