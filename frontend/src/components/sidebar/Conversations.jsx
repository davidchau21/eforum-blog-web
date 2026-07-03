import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom"; // Import createPortal để render modal ra document.body
import Conversation from "./Conversation.jsx";
import useGetConversations from "../../hook/useGetConversations.jsx";
import { useSocketContext } from "../../socket/SocketContext.jsx";
import useOnline from "../../hook/useOnline.jsx";
import useDeleteConversation from "../../hook/useDeleteConversation.jsx";

// Skeleton item that matches the real Conversation item layout
const ConversationSkeleton = () => (
  <div className="flex gap-3 items-center mx-2 rounded-xl px-3 py-2.5 animate-pulse">
    <div className="w-11 h-11 rounded-full bg-grey flex-shrink-0"></div>
    <div className="flex flex-col flex-1 gap-2 min-w-0">
      <div className="flex justify-between">
        <div className="h-3 w-28 bg-grey rounded-full"></div>
        <div className="h-2.5 w-10 bg-grey rounded-full"></div>
      </div>
      <div className="h-2.5 w-40 bg-grey/60 rounded-full"></div>
    </div>
  </div>
);

const Conversations = ({ closeSidebar }) => {
  const { loading, conversations: fetchedConversations } = useGetConversations();
  const [conversations, setConversations] = useState([]);
  const [online, setOnline] = useState([]);
  const [conversationToDelete, setConversationToDelete] = useState(null); // Trạng thái lưu cuộc trò chuyện đang muốn xóa
  const { socket } = useSocketContext();
  const { sendOnline } = useOnline();

  // Sync local conversations from fetched data
  useEffect(() => {
    setConversations(fetchedConversations);
  }, [fetchedConversations]);

  // Handle optimistic delete: remove from local list immediately
  const handleDeleteSuccess = (deletedUserId) => {
    setConversations((prev) =>
      prev.filter((c) => c._id !== deletedUserId)
    );
    setConversationToDelete(null);
  };

  const { deleteConversation, loading: deleting } = useDeleteConversation(handleDeleteSuccess);

  const interval = useRef(null);

  // Ping server with online status every 60s
  useEffect(() => {
    interval.current = setInterval(async () => {
      try {
        await sendOnline(socket?.id);
      } catch (error) {
        console.warn(error);
      }
    }, 60000);
    return () => clearInterval(interval.current);
  }, [sendOnline, socket?.id]);

  // Track online users from socket
  useEffect(() => {
    socket?.on("online-users", (ids) => {
      setOnline([...ids]);
    });
  }, [socket, online]);

  // Listen for brand-new conversations (first message to someone new)
  useEffect(() => {
    if (!socket) return;

    const handleNewConversation = (newConv) => {
      setConversations((prev) => {
        // Avoid duplicates: if already in list, just update its metadata
        const exists = prev.some((c) => c._id === newConv._id);
        if (exists) {
          return prev.map((c) =>
            c._id === newConv._id
              ? { ...c, ...newConv }
              : c
          );
        }
        // Prepend new conversation to the top
        return [newConv, ...prev];
      });
    };

    socket.on("newConversation", handleNewConversation);
    return () => socket.off("newConversation", handleNewConversation);
  }, [socket]);

  // Filter out stale conversations with no conversation object
  const filteredConversations = conversations.filter(
    (c) => c.conversation !== null,
  );

  // Show skeletons while loading
  if (loading) {
    return (
      <div className="py-2 flex flex-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state — only after load completes and filter applied
  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-grey flex items-center justify-center mb-3">
          <i className="fi fi-rr-messages text-xl text-dark-grey"></i>
        </div>
        <p className="text-[12px] font-semibold text-dark-grey">No conversations yet</p>
        <p className="text-[11px] text-dark-grey/60 mt-1">Start a new chat to get going</p>
      </div>
    );
  }

  const confirmDeleteConversation = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete._id);
    }
  };

  return (
    <>
      <div className="py-2 flex flex-col overflow-y-auto overflow-x-hidden">
        {filteredConversations.map((conversation, index) => (
          <Conversation
            key={conversation._id}
            online={online}
            conversation={conversation}
            lastIndex={index === filteredConversations.length - 1}
            closeSidebar={closeSidebar}
            onRequestDelete={(conv) => setConversationToDelete(conv)} // Kích hoạt mở modal overlay
          />
        ))}
      </div>

      {/* Render modal toàn màn hình ra document.body bằng React Portal */}
      {conversationToDelete &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#09090b] w-full max-w-sm rounded-2xl border border-grey p-6 shadow-2xl animate-scaleUp">
              <div className="flex items-center gap-3 text-red mb-3">
                <div className="w-10 h-10 rounded-full bg-red/10 flex items-center justify-center">
                  <i className="fi fi-rr-trash text-lg"></i>
                </div>
                <h3 className="text-[16px] font-bold text-black dark:text-white">Xóa cuộc trò chuyện?</h3>
              </div>
              
              <p className="text-[13px] text-dark-grey leading-relaxed mb-6">
                Bạn có chắc muốn xóa cuộc trò chuyện với <strong className="text-black dark:text-white">@{conversationToDelete.personal_info.username}</strong>? 
                Hành động này chỉ xóa lịch sử tin nhắn ở phía bạn (xóa 1 bên), đối phương vẫn có thể xem lại tin nhắn cũ.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConversationToDelete(null)}
                  disabled={deleting}
                  className="px-4 py-2 text-[12px] font-bold text-dark-grey hover:bg-grey rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteConversation}
                  disabled={deleting}
                  className="px-4 py-2 text-[12px] font-bold text-white bg-red hover:opacity-90 rounded-xl shadow-md shadow-red/20 transition-all flex items-center gap-1.5"
                >
                  {deleting ? (
                    <>
                      <i className="fi fi-rr-spinner animate-spin"></i>
                      Đang xóa...
                    </>
                  ) : (
                    "Xóa cuộc trò chuyện"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body // Gắn trực tiếp vào body để đảm bảo hiển thị phủ toàn màn hình hoàn hảo
        )}
    </>
  );
};

export default Conversations;
