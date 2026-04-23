import mongoose, { Schema } from "mongoose";

const userInterestSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    tag: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    score: {
      type: Number,
      default: 1,
      min: 1,
    },
    lastInteractedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userInterestSchema.index({ user: 1, tag: 1 }, { unique: true });
userInterestSchema.index({ user: 1, score: -1, lastInteractedAt: -1 });

export default mongoose.model("user_interests", userInterestSchema);
