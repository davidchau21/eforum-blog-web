import React, { useContext } from "react";
import { UserContext } from "../../App";
import useConversation from "../../zustand/useConversation";
import { formatTime } from "../../util/formatTime";

const Message = ({ message }) => {
  const { userAuth } = useContext(UserContext);
  const { selectedConversation } = useConversation();

  const messageFromMe = message.senderId === userAuth._id;
  const chatClassName = messageFromMe ? "chat-end" : "chat-start";
  const profileImage = messageFromMe
    ? userAuth.profile_img
    : selectedConversation?.personal_info.profile_img;
  const msgBgColor = message?.type?.startsWith("image")
    ? "bg-transparent"
    : messageFromMe
    ? "bg-blue-500"
    : "bg-blue-400";
  const formattedTime = formatTime(message.createdAt);

  const openModal = () => {
    document.getElementById(`modal-${message._id}`).showModal();
  };

  const closeModal = () => {
    document.getElementById(`modal-${message._id}`).close();
  };

  return (
    <div className={`chat ${chatClassName}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img src={profileImage} alt="User Avatar" />
        </div>
      </div>

      <div className={`chat-bubble text-white ${msgBgColor}`}>
        {message?.type?.startsWith("image") ? (
          <div className="cursor-pointer">
            <img
              src={message.message}
              alt="Message Content"
              className="rounded-lg max-w-[250px] max-h-[250px] object-cover"
              onClick={openModal}
            />
          </div>
        ) : message?.type?.startsWith("application") ? (
          <a
            href={message.message}
            download
            className="text-blue-200 underline flex items-center gap-2"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/124/124837.png"
              alt="File Icon"
              className="w-8 h-8 inline-block"
            />
            {message.fileName || "Download File"}
          </a>
        ) : (
          message.message
        )}
      </div>

      <div className="chat-footer opacity-50 text-xs flex gap-1 items-center text-slate-950">
        {formattedTime}
      </div>

      {/* Modal using DaisyUI */}
      <dialog id={`modal-${message._id}`} className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <img
            src={message.message}
            alt="Enlarged Message Content"
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
          <div className="modal-action">
            <button className="btn btn-error" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Message;
