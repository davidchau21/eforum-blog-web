import mongoose, { Schema } from "mongoose";

const savedBlogSchema = mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    blog: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "blogs",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can't save the same blog twice
savedBlogSchema.index({ user: 1, blog: 1 }, { unique: true });

export default mongoose.model("saved_blogs", savedBlogSchema);
