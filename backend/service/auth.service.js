import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import User from "../Schema/User.js";
import UserAuth from "../Schema/UserAuth.js"; // maps to 'oauth' collection
import { accessTokenSecret, refreshTokenSecret, verificationTokenSecret } from "../config/auth.js";
import mailService from "../integrations/nodemailer.js";
import otpTemplate from "../Mail/otp.js";
import resetPasswordTemplate from "../Mail/resetPassword.js";
import { env } from "../config/env.js";
import { nanoid } from "nanoid";

const ACCESS_TOKEN_EXPIRES_IN = "5h";
const REFRESH_TOKEN_EXPIRES_IN = "9d";
const ACCESS_TOKEN_MS = 5 * 60 * 60 * 1000;       // 5 hours
const REFRESH_TOKEN_MS = 9 * 24 * 60 * 60 * 1000;  // 9 days

class AuthService {
  /**
   * Extract useful request metadata (ip, user-agent) from the express request object.
   */
  _getRequestMeta(req) {
    return {
      ip_address: req?.ip || req?.headers?.["x-forwarded-for"] || "",
      user_agent: req?.headers?.["user-agent"] || "",
    };
  }

  /**
   * Build a unique session ID from user ID and user-agent, similar to:
   * "session:<userId>:<userAgent>"
   */
  _buildSessionId(userId, userAgent = "") {
    return `session:${userId}:${userAgent}`;
  }

