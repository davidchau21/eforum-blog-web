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
    <div className="flex flex-col h-full bg-white relative">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          {/* Glassmorphic Header */}
          <div className="h-[72px] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <Link 
                to={`/user/${selectedConversation?.personal_info.username}`}
                className="relative shrink-0"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-slate-100">
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
                  className="text-slate-800 font-bold hover:text-indigo-600 transition-colors duration-200 leading-tight truncate"
                >
                  {selectedConversation?.personal_info.fullname}
                </Link>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {isOnline ? 'Active Now' : 'Offline'}
                  </span>
                  <span className="text-slate-300 text-[11px]">@ {selectedConversation?.personal_info.username}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                  <i className="fi fi-rr-phone-call text-lg"></i>
               </button>
               <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                  <i className="fi fi-rr-video-camera text-lg"></i>
               </button>
               <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-all">
                  <i className="fi fi-rr-info text-lg"></i>
               </button>
            </div>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 bg-slate-50/20 flex flex-col min-h-0">
            <Messages />
          </div>

          {/* Message Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <MessageInput />
          </div>
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
