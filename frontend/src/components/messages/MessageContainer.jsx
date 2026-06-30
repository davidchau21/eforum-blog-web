import { useEffect, useContext, useState } from "react";
import toast from "react-hot-toast";
import Messages from "./Messages";
import MessageInput from "./MessageInput";
import useConversation from "../../zustand/useConversation";
import { SocketContext } from "../../socket/SocketContext";
import { Link } from "react-router-dom";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers } = useContext(SocketContext);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  useEffect(() => {
    setShowInfo(false);
  }, [selectedConversation?._id]);

  const isOnline = onlineUsers.includes(selectedConversation?._id);

  const handleCallNotImplemented = () => {
    toast.error("Tính năng cuộc gọi thoại đang được phát triển!", {
      icon: "📞",
      style: {
        borderRadius: "12px",
        background: "#09090b",
        color: "#fff",
      },
    });
  };

  const handleVideoNotImplemented = () => {
    toast.error("Tính năng cuộc gọi video đang được phát triển!", {
      icon: "📹",
      style: {
        borderRadius: "12px",
        background: "#09090b",
        color: "#fff",
      },
    });
  };

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
              <button 
                onClick={handleCallNotImplemented}
                className="w-10 h-10 flex items-center justify-center rounded-full text-dark-grey hover:bg-grey hover:text-black transition-all"
              >
                <i className="fi fi-rr-phone-call text-[16px]"></i>
              </button>
              <button 
                onClick={handleVideoNotImplemented}
                className="w-10 h-10 flex items-center justify-center rounded-full text-dark-grey hover:bg-grey hover:text-black transition-all"
              >
                <i className="fi fi-rr-video-camera text-[16px]"></i>
              </button>
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                  showInfo ? "bg-black text-white" : "text-dark-grey hover:bg-grey hover:text-black"
                }`}
              >
                <i className="fi fi-rr-info text-[16px]"></i>
              </button>
            </div>
          </div>

          {/* Main Chat & Sidebar Panel Container */}
          <div className="flex-1 flex overflow-hidden relative bg-white">
            {/* Left Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
              {/* Messages List Area */}
              <div className="flex-1 bg-white flex flex-col min-h-0">
                <Messages />
              </div>

              {/* Message Input Area */}
              <div className="p-4 bg-white border-t border-grey">
                <MessageInput />
              </div>
            </div>

            {/* Right User Info Panel */}
            {showInfo && (
              <div className="w-full md:w-[320px] absolute md:static inset-y-0 right-0 bg-white border-l border-grey z-20 flex flex-col overflow-y-auto shadow-xl md:shadow-none animate-slide-in">
                {/* Info Panel Header */}
                <div className="h-[72px] px-6 border-b border-grey flex items-center justify-between flex-shrink-0">
                  <h3 className="text-[15px] font-bold text-black">Thông tin chi tiết</h3>
                  <button 
                    onClick={() => setShowInfo(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-dark-grey hover:bg-grey hover:text-black transition-all"
                  >
                    <i className="fi fi-rr-cross text-[10px]"></i>
                  </button>
                </div>

                {/* Info Panel Body */}
                <div className="p-6 flex flex-col items-center text-center flex-grow">
                  {/* Large Avatar */}
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-grey bg-grey mb-3 shadow-sm relative shrink-0">
                    <img
                      src={selectedConversation?.personal_info.profile_img}
                      className="w-full h-full object-cover"
                      alt={selectedConversation?.personal_info.fullname}
                    />
                  </div>

                  {/* Name and Username */}
                  <h4 className="text-[16px] font-bold text-black leading-snug capitalize">
                    {selectedConversation?.personal_info.fullname}
                  </h4>
                  <p className="text-[12px] text-dark-grey mt-0.5">
                    @{selectedConversation?.personal_info.username}
                  </p>
                  
                  {isOnline && (
                    <span className="mt-2.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      Đang hoạt động
                    </span>
                  )}

                  {/* Bio Section */}
                  <div className="w-full border-t border-grey my-5 pt-5 text-left">
                    <h5 className="text-[11px] font-bold text-dark-grey uppercase tracking-wider mb-2">
                      Giới thiệu
                    </h5>
                    <p className="text-[13px] text-black leading-relaxed italic whitespace-pre-wrap">
                      {selectedConversation?.personal_info.bio || "Người dùng này chưa viết tiểu sử giới thiệu."}
                    </p>
                  </div>

                  {/* Social Links Section */}
                  {selectedConversation?.social_links && Object.values(selectedConversation.social_links).some(link => link) && (
                    <div className="w-full border-t border-grey mb-5 pt-4 text-left">
                      <h5 className="text-[11px] font-bold text-dark-grey uppercase tracking-wider mb-3">
                        Mạng xã hội
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedConversation.social_links).map(([platform, link]) => {
                          if (!link) return null;
                          let iconClass = "fi-rr-globe";
                          if (platform === "facebook") iconClass = "fi-brands-facebook text-[#1877F2]";
                          else if (platform === "instagram") iconClass = "fi-brands-instagram text-[#E4405F]";
                          else if (platform === "twitter") iconClass = "fi-brands-twitter text-[#1DA1F2]";
                          else if (platform === "github") iconClass = "fi-brands-github text-black dark:text-white";
                          else if (platform === "youtube") iconClass = "fi-brands-youtube text-[#FF0000]";
                          
                          return (
                            <a
                              key={platform}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg bg-grey hover:bg-grey/80 flex items-center justify-center transition-all"
                              title={platform}
                            >
                              <i className={`fi ${iconClass} text-[15px]`}></i>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick Action Button */}
                  <div className="w-full mt-auto pt-4">
                    <Link
                      to={`/user/${selectedConversation?.personal_info.username}`}
                      className="w-full py-2.5 bg-black hover:opacity-90 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <i className="fi fi-rr-user text-[14px]"></i>
                      Xem trang cá nhân
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const NoChatSelected = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-tr from-purple/5 to-transparent p-8 text-center">
      <div className="max-w-xs flex flex-col items-center">
        <div className="w-20 h-20 bg-grey rounded-full flex items-center justify-center mb-6 shadow-sm">
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
