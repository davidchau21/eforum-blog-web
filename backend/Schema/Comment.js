import mongoose, { Schema } from "mongoose";

const commentSchema = mongoose.Schema(
  {
    blog_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "blogs",
    },
    blog_author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "blogs",
    },
    comment: {
      type: String,
      required: false,
    },
    image: {
      type: String, 
      required: false,
    },
    children: {
      type: [Schema.Types.ObjectId],
      ref: "comments",
    },
    commented_by: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "users",
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "comments",
    },
    isReport: {
      type: Boolean,
      default: false,
    },
    reportUser: { type: Schema.Types.ObjectId, required: false, ref: "users" },
  },
  {
    timestamps: {
      createdAt: "commentedAt",
    },
  }
);

export default mongoose.model("comments", commentSchema);
