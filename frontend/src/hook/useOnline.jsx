import { useContext } from "react";

import { toast } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";


const useOnline = () => {


    const { userAuth } = useContext(UserContext);

    const sendOnline = async (socketId) => {

        try {

             await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + `/users/online`,
                { socketId },
                {
                    headers: { Authorization: "Bearer " + userAuth.access_token },
                }
            );

        } catch (error) {
            toast.error(error.response?.data?.message || error.message); // Lấy lỗi chi tiết từ server nếu có
        }
    };

    return { sendOnline };
};

export default useOnline;
