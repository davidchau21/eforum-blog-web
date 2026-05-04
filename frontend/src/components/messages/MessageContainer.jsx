import { useEffect, useContext } from "react";
import Messages from "./Messages";
import MessageInput from "./MessageInput";
import useConversation from "../../zustand/useConversation";
import { SocketContext } from "../../socket/SocketContext";
import { Link } from "react-router-dom";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers } = useContext(SocketContext);

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  const isOnline = onlineUsers.includes(selectedConversation?._id);

  return (
    <div className="flex flex-col h-full bg-white relative">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          {/* Header */}
          <div className="h-[72px] bg-white border-b border-grey px-6 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <Link
                to={`/user/${selectedConversation?.personal_info.username}`}
                className="relative shrink-0"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden border border-grey bg-grey">
                  <img
                    src={selectedConversation?.personal_info.profile_img}
                    className="w-full h-full object-cover"
                    alt={selectedConversation?.personal_info.fullname}
                  />
                </div>
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
              </Link>

              <div className="flex flex-col min-w-0">
                <Link
                  to={`/user/${selectedConversation?.personal_info.username}`}
                  className="text-[15px] text-black font-bold hover:underline transition-all duration-200 leading-tight truncate"
                >
                  {selectedConversation?.personal_info.fullname}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[12px] font-medium ${isOnline ? "text-emerald-500" : "text-dark-grey"}`}
                  >
                    {isOnline ? "Active Now" : "Offline"}
                  </span>
                  <span className="text-dark-grey/50 text-[12px]">
                    @ {selectedConversation?.personal_info.username}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-dark-grey hover:bg-grey hover:text-black transition-all">
                <i className="fi fi-rr-phone-call text-[16px]"></i>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-dark-grey hover:bg-grey hover:text-black transition-all">
                <i className="fi fi-rr-video-camera text-[16px]"></i>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-dark-grey hover:bg-grey hover:text-black transition-all">
                <i className="fi fi-rr-info text-[16px]"></i>
              </button>
            </div>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 bg-white flex flex-col min-h-0">
            <Messages />
          </div>

          {/* Message Input Area */}
          <div className="p-4 bg-white border-t border-grey">
            <MessageInput />
          </div>
        </>
      )}
    </div>
  );
};

const NoChatSelected = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-white p-8 text-center">
      <div className="max-w-xs flex flex-col items-center">
        <div className="w-20 h-20 bg-grey rounded-full flex items-center justify-center mb-6">
          <i className="fi fi-rr-messages text-3xl text-black"></i>
        </div>
        <h3 className="text-[20px] font-bold text-black mb-2">
          Welcome to Messages
        </h3>
        <p className="text-dark-grey text-[14px] mb-8 leading-relaxed">
          Select a conversation from the sidebar or start a new one to chat.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <div className="p-3 bg-grey rounded-xl text-[13px] text-black font-medium flex items-center gap-3">
            <i className="fi fi-rr-shield-check text-black text-[16px]"></i>
            Safe & Secure
          </div>
          <div className="p-3 bg-grey rounded-xl text-[13px] text-black font-medium flex items-center gap-3">
            <i className="fi fi-rr-bolt text-black text-[16px]"></i>
            Real-time messaging
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageContainer;
