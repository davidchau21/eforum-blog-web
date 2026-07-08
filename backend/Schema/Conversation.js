import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    // Users who have "deleted" (hidden) this conversation on their side
    deleted_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: "",
    },
    groupAvatar: {
      type: String,
      default: "",
    },
    groupDescription: {
      type: String,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    membersCanInvite: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

const Conversation = mongoose.model("conversation", conversationSchema)

export default Conversation;