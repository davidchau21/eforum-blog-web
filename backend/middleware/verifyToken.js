import jwt from "jsonwebtoken";
import { accessTokenSecret } from "../config/auth.js";

export const isAuthenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "No access token" });
  }

  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }
    req.user = user;
    next();
  });
};

export const isAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "No access token" });
  }

  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }
    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized as admin" });
    }
    req.user = user;
    next();
  });
};
