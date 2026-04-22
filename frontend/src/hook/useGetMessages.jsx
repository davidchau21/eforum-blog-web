import { useContext, useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import axios from "axios";
import { UserContext } from "../App";
import { toast } from "react-hot-toast";

const useGetMessages = (limit = 10) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { userAuth, setUserAuth } = useContext(UserContext);

  const getMessages = async (pageNum = 1) => {
    if (!selectedConversation?._id) return;

    try {
      setLoading(true);
      const res = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN +
          `/message/${selectedConversation._id}`,
        {
          params: { page: pageNum, limit },
          headers: { Authorization: "Bearer " + userAuth.access_token },
        },
      );

      const fetchedMessages = res.data;

      if (fetchedMessages.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (pageNum === 1) {
        setMessages(fetchedMessages);
        // Mark as seen logic only for initial load
        const newlyReadCount = fetchedMessages.filter(
          (m) => m.receiverId === userAuth._id && !m.seen,
        ).length;
        if (newlyReadCount > 0) {
          setUserAuth((prev) => ({
            ...prev,
            unread_messages: Math.max(
              0,
              (prev.unread_messages || 0) - newlyReadCount,
            ),
          }));
        }
      } else {
        setMessages([...fetchedMessages, ...messages]);
      }

      setPage(pageNum);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    getMessages(1);
  }, [selectedConversation?._id]);

  const loadMore = () => {
    if (!loading && hasMore) {
      getMessages(page + 1);
    }
  };

  return { messages, loading, loadMore, hasMore };
};

export default useGetMessages;
