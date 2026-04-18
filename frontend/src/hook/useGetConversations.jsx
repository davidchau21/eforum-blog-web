import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserContext } from "../App";

const useGetConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userAuth } = useContext(UserContext);

  useEffect(() => {
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
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  }, [userAuth.access_token]);

  return { loading, conversations };
};

export default useGetConversations;
