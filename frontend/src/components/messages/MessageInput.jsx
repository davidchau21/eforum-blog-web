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
      <form className="px-4 my-3" onSubmit={handleSubmit}>
        {preview && (
          <div className="avatar">
            <button
              onClick={handleRemoveFile}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
            <div className="w-28 rounded">
              <img className="w-28" src={preview} alt="Preview" />
            </div>
          </div>
        )}

        <div className="flex items-center relative">
          <button
            type="button"
            className="bg-blue-500 text-white rounded-full p-2"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <MdOutlineEmojiEmotions />
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            className="w-full py-2 px-3 border border-gray-300 rounded-full focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <label className="btn bg-blue-500 text-white rounded-full p-2 ml-2">
            <MdOutlineCloudUpload />
            <input
              id="FileInput"
              onChange={handleFileChange}
              className="hidden"
              type="file"
            />
          </label>

          <button
            type="submit"
            className="bg-blue-500 text-white rounded-full p-2 ml-2"
          >
            <BsSend />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 left-0 z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </form>
    </>
  );
};

export default MessageInput;
