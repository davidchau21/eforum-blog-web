import mongoose, { Schema } from "mongoose";

const userAuthSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "users",
    },
    otp: {
      type: String,
    },
    otp_expiry_time: {
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

userAuthSchema.index({ otp_expiry_time: 1 });
userAuthSchema.index({ passwordResetToken: 1 });
userAuthSchema.index({ passwordResetExpires: 1 });

export default mongoose.model("user_auths", userAuthSchema);
