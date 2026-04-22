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
    <>
      <div
        className={`flex gap-3 items-center rounded-2xl p-3 cursor-pointer transition-all duration-300 group ${
          isSelected
            ? "bg-purple font-medium shadow-lg shadow-purple/20 scale-[1.02]"
            : "hover:bg-grey/50"
        }`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-purple/30 transition-all duration-300">
            <img
              src={conversation.personal_info.profile_img}
              className="w-full h-full object-cover"
              alt={conversation.personal_info.fullname}
            />
          </div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          )}
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-0.5">
            <h1
              className={`text-sm font-bold truncate transition-colors duration-300 ${isSelected ? "text-white" : "text-black group-hover:text-purple"}`}
            >
              {conversation.personal_info.fullname}
            </h1>
            <div className="flex items-center gap-2">
              {conversation.last_message_time && (
                <span
                  className={`text-[10px] whitespace-nowrap ${isSelected ? "text-white/60" : "text-dark-grey/60"}`}
                >
                  {formatLastMessageTime(conversation.last_message_time)}
                </span>
              )}
              {conversation.unread_count > 0 && (
                <span
                  className={`min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${isSelected ? "bg-white text-purple" : "bg-rose-500 text-white"}`}
                >
                  {conversation.unread_count > 99
                    ? "99+"
                    : conversation.unread_count}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 overflow-hidden">
            <p
              className={`text-[11px] truncate flex-1 transition-colors duration-300 ${isSelected ? "text-white/80" : "text-dark-grey"}`}
            >
              {conversation.last_message
                ? isLastMessageFromMe
                  ? `Bạn: ${conversation.last_message}`
                  : conversation.last_message
                : `@${conversation.personal_info.username}`}
            </p>
          </div>
        </div>
      </div>

      {!lastIndex && <div className="h-[1px] bg-grey/30 my-1 mx-3" />}
    </>
  );
};

export default Conversation;
