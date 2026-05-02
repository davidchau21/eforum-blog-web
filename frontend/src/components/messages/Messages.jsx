import { useEffect, useRef, useContext, useLayoutEffect } from "react";
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
  const lastScrollHeight = useRef(0);
  const lastFirstMessageId = useRef(null);

  // Initial scroll to bottom & Maintain scroll position
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;

    // 1. Initial Load (First time messages appear for this conversation)
    if (!lastFirstMessageId.current && !loading) {
      container.scrollTop = container.scrollHeight;
      lastFirstMessageId.current = messages[0]?._id;
      lastScrollHeight.current = container.scrollHeight;
      return;
    }

    // 2. Load More (Prepended messages)
    if (
      lastFirstMessageId.current &&
      messages[0]?._id !== lastFirstMessageId.current
    ) {
      const heightDifference =
        container.scrollHeight - lastScrollHeight.current;

      // Adjust scroll position to "stay" at the current message
      container.scrollTop += heightDifference;

      lastFirstMessageId.current = messages[0]?._id;
      lastScrollHeight.current = container.scrollHeight;
      return;
    }

    // 3. New Message (Appended messages)
    if (messages[0]?._id === lastFirstMessageId.current) {
      // Avoid updating height reference while loading spinner is active
      if (loading) return;

      const lastMessage = messages[messages.length - 1];
      const isFromMe = lastMessage.senderId === userAuth._id;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        200;

      if (isFromMe || isNearBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }
      lastScrollHeight.current = container.scrollHeight;
    }
  }, [messages, loading, userAuth._id]);

  // Reset states when changing conversation
  useEffect(() => {
    lastScrollHeight.current = 0;
    lastFirstMessageId.current = null;
  }, [selectedConversation?._id]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop <= 5 && hasMore && !loading) {
      lastScrollHeight.current = container.scrollHeight;
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
      style={{ overflowAnchor: "none" }}
      className="px-4 flex-1 overflow-auto scrollbar-hide py-4 relative"
    >
      {loading && hasMore && messages.length > 0 && (
        <div className="flex flex-col items-center justify-center py-6 gap-3 animate-fadeIn">
          <div className="w-8 h-8 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin shadow-sm"></div>
          <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            Đang tải tin nhắn cũ
          </span>
        </div>
      )}

      {!loading && messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-dark-grey/40 gap-4 opacity-60">
          <i className="fi fi-rr-messages text-6xl"></i>
          <p className="text-sm font-medium tracking-wide">
            Bắt đầu cuộc trò chuyện ngay
          </p>
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
