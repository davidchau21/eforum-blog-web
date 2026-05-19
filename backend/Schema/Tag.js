import mongoose from "mongoose";

const tagSchema = mongoose.Schema(
  {
    tag_name: {
      type: String,
      required: true,
    },
    is_disabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("tags", tagSchema);
