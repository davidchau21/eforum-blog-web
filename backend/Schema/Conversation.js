import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    // Users who have "deleted" (hidden) this conversation on their side
    deleted_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true }
)

const Conversation = mongoose.model("conversation", conversationSchema)

export default Conversation;