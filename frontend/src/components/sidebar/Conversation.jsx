import React, {useEffect, useState} from "react";
import useConversation from "../../zustand/useConversation";
import { useSocketContext } from "../../socket/SocketContext";


const Conversation = ({ conversation, lastIndex ,online }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();


const isOnline =online?.includes(conversation._id)

const isSelected =selectedConversation?._id === conversation._id

  return (
    <>
      <div
        className={`flex gap-2 items-center hover:bg-blue-500 rounded py-2 py-1 cursor-pointer ${
          isSelected ? "bg-sky-500" : ""
        }`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className={`avatar ${isOnline ? "online" : "" }`}>
          <div className="w-12 rounded-full">
            <img src={conversation.personal_info.profile_img} />
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex justify-between">
            <h1 className="font-bold">{conversation.personal_info.username}</h1>
            <span className="text-xs text-gray-400">1:30 PM</span>
          </div>
          <p className="text-sm text-gray-400">Hello, how are you?</p>
        </div>
      </div>

      {!lastIndex && <hr className="my-2" />}
    </>
  );
};

export default Conversation;
