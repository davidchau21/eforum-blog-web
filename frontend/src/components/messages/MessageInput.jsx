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
      <div className="px-4 py-3 border-t border-grey/40 bg-white">
        {preview && (
          <div className="relative mb-3 inline-block">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-purple/20 shadow-lg">
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

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Emoji Button */}
          <div className="relative">
            <button
               type="button"
               className="w-11 h-11 flex items-center justify-center rounded-2xl text-dark-grey hover:bg-grey/60 hover:text-purple transition-all duration-200"
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
                placeholder="Aa"
                className="w-full py-2.5 px-5 bg-grey/40 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-purple/30 focus:shadow-sm transition-all duration-200"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
             />
             
             {/* Upload File Inside Input Container */}
             <label className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-dark-grey hover:bg-grey/60 hover:text-purple cursor-pointer transition-all duration-200">
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
            className={`w-11 h-11 flex items-center justify-center rounded-2xl shadow-lg transition-all duration-300 ${
                (message.trim() || selectedFile) 
                ? "bg-gradient-to-br from-purple to-emerald-500 text-white shadow-purple/20 hover:scale-105 active:scale-95" 
                : "bg-grey/60 text-dark-grey/40 cursor-not-allowed"
            }`}
            disabled={!message.trim() && !selectedFile}
          >
            <i className="fi fi-rs-paper-plane text-lg"></i>
          </button>
        </form>
      </div>
    </>
  );
};

export default MessageInput;