import mongoose, { Schema } from "mongoose";

const oauthSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    user_type: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    access_token: {
      type: String,
    },
    access_token_expires_at: {
      type: Date,
    },
    refresh_token: {
      type: String,
    },
    refresh_token_expires_at: {
      type: Date,
    },
    ip_address: {
      type: String,
      default: "",
    },
    user_agent: {
      type: String,
      default: "",
    },
    is_active: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
    roles: {
      type: [String],
      default: [],
    },
    otp_used: {
      type: Boolean,
      default: false,
    },
    otp_attempts: {
      type: Number,
      default: 0,
    },
    // OTP & password reset fields (kept for signup/forgot-password flows)
    otp: {
      type: String,
    },
    otp_expiry_time: {
      type: Date,
    },
    otpResendCount: {
      type: Number,
      default: 0,
    },
    otpLastSentAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

oauthSchema.index({ user_id: 1 });
oauthSchema.index({ sessionId: 1 });
oauthSchema.index({ access_token: 1 });
oauthSchema.index({ refresh_token: 1 });
oauthSchema.index({ access_token_expires_at: 1 });
oauthSchema.index({ otp_expiry_time: 1 });
oauthSchema.index({ passwordResetToken: 1 });

export default mongoose.model("oauth", oauthSchema);
