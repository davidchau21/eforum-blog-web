import React, { useEffect, useState } from "react";
import { BsSend } from "react-icons/bs";
import { MdOutlineCloudUpload, MdOutlineEmojiEmotions } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import useSendMessage from "../../hook/useSendMessage";
import fileIcon from "../../imgs/file-folder.jpg";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const { loading, uploadFile, sendMessage } = useSendMessage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Generate a preview if it's an image
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(fileIcon);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFile) {
      const formData = new FormData();
      formData.append("files", selectedFile);
      const file = await uploadFile(formData);

      await sendMessage(file[0].url, file[0].type);
      setSelectedFile(null);
      setPreview(null);
      return;
    }
    if (!message) {
      return;
    }

    await sendMessage(message, "text");
    setMessage("");
  };

  return (
    <>
      <div className="px-4 py-3 bg-white">
        {preview && (
          <div className="relative mb-3 inline-block">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-md">
               <img className="w-full h-full object-cover" src={preview} alt="Preview" />
            </div>
            <button
              onClick={handleRemoveFile}
              className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow-md transition-colors"
            >
              <i className="fi fi-rr-cross text-[10px]"></i>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          {/* Emoji Button */}
          <div className="relative">
            <button
               type="button"
               className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200"
               onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              <i className="fi fi-rr-smile text-xl"></i>
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-4 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" />
              </div>
            )}
          </div>

          {/* Input Container */}
          <div className="flex-1 relative group">
             <input
                type="text"
                placeholder="Type a message..."
                className="w-full py-2.5 px-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
             />
             
             {/* Upload File Inside Input Container */}
             <label className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer transition-all duration-200">
                <i className="fi fi-rr-clip text-lg"></i>
                <input
                  id="FileInput"
                  onChange={handleFileChange}
                  className="hidden"
                  type="file"
                />
             </label>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm ${
                (message.trim() || selectedFile) 
                ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95" 
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
            disabled={!message.trim() && !selectedFile}
          >
            <i className="fi fi-rs-paper-plane text-lg ml-0.5"></i>
          </button>
        </form>
      </div>
    </>
  );
};

export default MessageInput;