/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import { UserContext } from "../../App";
import useConversation from "../../zustand/useConversation";
import { formatTime } from "../../util/formatTime";

const Message = ({ message }) => {
  const { userAuth, setFullScreenImage } = useContext(UserContext);
  const { selectedConversation } = useConversation();

  const messageFromMe = message.senderId === userAuth._id;
  const profileImage = messageFromMe
    ? userAuth.profile_img
    : selectedConversation?.personal_info.profile_img;

  const isPDF = message?.type === "application/pdf";
  const isImage = message?.type?.startsWith("image");
  const isFile =
    message?.type?.startsWith("application") ||
    message?.type?.startsWith("video");
  const formattedTime = formatTime(message.createdAt);

  return (
    <div
      className={`flex flex-col mb-3 ${messageFromMe ? "items-end" : "items-start"}`}
    >
      <div
        className={`flex gap-2.5 items-end ${messageFromMe ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-grey ring-1 ring-grey">
          <img
            src={profileImage}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Bubble */}
        <div
          className={`max-w-[75%] rounded-2xl text-[13px] ${
            isImage
              ? "bg-transparent p-0"
              : messageFromMe
                ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-tr-sm px-4 py-2.5 shadow-md shadow-violet-500/20"
                : "bg-grey text-black rounded-tl-sm px-4 py-2.5 border border-grey"
          }`}
        >
          {isImage ? (
            <div
              className="group relative overflow-hidden rounded-2xl border border-grey bg-grey transition-transform hover:scale-[1.01] active:scale-95 cursor-zoom-in shadow-md"
              onClick={() => setFullScreenImage(message.message)}
            >
              <img
                src={message.message}
                alt="Message Content"
                className="max-w-[280px] max-h-[280px] object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <i className="fi fi-rr-zoom-in text-white text-lg"></i>
                </div>
              </div>
            </div>
          ) : isFile ? (
            <div className="flex flex-col gap-2 p-1 min-w-[190px]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isPDF
                      ? "bg-rose-100 text-rose-500"
                      : messageFromMe
                        ? "bg-white/20 text-white"
                        : "bg-white text-black"
                  }`}
                >
                  <i
                    className={`fi ${isPDF ? "fi-rr-file-pdf" : "fi-rr-file"} text-xl`}
                  ></i>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold truncate text-[12px]">
                    {message.fileName || "Attachment"}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-medium ${
                      messageFromMe ? "text-white/60" : "text-dark-grey"
                    }`}
                  >
                    {isPDF ? "PDF Document" : "File"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-1">
                {isPDF && (
                  <a
                    href={message.message}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      messageFromMe
                        ? "bg-white/20 hover:bg-white/30 text-white"
                        : "bg-white hover:bg-grey text-black border border-grey shadow-sm"
                    }`}
                  >
                    <i className="fi fi-rr-eye flex items-center"></i>
                    View
                  </a>
                )}
                <a
                  href={message.message}
                  download
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    messageFromMe
                      ? "bg-white text-indigo-700 hover:opacity-90"
                      : "bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:opacity-90 shadow-sm"
                  }`}
                >
                  <i className="fi fi-rr-download flex items-center"></i>
                  Download
                </a>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed text-[13px]">
              {message.message}
            </p>
          )}
        </div>
      </div>

      {/* Timestamp + seen */}
      <div
        className={`mt-1 text-[10px] flex items-center gap-1 text-dark-grey/60 ${
          messageFromMe ? "mr-10" : "ml-10"
        }`}
      >
        {formattedTime}
        {messageFromMe && (
          <i
            className={`fi ${
              message.seen
                ? "fi-ss-check-circle text-violet-500"
                : "fi-rs-check-circle text-dark-grey/40"
            } text-[10px]`}
          ></i>
        )}
      </div>
    </div>
  );
};

export default Message;
