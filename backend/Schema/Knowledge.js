import mongoose from "mongoose";

const knowledgeSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number], // Array of floats (768 dimensions for Google gemini-embedding-001)
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("knowledges", knowledgeSchema);
