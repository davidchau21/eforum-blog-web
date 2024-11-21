import React, { useEffect, useState } from "react";
import useConversation from "../../zustand/useConversation";

const Conversation = ({ conversation, lastIndex, online }) => {
  const { selectedConversation, setSelectedConversation, messages } = useConversation();

  const isOnline = online?.includes(conversation._id);

  const isSelected = selectedConversation?._id === conversation._id;

  const lastMessageTime = messages.length > 0 ? new Date(messages[messages.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  // console.log("Last message time: ", lastMessageTime);

  const lastMessage = messages.length > 0 ? messages[messages.length - 1].message : null;
  // console.log("Last message: ", lastMessage);

  return (
    <>
      <div
        className={`flex gap-2 items-center hover:bg-blue-500 rounded py-2 cursor-pointer ${
          isSelected ? "bg-emerald-800" : ""
        }`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="w-12 rounded-full">
            <img src={conversation.personal_info.profile_img} />
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex justify-between">
            <h1 className="font-bold">{conversation.personal_info.username}</h1>
            {/* {lastMessageTime && <span className="text-xs text-gray-400">{lastMessageTime}</span>} */}
          </div>
          {/* <p className="text-sm text-gray-400">{lastMessage}</p> */}
        </div>
      </div>

      {!lastIndex && <hr className="my-2" />}
    </>
  );
};

export default Conversation;
