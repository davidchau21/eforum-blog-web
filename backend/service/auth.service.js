import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import User from "../Schema/User.js";
import UserAuth from "../Schema/UserAuth.js";
import { accessTokenSecret, verificationTokenSecret } from "../config/auth.js";
import mailService from "../integrations/nodemailer.js";
import otpTemplate from "../Mail/otp.js";
import resetPasswordTemplate from "../Mail/resetPassword.js";
import { env } from "../config/env.js";
import { nanoid } from "nanoid";

class AuthService {
  formatDatatoSend(user) {
    const access_token = jwt.sign(
      { id: user._id, role: user.personal_info.role },
      accessTokenSecret,
      { expiresIn: "5h" }
    );

    return {
      access_token,
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

  async signin({ email, password }) {
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) throw new Error("Email not found");
    if (!user.verified) throw new Error("Account not verified. Please verify your account first.");
    if (user.google_auth) throw new Error("Account was created using google. Try logging in with google.");

    const isPasswordValid = await bcrypt.compare(password, user.personal_info.password);
    if (!isPasswordValid) throw new Error("Incorrect password");

    return this.formatDatatoSend(user);
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

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.google_auth) throw new Error("You can't change account's password because you logged in through google");

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.personal_info.password);
    if (!isCurrentPasswordValid) throw new Error("Incorrect current password");

    user.personal_info.password = await bcrypt.hash(newPassword, 10);
    await user.save();
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

    return { message: "Password has been reset successfully." };
  }

  async googleAuth(access_token) {
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
    return this.formatDatatoSend(user);
  }
}

export default new AuthService();
