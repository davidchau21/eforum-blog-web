import { useEffect, useRef } from "react";
import Message from "./Message";
import useGetMessages from "../../hook/useGetMessages";
import useListenMessages from "../../hook/useListenMessages";
import { getFullDay } from "../../common/date";

const Messages = () => {
  const { messages, loading } = useGetMessages();
  useListenMessages();
  const lastMessageRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages]);

  const renderMessagesWithDividers = () => {
    let lastDate = null;
    
    return messages.map((message, index) => {
      const messageDate = getFullDay(message.createdAt);
      const showDivider = messageDate !== lastDate;
      lastDate = messageDate;

      // Determine divider text (Today, Yesterday, or Date)
      const today = getFullDay(new Date());
      const yesterday = getFullDay(new Date(Date.now() - 86400000));
      let dividerText = messageDate;
      
      if (messageDate === today) dividerText = "Today";
      else if (messageDate === yesterday) dividerText = "Yesterday";

      return (
        <div key={message._id}>
          {showDivider && (
            <div className="flex items-center my-6 gap-4">
              <div className="flex-1 h-[1px] bg-grey/30"></div>
              <span className="text-[11px] font-bold text-dark-grey/50 uppercase tracking-widest px-3 py-1 bg-grey/10 rounded-full border border-grey/20">
                {dividerText}
              </span>
              <div className="flex-1 h-[1px] bg-grey/30"></div>
            </div>
          )}
          <div ref={index === messages.length - 1 ? lastMessageRef : null}>
            <Message message={message} />
          </div>
        </div>
      );
    });
  };

  return (
    <div className="px-4 flex-1 overflow-auto scrollbar-hide py-4">
      {!loading && messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-dark-grey/40 gap-4 opacity-60">
           <i className="fi fi-rr-messages text-6xl"></i>
           <p className="text-sm font-medium tracking-wide">Bắt đầu cuộc trò chuyện ngay</p>
        </div>
      )}

      {!loading && messages.length > 0 && renderMessagesWithDividers()}
      
      {loading && (
        <div className="h-full flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-grey/30"></div>
                <div className="w-24 h-2 bg-grey/30 rounded"></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
