import React, { useContext } from "react";
import { UserContext } from "../../App";
import useConversation from "../../zustand/useConversation";
import { formatTime } from "../../util/formatTime";


const Message = ({ message }) => {
  // console.log(message);
  const { userAuth } = useContext(UserContext);

  const { selectedConversation } = useConversation();

  const messageFromMe = message.senderId === userAuth._id;

  const chatClassName = messageFromMe ? "chat-end" : "chat-start";

  const profileImage = messageFromMe
    ? userAuth.profile_img
    : selectedConversation?.personal_info.profile_img;

  const msgBgColor = messageFromMe ? "bg-green-500" : "";

  const formattedTime = formatTime(message.createdAt);



  return (
    <div className={`chat ${chatClassName}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img src={profileImage} alt="User Avatar" />
        </div>
      </div>

      <div className={`chat-bubble text-white ${msgBgColor}`}>

          {message?.type?.startsWith('image') ? (
              <div className="avatar">
                  <div className="w-26 rounded">
                      <img src={message.message}/>
                  </div>
              </div>
          ) : message.message}
      </div>
      <div className="chat-footer opacity-50 text-xs flex gap-1 items-center text-slate-950">
        {formattedTime}
      </div>
    </div>
  );
};

export default Message;
