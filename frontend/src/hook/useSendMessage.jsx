import { useContext, useState } from "react";
import useConversation from "../zustand/useConversation";
import { toast } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios"; // Đừng quên import axios

const useSendMessage = () => {
    const [loading, setLoading] = useState(false);
    const { messages, setMessages, selectedConversation } = useConversation();

    const { userAuth } = useContext(UserContext);

    const sendMessage = async (message,type) => {
        if (!selectedConversation) {
            toast.error("No conversation selected.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + `/message/send/${selectedConversation._id}`,
                { message,type:type },
                {
                    headers: { Authorization: "Bearer " + userAuth.access_token },
                }
            );
            setMessages([...messages, response.data]); // Thêm tin nhắn vào danh sách
        } catch (error) {
            toast.error(error.response?.data?.message || error.message); // Lấy lỗi chi tiết từ server nếu có
        } finally {
            setLoading(false); // Đảm bảo `loading` được reset sau khi hoàn thành yêu cầu
        }
    };
    const uploadFile = async (formData) => {
        if (!selectedConversation) {
            toast.error("No conversation selected.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + `/files`,
                formData,
                {
                    headers: { Authorization: "Bearer " + userAuth.access_token },
                }
            );
            return  response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message); // Lấy lỗi chi tiết từ server nếu có
            return  null;
        } finally {
            setLoading(false); // Đảm bảo `loading` được reset sau khi hoàn thành yêu cầu
        }
    };

    return { loading, sendMessage ,uploadFile};
};

export default useSendMessage;