  /**
   * Issue a new access + refresh token pair and persist the session to DB.
   */
  async _createSession(user, req, userType = "user") {
    const meta = this._getRequestMeta(req);

    const accessTokenPayload = { id: user._id, role: user.personal_info.role };
    const access_token = jwt.sign(accessTokenPayload, accessTokenSecret, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refresh_token_raw = crypto.randomBytes(40).toString("hex");

    const [hashed_access, hashed_refresh] = await Promise.all([
      bcrypt.hash(access_token, 10),
      bcrypt.hash(refresh_token_raw, 10),
    ]);

    const sessionId = this._buildSessionId(user._id, meta.user_agent);
    const now = Date.now();

    // Upsert: one active session per user per user-agent (stored in 'oauth' collection)
    await UserAuth.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          sessionId,
          user_id: user._id,
          user_type: userType,
          access_token: hashed_access,
          access_token_expires_at: new Date(now + ACCESS_TOKEN_MS),
          refresh_token: hashed_refresh,
          refresh_token_expires_at: new Date(now + REFRESH_TOKEN_MS),
          ip_address: meta.ip_address,
          user_agent: meta.user_agent,
          is_active: 1,
          roles: user.personal_info.role === "ADMIN" ? ["admin"] : [],
          otp_used: false,
          otp_attempts: 0,
        },
      },
      { upsert: true, new: true }
    );

    return {
      access_token,
      refresh_token: refresh_token_raw,
    };
  }

  formatDatatoSend(user, tokens) {
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      _id: user._id,
      profile_img: user.personal_info.profile_img,
      username: user.personal_info.username,
      fullname: user.personal_info.fullname,
    };
  }

  async generateUsername(email) {
    let username = email.split("@")[0];
    const isUsernameNotUnique = await User.exists({ "personal_info.username": username });
    if (isUsernameNotUnique) {
      username += nanoid().substring(0, 5);
    }
    return username;
  }

  async signup({ fullname, email, password }) {
    const hashed_password = await bcrypt.hash(password, 10);
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const otp_expiry_time = Date.now() + 10 * 60 * 1000;

    let user = await User.findOne({ "personal_info.email": email });
    if (user && user.verified) throw new Error("Account already exists");

    if (user && !user.verified) {
      user.personal_info.fullname = fullname;
      user.personal_info.password = hashed_password;
      await user.save();
      await UserAuth.findOneAndUpdate(
        { user: user._id },
        { $set: { otp: otp.toString(), otp_expiry_time } },
        { upsert: true }
      );
    } else {
      const username = await this.generateUsername(email);
      user = new User({
        personal_info: { fullname, email, password: hashed_password, username, role: "USER" },
        verified: false,
      });
      await user.save();
      await UserAuth.create({ user: user._id, otp: otp.toString(), otp_expiry_time });
    }

    mailService.sendEmail({
      from: { name: "Team Support EForum", email: "eforum@gmail.vn.com" },
      to: email,
      subject: "Your OTP for Account Verification",
      html: otpTemplate(user.personal_info.username, otp),
    });

    return { user_id: user._id };
  }

  async signin({ email, password }, req) {
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) throw new Error("Email not found");
    if (!user.verified) throw new Error("Account not verified. Please verify your account first.");
    if (user.google_auth) throw new Error("Account was created using google. Try logging in with google.");

    const isPasswordValid = await bcrypt.compare(password, user.personal_info.password);
    if (!isPasswordValid) throw new Error("Incorrect password");

    const tokens = await this._createSession(user, req);
    return this.formatDatatoSend(user, tokens);
  }

  async verifyOtp({ email, otp }) {
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) throw new Error("User not found");

    const authRecord = await UserAuth.findOne({
      user: user._id,
      otp,
      otp_expiry_time: { $gt: Date.now() },
    });

    if (!authRecord) throw new Error("OTP is either invalid or expired");
    if (user.verified) throw new Error("User is already verified");

    user.verified = true;
    user.verification_date = new Date();
    await user.save();

    await UserAuth.findOneAndUpdate({ user: user._id }, { $unset: { otp: 1, otp_expiry_time: 1 } });

    const token = jwt.sign({ id: user._id, email: user.personal_info.email }, verificationTokenSecret);
    return { token, user_id: user._id };
  }

  async refreshToken(rawRefreshToken, req) {
    // Find active sessions that haven't expired (in oauth collection)
    const activeSessions = await UserAuth.find({
      is_active: 1,
      refresh_token_expires_at: { $gt: new Date() },
    });

    // Find the matching session by comparing the raw token against stored hashes
    let matchedSession = null;
    for (const session of activeSessions) {
      const match = await bcrypt.compare(rawRefreshToken, session.refresh_token);
      if (match) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) throw new Error("Refresh token is invalid or expired");

    const user = await User.findById(matchedSession.user_id);
    if (!user) throw new Error("User not found");

    const tokens = await this._createSession(user, req, matchedSession.user_type);
    return this.formatDatatoSend(user, tokens);
  }

  async logout(rawAccessToken) {
    // Find and invalidate the session matching the access token (in oauth collection)
    const activeSessions = await UserAuth.find({
      is_active: 1,
      access_token_expires_at: { $gt: new Date() },
    });

    for (const session of activeSessions) {
      const match = await bcrypt.compare(rawAccessToken, session.access_token);
      if (match) {
        await UserAuth.findByIdAndUpdate(session._id, { $set: { is_active: 0 } });
        return { message: "Logged out successfully" };
      }
    }

    // If session not found, still consider it a success
    return { message: "Logged out successfully" };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.google_auth) throw new Error("You can't change account's password because you logged in through google");

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.personal_info.password);
    if (!isCurrentPasswordValid) throw new Error("Incorrect current password");

    user.personal_info.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Invalidate all active sessions for this user on password change
    await UserAuth.updateMany({ user_id: userId, is_active: 1 }, { $set: { is_active: 0 } });

    return { status: "password changed" };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) throw new Error("No user found with this email address.");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await UserAuth.findOneAndUpdate(
      { user: user._id },
      { $set: { passwordResetToken: hashedToken, passwordResetExpires: Date.now() + 10 * 60 * 1000 } },
      { upsert: true }
    );

    const resetURL = `${env.CLIENT_URL}/new-password?token=${resetToken}`;
    mailService.sendEmail({
      from: { name: "Team Support EForum", email: "eforum@gmail.vn.com" },
      to: email,
      subject: "Password Reset Request",
      html: resetPasswordTemplate(user.personal_info.fullname, resetURL),
    });

    return { message: "Token sent to email" };
  }

  async resetPassword({ token, password }) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const authRecord = await UserAuth.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!authRecord) throw new Error("Token is invalid or has expired.");

    const user = await User.findById(authRecord.user);
    if (!user) throw new Error("User not found.");

    user.personal_info.password = await bcrypt.hash(password, 10);
    await user.save();

    await UserAuth.findOneAndUpdate(
      { user: user._id },
      { $unset: { passwordResetToken: 1, passwordResetExpires: 1 }, $set: { passwordChangedAt: new Date() } }
    );

    // Invalidate all active sessions on password reset
    await UserAuth.updateMany({ user_id: user._id, is_active: 1 }, { $set: { is_active: 0 } });

    return { message: "Password has been reset successfully." };
  }

  async googleAuth(access_token, req) {
    const { getAuth } = await import("firebase-admin/auth");
    const decodedUser = await getAuth().verifyIdToken(access_token);
    const { email, name } = decodedUser;

    let user = await User.findOne({ "personal_info.email": email });
    if (user) {
      if (!user.google_auth) throw new Error("This email was signed up without google. Please log in with password to access the account");
    } else {
      const username = await this.generateUsername(email);
      user = await new User({
        personal_info: { fullname: name, email, username, role: "USER" },
        google_auth: true,
        verified: true,
      }).save();
    }

    const tokens = await this._createSession(user, req);
    return this.formatDatatoSend(user, tokens);
  }
}

export default new AuthService();
