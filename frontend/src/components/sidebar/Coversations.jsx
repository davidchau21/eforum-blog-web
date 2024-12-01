import React, { useEffect, useRef, useState } from "react";
import Conversation from "./Conversation";
import useGetConversations from "../../hook/useGetConversations";
import Loader from "../loader.component";
import { useSocketContext } from "../../socket/SocketContext.jsx";
import useOnline from "../../hook/useOnline.jsx";

const Conversations = () => {
  const { loading, conversations, refetchConversations } = useGetConversations();
  const [online, setOnline] = useState([]);
  const { socket } = useSocketContext();
  const { sendOnline } = useOnline();
  let interval = useRef(null);

  useEffect(() => {
    interval.current = setInterval(async () => {
      try {
        await sendOnline(socket?.id);
      } catch (error) {
        console.warn(error);
      }
    }, 60000); //TODO: gửi về server là đang online mỗi 30 giây

    return () => clearInterval(interval.current);
  }, [sendOnline, socket?.id]);

  useEffect(() => {
    socket?.on("online-users", (ids) => {
      setOnline([...ids]);
    });

    socket?.on("new-conversation", (newConversation) => {
      // Add the new conversation to the existing ones
      refetchConversations();  // Fetch the updated list of conversations
    });

    return () => {
      socket?.off("new-conversation");  // Clean up the socket listener
    };
  }, [socket]);

  // Xử lý trường hợp không có conversations
  if (conversations.length === 0) {
    return <div>No conversations found.</div>;
  }

  // console.log("conversations: ", conversations);

  const filteredConversations = conversations.filter((conversation) => conversation.conversation !== null);

  return (
    <div className="py-2 flex flex-col overflow-auto">
      {loading ? (
        <Loader />
      ) : (
        filteredConversations.map((conversation, index) => (
          <Conversation
            key={conversation._id}
            online={online}
            conversation={conversation}
            lastIndex={index === filteredConversations.length - 1}
          />
        ))
      )}
    </div>
  );
};

export default Conversations;
