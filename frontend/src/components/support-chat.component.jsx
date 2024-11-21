import React, { useState } from "react";
import ChatHistory from "./chat-history.component";
import Loading from "./loading.component";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  DeleteOutlined,
  DownOutlined,
  OpenAIOutlined,
  SendOutlined,
} from "@ant-design/icons";
import chatBot from "../imgs/chatbot.png";

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI("AIzaSyAIl3GiNXcIyDY1ujeVRgm_a9mZrZWbnnQ");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    setIsLoading(true);
    try {
      // Call Gemini API to get a response
      const result = await model.generateContent(userInput);
      const response = await result.response;
      console.log(response);
      // Add Gemini's response to the chat history
      setChatHistory([
        ...chatHistory,
        { type: "user", message: userInput },
        { type: "bot", message: response.text() },
      ]);
    } catch {
      console.error("Error sending message");
    } finally {
      setUserInput("");
      setIsLoading(false);
    }
  };

  // Function to clear the chat history
  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <div className="fixed bottom-4 lg:right-4 right-2 z-50 font-sans ">
      {/* Nút mở cửa sổ chat */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-full shadow-md hover:from-blue-500 hover:to-green-500 focus:outline-none transition-all duration-300"

        >
          <img src={chatBot} alt="chat" className="w-9 h-9" />
        </button>
      )}
      {/* Hộp thoại chat */}
      {isOpen && (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full lg:w-[400px] h-[500px] flex flex-col justify-between relative border border-gray-300">

          {/* Nút đóng cửa sổ chat */}
          <button
            onClick={toggleChat}
            className="absolute top-2 right-2 bg-emerald-500 p-2 rounded-full shadow-md hover:bg-emerald-800 focus:outline-none transition-all duration-300"
          >
            <DownOutlined className="text-white text-lg" />
          </button>

          <div className="flex-grow overflow-y-auto mb-4 p-3">
            <ChatHistory chatHistory={chatHistory} />
            <Loading isLoading={isLoading} />
          </div>

          {/* Phần nhập tin nhắn */}
          <div className="flex items-center space-x-3 mt-3">
            <button
              className="flex-shrink-0 px-4 py-2 rounded-full bg-rose-500 text-white hover:bg-rose-600 focus:outline-none transition-all duration-300 shadow-md"
              onClick={clearChat}
            >
              <DeleteOutlined />
            </button>
            <input
              type="text"
              className="flex-grow px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300"
              placeholder="Type your message..."
              value={userInput}
              onChange={handleUserInput}
            />
            <button
              className="flex-shrink-0 px-4 py-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-800 focus:outline-none transition-all duration-300 shadow-md"
              onClick={sendMessage}
              disabled={isLoading}
            >
              <SendOutlined />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChat;
