import React, { useContext, useState } from "react";
import Modal from "react-modal";
import { UserContext } from "../../App";
import useConversation from "../../zustand/useConversation";
import { formatTime } from "../../util/formatTime";

const Message = ({ message }) => {
  const { userAuth } = useContext(UserContext);
  const { selectedConversation } = useConversation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const messageFromMe = message.senderId === userAuth._id;
  const chatClassName = messageFromMe ? "chat-end" : "chat-start";
  const profileImage = messageFromMe
    ? userAuth.profile_img
    : selectedConversation?.personal_info.profile_img;
  const msgBgColor = messageFromMe ? "bg-blue-500" : "bg-blue-400";
  const formattedTime = formatTime(message.createdAt);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={`chat ${chatClassName}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img src={profileImage} alt="User Avatar" />
        </div>
      </div>

      <div className={`chat-bubble text-white ${msgBgColor}`}>
        {message?.type?.startsWith("image") ? (
          <div className="avatar">
            <div
              className="w-40 h-40 rounded cursor-pointer"
              onClick={openModal}
            >
              <img src={message.message} alt="Message Content" />
            </div>
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

      <Modal 
        isOpen={isModalOpen} 
        onRequestClose={closeModal} 
        contentLabel="Image Modal"
        className="fixed inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="relative p-4 bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] flex flex-col items-center">
          <img
            src={message.message}
            alt="Enlarged Message Content"
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
          <button 
            onClick={closeModal} 
            className="mt-2 text-red bg-red-500 rounded-full p-2"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Message;
