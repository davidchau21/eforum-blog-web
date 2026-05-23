import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { accessTokenSecret } from "../config/auth.js";
import UserAuth from "../Schema/UserAuth.js"; // maps to 'oauth' collection
import User from "../Schema/User.js";

/**
 * Verifies the Bearer token against:
 * 1. JWT signature validity
 * 2. Active session record in DB (not expired, is_active = 1)
 */
export const isAuthenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No access token" });
  }

  // 1. Verify JWT signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(token, accessTokenSecret);
  } catch {
    return res.status(403).json({ error: "Access token is invalid or expired" });
  }

  // 2. Find an active session for this user whose token hasn't expired
  try {
    const activeSessions = await UserAuth.find({
      user_id: decoded.id,
      is_active: 1,
      access_token_expires_at: { $gt: new Date() },
    });

    if (activeSessions.length === 0) {
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }

    // Compare the raw token against stored hashes
    let sessionValid = false;
    for (const session of activeSessions) {
      const match = await bcrypt.compare(token, session.access_token);
      if (match) {
        sessionValid = true;
        break;
      }
    }

    if (!sessionValid) {
      return res.status(401).json({ error: "Session not found. Please sign in again." });
    }
  } catch (err) {
    console.error("Session validation error:", err);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }

  req.user = decoded;
  next();
};

/**
 * Admin guard: validates token AND requires ADMIN role.
 */
export const isAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No access token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, accessTokenSecret);
  } catch {
    return res.status(403).json({ error: "Access token is invalid or expired" });
  }

  if (decoded.role !== "ADMIN") {
    return res.status(403).json({ error: "Not authorized as admin" });
  }

  req.user = decoded;
  next();
};

/**
 * Dynamic permission guard: validates token AND checks database permissions.
 */
export const requireDynamicPermission = (requiredCode) => {
  return async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No access token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, accessTokenSecret);
    } catch {
      return res.status(403).json({ error: "Access token is invalid or expired" });
    }

    try {
      // Find the user, populate role_id and populate role's permissions
      const user = await User.findById(decoded.id).populate({
        path: "role_id",
        populate: { path: "permissions" }
      });

      if (!user) {
        return res.status(403).json({ error: "User not found or disabled" });
      }

      // Check if user is Super Admin (bypasses all checks)
      if (user.role_id && user.role_id.role_name === "Super Admin") {
        req.user = decoded;
        return next();
      }

      // If user has no role_id, check if they are ADMIN as fallback (backward compatibility)
      if (!user.role_id) {
        if (decoded.role === "ADMIN") {
          req.user = decoded;
          return next();
        }
        return res.status(403).json({ error: `Bạn không có quyền thực hiện: [${requiredCode}]` });
      }

      // Check permissions
      const hasPermission = user.role_id.permissions.some(
        (perm) => perm.permission_code === requiredCode
      );

      if (hasPermission) {
        req.user = decoded;
        return next();
      }

      return res.status(403).json({ error: `Bạn không có quyền thực hiện hành động này! Yêu cầu quyền: [${requiredCode}]` });
    } catch (err) {
      console.error("Dynamic permission validation error:", err);
      return res.status(500).json({ error: "Internal server error during permission check" });
    }
  };
};
