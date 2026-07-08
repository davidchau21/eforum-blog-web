import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserContext } from "../App";

const useGetConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userAuth } = useContext(UserContext);

  useEffect(() => {
    if (!userAuth || !userAuth.access_token) {
      setLoading(false);
      return;
    }

    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/users", {
        headers: {
          Authorization: "Bearer " + userAuth.access_token,
        },
      })
      .then(({ data }) => {
        setConversations(data);
        setLoading(false);
      })
      .catch((err) => {
        const errMsg = err.response?.data?.error || "";
        const status = err.response?.status;
        if (
          status === 401 ||
          status === 403 ||
          errMsg.toLowerCase().includes("token") ||
          errMsg.toLowerCase().includes("session")
        ) {
          console.error("Session expired in useGetConversations:", errMsg);
          setLoading(false);
          return;
        }
        toast.error(errMsg || "Lỗi khi tải danh sách cuộc trò chuyện.");
        setLoading(false);
      });
  }, [userAuth?.access_token]);

  return { loading, conversations, setConversations };
};

export default useGetConversations;
