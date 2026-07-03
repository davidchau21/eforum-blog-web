import { useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../App";
import useConversation from "../zustand/useConversation";

const useDeleteConversation = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const { userAuth } = useContext(UserContext);
  const { selectedConversation, setSelectedConversation } = useConversation();

  const deleteConversation = async (otherUserId) => {
    if (loading) return;
    setLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_DOMAIN}/message/conversation/${otherUserId}`,
        {
          headers: {
            Authorization: "Bearer " + userAuth.access_token,
          },
        }
      );

      // If the deleted conversation is currently open, close it
      if (selectedConversation?._id === otherUserId ||
          selectedConversation?.personal_info) {
        setSelectedConversation(null);
      }

      toast.success("Đoạn hội thoại đã được xóa", {
        style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
      });

      onSuccess?.(otherUserId);
    } catch (err) {
      const msg = err.response?.data?.error || "Xóa hội thoại thất bại";
      toast.error(msg, {
        style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, deleteConversation };
};

export default useDeleteConversation;
