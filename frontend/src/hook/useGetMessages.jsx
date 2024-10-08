import { useContext, useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import axios from "axios";
import { UserContext } from "../App";
import { toast } from "react-hot-toast"; 

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { userAuth } = useContext(UserContext);

  useEffect(() => {
    const getMessages = async () => {
      try {
        setLoading(true);
        
        
        const res = await axios.get(
          import.meta.env.VITE_SERVER_DOMAIN + `/message/${selectedConversation._id}`,
          {
            headers: { Authorization: "Bearer " + userAuth.access_token },
          }
        );
        
        setMessages(res.data);
      } catch (error) {
       
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) {
      getMessages();
    }
  }, [selectedConversation._id, setMessages]); 

  return { messages, loading };
};

export default useGetMessages;
