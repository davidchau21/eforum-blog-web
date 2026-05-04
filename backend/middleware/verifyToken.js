import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { accessTokenSecret } from "../config/auth.js";
import UserAuth from "../Schema/UserAuth.js"; // maps to 'oauth' collection

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
