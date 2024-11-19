import React, { useEffect } from "react";
import Messages from "./Messages";
import MessageInput from "./MessageInput";
import useConversation from "../../zustand/useConversation";
import { TiMessages } from "react-icons/ti";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();

  useEffect(() => {
    if (!selectedConversation) {
      setSelectedConversation;
    }
  }, []);

  return (
    <div className="md:min-w-[450px] flex flex-col h-full overflow-y-auto">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          <div className="bg-slate-500 px-4 py-2 mb-2">
            <span className="label-text">To: </span>
            <span className="text-gray-900 font-bold">
              {selectedConversation?.personal_info.username}
            </span>
          </div>

          <div className="flex-1  h-1/2 overflow-y-auto">
            <Messages />
          </div>

          <MessageInput />
        </>
      )}
    </div>
  );
};

const NoChatSelected = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="px-4 text-center sm:text-lg ms:text-xl text-grey-800 font-semibold flex flex-col items-center gap-2">
        <p>Welcome </p>

        <p>Select a chat to start messaging</p>

        <TiMessages className="text-3xl md:text-6xl text-center" />
      </div>
    </div>
  );
};

export default MessageContainer;
