import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    permission_name: {
      type: String,
      required: true,
    },
    permission_code: {
      type: String,
      required: true,
      unique: true,
    },
    module_name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("permissions", permissionSchema);
