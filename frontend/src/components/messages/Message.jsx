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

  const bubbleClasses = `max-w-[80%] rounded-2xl px-4 py-3 text-[14px] ${
    isImage
      ? "bg-transparent p-0 shadow-none"
      : messageFromMe
        ? "bg-black text-white rounded-tr-none"
        : "bg-grey text-black rounded-tl-none"
  }`;

  return (
    <div
      className={`flex flex-col mb-4 ${messageFromMe ? "items-end" : "items-start"}`}
    >
      <div
        className={`flex gap-3 items-end ${messageFromMe ? "flex-row-reverse" : "flex-row"}`}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-grey">
          <img
            src={profileImage}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        <div className={bubbleClasses}>
          {isImage ? (
            <div 
              className="group relative overflow-hidden rounded-2xl border border-grey bg-grey transition-transform hover:scale-[1.02] active:scale-95 cursor-zoom-in"
              onClick={() => setFullScreenImage(message.message)}
            >
              <img
                src={message.message}
                alt="Message Content"
                className="max-w-[300px] max-h-[300px] object-cover"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <i className="fi fi-rr-zoom-in text-white text-2xl"></i>
              </div>
            </div>
          ) : isFile ? (
            <div className={`flex flex-col gap-2 p-1 min-w-[200px]`}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPDF ? "bg-rose-100 text-rose-500" : "bg-white text-black"}`}
                >
                  <i
                    className={`fi ${isPDF ? "fi-rr-file-pdf" : "fi-rr-file"} text-xl`}
                  ></i>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold truncate text-[13px]">
                    {message.fileName || "Tài liệu đính kèm"}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-medium ${messageFromMe ? "text-white/60" : "text-dark-grey/60"}`}
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
                        : "bg-white hover:bg-grey/80 text-black shadow-sm border border-grey"
                    }`}
                  >
                    <i className="fi fi-rr-eye flex items-center"></i>
                    Xem
                  </a>
                )}
                <a
                  href={message.message}
                  download
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    messageFromMe
                      ? "bg-white text-black hover:opacity-90"
                      : "bg-black text-white hover:opacity-90 shadow-sm"
                  }`}
                >
                  <i className="fi fi-rr-download flex items-center"></i>
                  Tải về
                </a>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">
              {message.message}
            </p>
          )}
        </div>
      </div>

      <div
        className={`mt-1 text-[11px] flex items-center gap-1 ${messageFromMe ? "mr-11 text-dark-grey" : "ml-11 text-dark-grey"}`}
      >
        {formattedTime}
        {messageFromMe && (
          <i
            className={`fi ${message.seen ? "fi-ss-check-circle text-emerald-500" : "fi-rs-check-circle"} text-[10px] mt-0.5`}
          ></i>
        )}
      </div>
    </div>
  );
};

export default Message;
