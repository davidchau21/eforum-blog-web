import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { env } from "./env.js";

const serviceAccountPath = path.resolve(
  process.cwd(),
  env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    "./edu-blog-website-firebase-adminsdk-h2sxh-03786661ff.json"
);

const serviceAccountKey = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });
}

export default admin;
