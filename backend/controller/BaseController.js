export class BaseController {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {any} data - Data to send
   * @param {number} statusCode - HTTP status code
   */
  sendSuccess(res, data, statusCode = 200) {
    if (typeof data === "string") {
      return res.status(statusCode).json({ message: data });
    }
    return res.status(statusCode).json(data);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {any} error - Error object or message
   * @param {number} statusCode - HTTP status code
   */
  sendError(res, error, statusCode = 500) {
    const message = error.message || error || "Internal Server Error";
    console.error(`[Error]: ${message}`);
    return res.status(statusCode).json({ error: message });
  }

  /**
   * Send 403 Forbidden error
   * @param {Object} res 
   * @param {string} message 
   */
  sendForbidden(res, message = "Forbidden") {
    return this.sendError(res, message, 403);
  }

  /**
   * Send 404 Not Found error
   * @param {Object} res 
   * @param {string} message 
   */
  sendNotFound(res, message = "Resource not found") {
    return this.sendError(res, message, 404);
  }

  /**
   * Send 400 Bad Request error
   * @param {Object} res 
   * @param {string} message 
   */
  sendBadRequest(res, message = "Bad Request") {
    return this.sendError(res, message, 400);
  }
}
