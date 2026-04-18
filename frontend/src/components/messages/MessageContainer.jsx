import React, { useEffect, useContext } from "react";
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
    <div className="md:min-w-[450px] flex flex-col h-full overflow-y-auto">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-md border-b border-grey/40 px-5 py-3 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Link 
                to={`/user/${selectedConversation?.personal_info.username}`}
                className="relative group"
              >
                <img 
                  src={selectedConversation?.personal_info.profile_img} 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-grey group-hover:ring-purple/40 transition-all duration-300"
                  alt={selectedConversation?.personal_info.fullname}
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full scale-110"></span>
                )}
              </Link>

              <div className="flex flex-col">
                <Link 
                  to={`/user/${selectedConversation?.personal_info.username}`}
                  className="text-black font-bold hover:text-purple transition-colors duration-200 leading-tight"
                >
                  {selectedConversation?.personal_info.fullname}
                </Link>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${isOnline ? 'text-emerald-500' : 'hidden'}`}>
                    Đang hoạt động
                  </span>
                  <span className="text-dark-grey/40 text-[10px]">@{selectedConversation?.personal_info.username}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <button className="w-9 h-9 flex items-center justify-center rounded-xl text-dark-grey hover:bg-grey/60 hover:text-purple transition-all duration-200">
                  <i className="fi fi-rr-phone-call text-lg"></i>
               </button>
               <button className="w-9 h-9 flex items-center justify-center rounded-xl text-dark-grey hover:bg-grey/60 hover:text-purple transition-all duration-200">
                  <i className="fi fi-rr-video-camera text-lg"></i>
               </button>
               <button className="w-9 h-9 flex items-center justify-center rounded-xl text-dark-grey hover:bg-grey/60 hover:text-purple transition-all duration-200">
                  <i className="fi fi-rr-info text-lg"></i>
               </button>
            </div>
          </div>

          <div className="flex-1 h-1/2 overflow-y-auto">
            <Messages />
          </div>

          <MessageInput />
        </>
      )}
    </div>
  );
};

const NoChatSelected = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-grey/5 p-8 text-center">
      <div className="max-w-xs flex flex-col items-center">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-black/5 flex items-center justify-center mb-6 animate-bounce-slow">
           <i className="fi fi-rs-paper-plane text-4xl text-purple"></i>
        </div>
        <h3 className="text-xl font-bold text-black mb-2">Lời chào từ Edu Blog!</h3>
        <p className="text-dark-grey text-sm mb-8 leading-relaxed">
          Bắt đầu cuộc trò chuyện với bạn bè hoặc giáo viên ngay bây giờ để cùng nhau học tập.
        </p>
        <div className="flex flex-col gap-3 w-full">
            <div className="p-3 bg-white rounded-2xl border border-grey/60 text-xs text-dark-grey/80 flex items-center gap-3">
                <i className="fi fi-rr-shield-check text-emerald-500 text-base"></i>
                An toàn và bảo mật
            </div>
            <div className="p-3 bg-white rounded-2xl border border-grey/60 text-xs text-dark-grey/80 flex items-center gap-3">
                <i className="fi fi-rr-bolt text-amber-500 text-base"></i>
                Tốc độ gửi tin nhắn tức thì
            </div>
        </div>
      </div>
    </div>
  );
};

export default MessageContainer;
