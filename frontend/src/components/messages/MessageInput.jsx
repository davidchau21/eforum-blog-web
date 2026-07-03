import { useState, useContext } from "react";
import EmojiPicker from "emoji-picker-react";
import useSendMessage from "../../hook/useSendMessage";
import fileIcon from "../../imgs/file-folder.jpg";
import { ThemeContext } from "../../App";

const MessageInput = () => {
  const { theme } = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const { loading, uploadFile, sendMessage } = useSendMessage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
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
    if (!message.trim()) {
      return;
    }
    await sendMessage(message, "text");
    setMessage("");
  };

  const canSend = message.trim() || selectedFile;

  return (
    <>
      {/* File Preview */}
      {preview && (
        <div className="relative mb-3 inline-block">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-grey bg-grey shadow-md">
            <img
              className="w-full h-full object-cover"
              src={preview}
              alt="Preview"
            />
          </div>
          <button
            onClick={handleRemoveFile}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red hover:opacity-80 text-white rounded-full flex items-center justify-center shadow-md transition-all"
          >
            <i className="fi fi-rr-cross text-[9px]"></i>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Emoji Button */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
              showEmojiPicker
                ? "bg-violet-500/10 text-violet-500"
                : "text-dark-grey hover:bg-grey hover:text-black"
            }`}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <i className="fi fi-rr-smile text-[18px]"></i>
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-3 left-0 z-50 shadow-xl rounded-2xl overflow-hidden border border-grey">
              <EmojiPicker onEmojiClick={handleEmojiClick} theme={theme} />
            </div>
          )}
        </div>

        {/* Input Container */}
        <div
          className={`flex-1 relative flex items-center transition-all duration-200 rounded-2xl border ${
            isFocused
              ? "border-violet-400/40 bg-grey shadow-md shadow-violet-400/10"
              : "border-grey bg-grey"
          }`}
        >
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 py-2.5 px-4 bg-transparent focus:outline-none text-[13px] text-black placeholder:text-dark-grey/60 min-w-0"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Upload File Button */}
          <label className="flex-shrink-0 w-8 h-8 mr-1 flex items-center justify-center rounded-xl text-dark-grey hover:bg-white hover:text-black cursor-pointer transition-all duration-200">
            <i className="fi fi-rr-clip text-[14px]"></i>
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
          disabled={!canSend || loading}
          className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-300 ${
            canSend && !loading
              ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25 hover:from-violet-600 hover:to-indigo-700 hover:scale-105 active:scale-95"
              : "bg-grey text-dark-grey cursor-not-allowed"
          }`}
        >
          {loading ? (
            <i className="fi fi-rr-spinner text-[15px] animate-spin"></i>
          ) : (
            <i className="fi fi-rs-paper-plane text-[15px] ml-0.5 mt-0.5"></i>
          )}
        </button>
      </form>
    </>
  );
};

export default MessageInput;
