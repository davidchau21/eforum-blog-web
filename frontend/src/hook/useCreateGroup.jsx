import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserContext } from "../App";
import useConversation from "../zustand/useConversation";

const useCreateGroup = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const { userAuth } = useContext(UserContext);
  const { setSelectedConversation } = useConversation();

  const createGroup = async (groupName, participantIds, groupAvatar = "") => {
    if (!groupName || groupName.trim() === "") {
      toast.error("Vui lòng nhập tên nhóm chat");
      return;
    }
    if (!participantIds || participantIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 thành viên");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/message/group/create`,
        { groupName, participantIds, groupAvatar },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );

      toast.success("Tạo nhóm chat thành công", {
        style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
      });

      // Tạo cấu trúc dữ liệu tương thích với sidebar item
      const newGroupItem = {
        _id: data._id,
        isGroup: true,
        personal_info: {
          fullname: data.groupName,
          username: `group_${data._id}`,
          profile_img: data.groupAvatar || "https://cdn-icons-png.flaticon.com/512/166/166258.png",
        },
        conversation: data._id,
        last_message: "Nhóm đã được tạo",
        last_message_time: data.createdAt,
        last_message_sender: userAuth._id,
        unread_count: 0,
      };

      // Tự động chọn nhóm mới tạo làm cuộc trò chuyện hiện tại
      setSelectedConversation(newGroupItem);

      if (onSuccess) {
        onSuccess(newGroupItem);
      }

      return newGroupItem;
    } catch (err) {
      const msg = err.response?.data?.error || "Không thể tạo nhóm chat";
      toast.error(msg, {
        style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, createGroup };
};

export default useCreateGroup;
