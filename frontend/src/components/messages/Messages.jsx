import React, { useEffect, useRef } from "react";
import Message from "./Message";
import useGetMessages from "../../hook/useGetMessages";
import useListenMessages from "../../hook/useListenMessages";


const Messages = () => {
  const { messages, loading } = useGetMessages();

  // console.log(messages)

  useListenMessages();

  const lastMessageRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages]);

  return (
    <div className="px-4 flex-1 overflow-auto">
      {!loading && messages.length === 0 && (
        <div className="text-center text-gray-500">
          Start conversation by sending a message
        </div>
      )}

      {!loading &&
        messages.length > 0 &&
        messages.map((message) => (
          <div
            key={message._id}
            ref={lastMessageRef}
          >
            <Message message={message} />
          </div>
        ))}
    </div>
  );
};

export default Messages;
