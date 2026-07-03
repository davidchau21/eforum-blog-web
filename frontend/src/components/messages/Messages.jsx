import {
  useEffect,
  useRef,
  useContext,
  useLayoutEffect,
  useState,
  useMemo,
} from "react";
import Message from "./Message";
import useGetMessages from "../../hook/useGetMessages";
import useListenMessages from "../../hook/useListenMessages";
import { getFullDay } from "../../common/date";
import { UserContext } from "../../App";
import useConversation from "../../zustand/useConversation";

const MessageSkeleton = () => (
  <div className="flex flex-col gap-5 mb-6 animate-pulse px-4">
    <div className="flex items-end gap-2.5">
      <div className="w-7 h-7 rounded-full bg-grey flex-shrink-0"></div>
      <div className="flex flex-col gap-1.5">
        <div className="w-52 h-11 bg-grey rounded-2xl rounded-tl-sm"></div>
        <div className="w-16 h-3 bg-grey/60 rounded-full ml-1"></div>
      </div>
    </div>
    <div className="flex items-end flex-row-reverse gap-2.5">
      <div className="w-7 h-7 rounded-full bg-grey flex-shrink-0"></div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="w-40 h-11 bg-grey rounded-2xl rounded-tr-sm"></div>
        <div className="w-12 h-3 bg-grey/60 rounded-full mr-1"></div>
      </div>
    </div>
  </div>
);

const Messages = () => {
  const { messages, loading, loadMore, hasMore } = useGetMessages();
  const { selectedConversation } = useConversation();
  const { userAuth } = useContext(UserContext);
  useListenMessages();

  const scrollContainerRef = useRef();
  const lastScrollHeight = useRef(0);
  const lastFirstMessageId = useRef(null);
  const lastMessageId = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Initial scroll to bottom & Maintain scroll position
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;

    const currentFirstMessageId = messages[0]?._id;
    const currentLastMessageId = messages[messages.length - 1]?._id;

    // 1. Initial Load
    if (!lastFirstMessageId.current) {
      container.scrollTop = container.scrollHeight;
      lastFirstMessageId.current = currentFirstMessageId;
      lastMessageId.current = currentLastMessageId;
      lastScrollHeight.current = container.scrollHeight;
      return;
    }

    // 2. Prepending (Loading older messages)
    if (currentFirstMessageId !== lastFirstMessageId.current) {
      const heightDifference =
        container.scrollHeight - lastScrollHeight.current;
      container.scrollTop += heightDifference;

      lastFirstMessageId.current = currentFirstMessageId;
      lastScrollHeight.current = container.scrollHeight;
      return;
    }

    // 3. Appending (New message)
    if (currentLastMessageId !== lastMessageId.current) {
      if (!loading) {
        const lastMessage = messages[messages.length - 1];
        const isFromMe = lastMessage?.senderId === userAuth?._id;
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          200;

        if (isFromMe || isNearBottom) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
        lastMessageId.current = currentLastMessageId;
      }
    }

    // 4. Loading state changed
    if (loading) {
      if (container.scrollHeight > lastScrollHeight.current) {
        const diff = container.scrollHeight - lastScrollHeight.current;
        container.scrollTop += diff;
      }
    }

    lastScrollHeight.current = container.scrollHeight;
  }, [messages.length, loading, userAuth?._id]);

  // Reset states when changing conversation
  useEffect(() => {
    lastScrollHeight.current = 0;
    lastFirstMessageId.current = null;
    lastMessageId.current = null;
    setShowScrollToBottom(false);
  }, [selectedConversation?._id]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Load more
    if (container.scrollTop <= 5 && hasMore && !loading) {
      lastScrollHeight.current = container.scrollHeight;
      loadMore();
    }

    // Show/Hide scroll to bottom button
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      400;
    setShowScrollToBottom(!isNearBottom);
  };

  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  };

  const renderedMessages = useMemo(() => {
    let lastDate = null;

    return messages.map((message) => {
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
            <div className="flex items-center my-5 gap-3 px-2">
              <div className="flex-1 h-px bg-grey"></div>
              <span className="text-[10px] font-bold text-dark-grey uppercase tracking-widest px-3 py-1 bg-grey rounded-full border border-grey whitespace-nowrap">
                {dividerText}
              </span>
              <div className="flex-1 h-px bg-grey"></div>
            </div>
          )}
          <Message message={message} />
        </div>
      );
    });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col relative min-h-0 overflow-hidden bg-white">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ overflowAnchor: "none" }}
        className="px-4 flex-1 overflow-auto scrollbar-hide py-4"
      >
        {loading && hasMore && messages.length > 0 && (
          <div className="mb-5">
            <MessageSkeleton />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 bg-grey rounded-2xl border border-grey flex items-center justify-center">
              <i className="fi fi-rr-messages text-2xl text-dark-grey"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-black">No messages yet</p>
              <p className="text-[11px] text-dark-grey mt-1">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        )}

        {renderedMessages}

        {loading && messages.length === 0 && (
          <div className="h-full flex flex-col gap-5 p-2">
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-5 right-5 w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-full shadow-xl shadow-violet-500/30 flex items-center justify-center hover:from-violet-600 hover:to-indigo-700 hover:scale-110 active:scale-95 transition-all duration-200 z-30"
        >
          <i className="fi fi-rr-arrow-small-down text-2xl mt-0.5"></i>
        </button>
      )}
    </div>
  );
};

export default Messages;
