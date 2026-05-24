/**
 * Extract client IP address from request object robustly.
 */
export const getClientIp = (req) => {
  if (!req) return "127.0.0.1";

  let ip = "";

  // 1. Check X-Forwarded-For header (handles proxies/load balancers)
  const xForwardedFor = req.headers?.["x-forwarded-for"];
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    const clientIp = ips[0].trim();
    if (clientIp) {
      ip = clientIp;
    }
  }

  // 2. Check standard req.ip / req.ips
  if (!ip && req.ip) {
    ip = req.ip;
  }
  if (!ip && req.ips && req.ips.length > 0) {
    ip = req.ips[0];
  }

  // 3. Check socket remoteAddress
  if (!ip) {
    const remoteAddress =
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      req.connection?.socket?.remoteAddress;
    if (remoteAddress) {
      ip = remoteAddress;
    }
  }

  // Fallback
  if (!ip) {
    ip = "127.0.0.1";
  }

  // Clean local ipv6 loopback formats to friendly ipv4
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    ip = "127.0.0.1";
  }

  return ip;
};
