import mongoose, { Schema } from "mongoose";

const collectionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

collectionSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model("collections", collectionSchema);
