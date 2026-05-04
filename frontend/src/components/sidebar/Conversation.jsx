/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useContext } from "react";
import useConversation from "../../zustand/useConversation";
import { UserContext } from "../../App";

const Conversation = ({ conversation, lastIndex, online }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { userAuth } = useContext(UserContext);

  const isOnline = online?.includes(conversation._id);
  const isSelected = selectedConversation?._id === conversation._id;
  const isLastMessageFromMe = conversation.last_message_sender === userAuth._id;

  const formatLastMessageTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], { day: "numeric", month: "short" });
  };

  return (
    <div
      className={`flex gap-3 items-center mx-2 rounded-xl px-3 py-3 cursor-pointer transition-all duration-200 ${
        isSelected ? "bg-black text-white" : "hover:bg-grey/70"
      }`}
      onClick={() => setSelectedConversation(conversation)}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-11 h-11 rounded-full overflow-hidden ring-2 transition-all ${isSelected ? "ring-white/20" : "ring-grey"}`}
        >
          <img
            src={conversation.personal_info.profile_img}
            className="w-full h-full object-cover"
            alt={conversation.personal_info.fullname}
          />
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <div className="flex justify-between items-center">
          <h1
            className={`text-[14px] font-semibold truncate ${isSelected ? "text-white" : "text-black"}`}
          >
            {conversation.personal_info.fullname}
          </h1>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {conversation.last_message_time && (
              <span
                className={`text-[11px] whitespace-nowrap ${isSelected ? "text-white/50" : "text-dark-grey/60"}`}
              >
                {formatLastMessageTime(conversation.last_message_time)}
              </span>
            )}
            {conversation.unread_count > 0 && (
              <span
                className={`min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? "bg-white text-black" : "bg-black text-white"
                }`}
              >
                {conversation.unread_count > 99
                  ? "99+"
                  : conversation.unread_count}
              </span>
            )}
          </div>
        </div>

        <p
          className={`text-[12px] truncate mt-0.5 ${isSelected ? "text-white/60" : "text-dark-grey"}`}
        >
          {conversation.last_message
            ? isLastMessageFromMe
              ? `You: ${conversation.last_message}`
              : conversation.last_message
            : `@${conversation.personal_info.username}`}
        </p>
      </div>
    </div>
  );
};

export default Conversation;
