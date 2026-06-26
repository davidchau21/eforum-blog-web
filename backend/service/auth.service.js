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
import { getClientIp } from "../utils/ip.js";

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
      ip_address: getClientIp(req),
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
        { user_id: user._id },
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
      await UserAuth.create({ user_id: user._id, otp: otp.toString(), otp_expiry_time });
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
    if (user.disabled) throw new Error("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ admin để được hỗ trợ.");

    const isPasswordValid = await bcrypt.compare(password, user.personal_info.password);
    if (!isPasswordValid) throw new Error("Incorrect password");

    const tokens = await this._createSession(user, req);
    return this.formatDatatoSend(user, tokens);
  }

  async verifyOtp({ email, otp }) {
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) throw new Error("User not found");

    const authRecord = await UserAuth.findOne({
      user_id: user._id,
      otp,
      otp_expiry_time: { $gt: Date.now() },
    });

    if (!authRecord) throw new Error("OTP is either invalid or expired");
    if (user.verified) throw new Error("User is already verified");

    user.verified = true;
    user.verification_date = new Date();
    await user.save();

    await UserAuth.findOneAndUpdate({ user_id: user._id }, { $unset: { otp: 1, otp_expiry_time: 1 } });

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
    await user.save({ validateBeforeSave: false });

    // Invalidate all active sessions for this user on password change
    await UserAuth.updateMany({ user_id: userId, is_active: 1 }, { $set: { is_active: 0 } });

    return { status: "password changed" };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ "personal_info.email": email.toLowerCase() });
    if (!user) throw new Error("No user found with this email address.");

    let authRecord = await UserAuth.findOne({ user_id: user._id, sessionId: { $exists: false } });

    if (authRecord) {
      // 1. Check 30s delay limit
      if (authRecord.otpLastSentAt) {
        const timeDiff = Date.now() - new Date(authRecord.otpLastSentAt).getTime();
        if (timeDiff < 30 * 1000) {
          const timeLeft = Math.ceil((30 * 1000 - timeDiff) / 1000);
          throw new Error(`Vui lòng đợi ${timeLeft} giây trước khi gửi lại mã OTP.`);
        }
      }

      // 2. Check 3-times resend limit (resets after 10 mins)
      let count = authRecord.otpResendCount || 0;
      if (authRecord.otpLastSentAt) {
        const lastSentTime = new Date(authRecord.otpLastSentAt).getTime();
        if (Date.now() - lastSentTime > 10 * 60 * 1000) {
          count = 0;
        }
      }

      if (count >= 3) {
        throw new Error("Bạn đã đạt giới hạn gửi lại mã OTP (tối đa 3 lần). Vui lòng thử lại sau 10 phút.");
      }

      const otp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      const otp_expiry_time = Date.now() + 10 * 60 * 1000;

      authRecord.otp = otp.toString();
      authRecord.otp_expiry_time = otp_expiry_time;
      authRecord.otpResendCount = count + 1;
      authRecord.otpLastSentAt = new Date();
      await authRecord.save();

      mailService.sendEmail({
        from: { name: "Team Support EForum", email: "eforum@gmail.vn.com" },
        to: email,
        subject: "Password Reset OTP Verification",
        html: otpTemplate(user.personal_info.username, otp),
      });

      return { message: "OTP sent to email", resendCount: count + 1, timeLeft: 30 };
    } else {
      const otp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      const otp_expiry_time = Date.now() + 10 * 60 * 1000;

      authRecord = new UserAuth({
        user_id: user._id,
        otp: otp.toString(),
        otp_expiry_time,
        otpResendCount: 1,
        otpLastSentAt: new Date(),
      });
      await authRecord.save();

      mailService.sendEmail({
        from: { name: "Team Support EForum", email: "eforum@gmail.vn.com" },
        to: email,
        subject: "Password Reset OTP Verification",
        html: otpTemplate(user.personal_info.username, otp),
      });

      return { message: "OTP sent to email", resendCount: 1, timeLeft: 30 };
    }
  }

  async resetPassword({ email, otp, password }) {
    if (!email || !otp || !password) {
      throw new Error("Email, OTP, and password are required.");
    }

    const user = await User.findOne({ "personal_info.email": email.toLowerCase() });
    if (!user) throw new Error("No user found with this email address.");

    const authRecord = await UserAuth.findOne({
      user_id: user._id,
      otp,
      otp_expiry_time: { $gt: Date.now() },
    });

    if (!authRecord) throw new Error("OTP is invalid or has expired.");

    user.personal_info.password = await bcrypt.hash(password, 10);
    await user.save({ validateBeforeSave: false });

    await UserAuth.findOneAndUpdate(
      { user_id: user._id, sessionId: { $exists: false } },
      { $unset: { otp: 1, otp_expiry_time: 1, otpResendCount: 1, otpLastSentAt: 1 }, $set: { passwordChangedAt: new Date() } }
    );

    // Invalidate all active sessions on password reset
    await UserAuth.updateMany({ user_id: user._id, is_active: 1 }, { $set: { is_active: 0 } });

    return { message: "Password has been reset successfully." };
  }

  async verifyResetOtp({ email, otp }) {
    if (!email || !otp) {
      throw new Error("Email and OTP are required.");
    }

    const user = await User.findOne({ "personal_info.email": email.toLowerCase() });
    if (!user) throw new Error("No user found with this email address.");

    const authRecord = await UserAuth.findOne({
      user_id: user._id,
      otp,
      otp_expiry_time: { $gt: Date.now() },
    });

    if (!authRecord) throw new Error("OTP is invalid or has expired.");

    return { message: "OTP verified successfully" };
  }

  async googleAuth(access_token, req) {
    const { getAuth } = await import("firebase-admin/auth");
    const decodedUser = await getAuth().verifyIdToken(access_token);
    const { email, name } = decodedUser;

    let user = await User.findOne({ "personal_info.email": email });
    if (user) {
      if (!user.google_auth) throw new Error("This email was signed up without google. Please log in with password to access the account");
      if (user.disabled) throw new Error("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ admin để được hỗ trợ.");
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
