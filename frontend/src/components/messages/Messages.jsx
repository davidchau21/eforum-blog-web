import { useEffect, useRef, useState, useContext } from "react";
import Message from "./Message";
import useGetMessages from "../../hook/useGetMessages";
import useListenMessages from "../../hook/useListenMessages";
import { getFullDay } from "../../common/date";
import { UserContext } from "../../App";
import useConversation from "../../zustand/useConversation";

const Messages = () => {
  const { messages, loading, loadMore, hasMore } = useGetMessages();
  const { selectedConversation } = useConversation();
  const { userAuth } = useContext(UserContext);
  useListenMessages();
  const lastMessageRef = useRef();
  const scrollContainerRef = useRef();
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [firstMessageId, setFirstMessageId] = useState(null);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && !loading && prevScrollHeight === 0) {
      lastMessageRef.current?.scrollIntoView({ behavior: "auto" });
      setPrevScrollHeight(scrollContainerRef.current.scrollHeight);
      setFirstMessageId(messages[0]?._id);
    }
  }, [messages, loading, prevScrollHeight]);

  // Handle scroll to bottom for NEW messages
  useEffect(() => {
    if (messages.length > 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const lastMessage = messages[messages.length - 1];
      const isFromMe = lastMessage.senderId === userAuth._id;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;

      // Only scroll down if it's a new message (not prepended old ones)
      // We check if the first message ID hasn't changed to be sure
      if (messages[0]?._id === firstMessageId) {
        if (isFromMe || isNearBottom) {
          setTimeout(() => {
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
            setPrevScrollHeight(container.scrollHeight);
          }, 100);
        }
      }
    }
  }, [messages, userAuth._id, firstMessageId]);

  // Maintain scroll position when loading MORE (older) messages
  useEffect(() => {
    if (scrollContainerRef.current && prevScrollHeight > 0 && messages.length > 0) {
      const container = scrollContainerRef.current;
      const newScrollHeight = container.scrollHeight;
      
      // If the first message ID changed, it means we prepended old messages
      if (messages[0]?._id !== firstMessageId) {
        const heightDifference = newScrollHeight - prevScrollHeight;
        container.scrollTop = heightDifference;
        setPrevScrollHeight(newScrollHeight);
        setFirstMessageId(messages[0]?._id);
      }
    }
  }, [messages, firstMessageId, prevScrollHeight]);

  // Reset states when changing conversation
  useEffect(() => {
    setPrevScrollHeight(0);
    setFirstMessageId(null);
  }, [selectedConversation?._id]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop <= 5 && hasMore && !loading) {
      setPrevScrollHeight(container.scrollHeight);
      loadMore();
    }
  };

  const renderMessagesWithDividers = () => {
    let lastDate = null;
    
    return messages.map((message, index) => {
      const messageDate = getFullDay(message.createdAt);
      const showDivider = messageDate !== lastDate;
      lastDate = messageDate;

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
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="px-4 flex-1 overflow-auto scrollbar-hide py-4 relative"
    >
      {loading && hasMore && messages.length > 0 && (
        <div className="flex flex-col items-center justify-center py-6 gap-3 animate-fadeIn">
          <div className="w-8 h-8 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin shadow-sm"></div>
          <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Đang tải tin nhắn cũ</span>
        </div>
      )}

      {!loading && messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-dark-grey/40 gap-4 opacity-60">
           <i className="fi fi-rr-messages text-6xl"></i>
           <p className="text-sm font-medium tracking-wide">Bắt đầu cuộc trò chuyện ngay</p>
        </div>
      )}

      {messages.length > 0 && renderMessagesWithDividers()}
      
      {loading && messages.length === 0 && (
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
