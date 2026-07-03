import { useEffect, useContext, useState } from "react";
import Messages from "./Messages";
import MessageInput from "./MessageInput";
import { ChatHeader, UserInfoPanel, NoChatSelected } from "./ChatParts";
import useConversation from "../../zustand/useConversation";
import { SocketContext } from "../../socket/SocketContext";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers } = useContext(SocketContext);
  const [showInfo, setShowInfo] = useState(false);

  // Clear selected conversation on unmount
  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  // Reset info panel when switching conversation
  useEffect(() => {
    setShowInfo(false);
  }, [selectedConversation?._id]);

  const isOnline = onlineUsers.includes(selectedConversation?._id);

  if (!selectedConversation) {
    return (
      <div className="flex flex-col h-full bg-white relative">
        <NoChatSelected />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <ChatHeader
        conversation={selectedConversation}
        isOnline={isOnline}
        showInfo={showInfo}
        onToggleInfo={() => setShowInfo((prev) => !prev)}
      />

      {/* Chat body + optional info panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Messages + Input */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex flex-col min-h-0">
            <Messages />
          </div>
          <div className="px-4 py-3 bg-white border-t border-grey">
            <MessageInput />
          </div>
        </div>

        {/* Info panel (slides in from right) */}
        {showInfo && (
          <UserInfoPanel
            conversation={selectedConversation}
            isOnline={isOnline}
            onClose={() => setShowInfo(false)}
          />
        )}
      </div>
    </div>
  );
};

export default MessageContainer;
