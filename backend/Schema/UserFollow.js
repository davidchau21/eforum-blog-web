import mongoose, { Schema } from "mongoose";

const userFollowSchema = new mongoose.Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    following: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

userFollowSchema.index({ follower: 1, following: 1 }, { unique: true });
userFollowSchema.index({ follower: 1, createdAt: -1 });
userFollowSchema.index({ following: 1, createdAt: -1 });

export default mongoose.model("user_follows", userFollowSchema);
