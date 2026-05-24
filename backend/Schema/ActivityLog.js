import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    target_type: {
      type: String,
      required: true,
    },
    target_id: {
      type: String,
    },
    details: {
      type: String,
      required: true,
    },
    ip_address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("activity_logs", activityLogSchema);
