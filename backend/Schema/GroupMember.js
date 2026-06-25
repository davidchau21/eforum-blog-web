import mongoose, { Schema } from "mongoose";

const groupMemberSchema = new mongoose.Schema(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: "groups",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    role: {
      type: String,
      enum: ["OWNER", "DEPUTY", "MODERATOR", "MEMBER"],
      default: "MEMBER",
    },
    status: {
      type: String,
      enum: ["PENDING", "JOINED"],
      default: "JOINED",
    },
    muteNotifications: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

groupMemberSchema.index({ group: 1, user: 1 }, { unique: true });

export default mongoose.model("group_members", groupMemberSchema);
