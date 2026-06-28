import mongoose, { Schema } from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: [String],
      default: [
        "Tôn trọng các thành viên khác, không công kích cá nhân.",
        "Chia sẻ tài liệu học tập chất lượng, ghi rõ nguồn nếu sưu tầm.",
        "Không đăng bài quảng cáo, spam, hoặc tin nhắn rác."
      ],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    settings: {
      memberPostApprovalRequired: {
        type: Boolean,
        default: false,
      },
      memberUploadApprovalRequired: {
        type: Boolean,
        default: false,
      },
      moderatorCanKick: {
        type: Boolean,
        default: true,
      },
      moderatorCanApprove: {
        type: Boolean,
        default: true,
      },
      moderatorCanDeletePost: {
        type: Boolean,
        default: true,
      },
      deputyCanKick: {
        type: Boolean,
        default: true,
      },
      deputyCanApprove: {
        type: Boolean,
        default: true,
      },
      deputyCanDeletePost: {
        type: Boolean,
        default: true,
      },
      deputyCanChangeSettings: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("groups", groupSchema);
