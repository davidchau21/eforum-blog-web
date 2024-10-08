import { useEffect } from "react";
import { useSocketContext } from "../socket/SocketContext";
import useConversation from "../zustand/useConversation";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { messages, setMessages } = useConversation();

  console.log("mess: ",messages);
  console.log("socket: ", socket);

  useEffect(() => {


    socket?.on("newMessage", (newMessage) => {

      const isDuplicate = messages.some((message) => message._id === newMessage._id);
      if (isDuplicate) {
        return;
      }
      setMessages([...messages, newMessage]);
    });

    
  }, [socket, setMessages, messages]);

  return { messages, setMessages };
};

export default useListenMessages;
