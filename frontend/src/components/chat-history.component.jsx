import React from "react";
import ReactMarkdown from "react-markdown";

const ChatHistory = ({ chatHistory }) => {
  return (
    <>
      {chatHistory.length === 0 ? (
        <div className="flex justify-items-center justify-center py-4 text-gray-500">
          Ready to chat with someone
        </div>
      ) : (
        chatHistory.map((message, index) => (
          <div
            key={index}
            className={`flex items-start py-2 px-4 rounded-lg my-2 ${
              message.type === "user"
                ? "bg-gray-100 text-gray-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {message.type === "user" ? (
              <span className="mr-2 font-bold text-gray-600">You:</span>
            ) : (
              <span className="mr-2 font-bold text-blue-600">Bot:</span>
            )}

            <div>
              <ReactMarkdown>{message.message}</ReactMarkdown>
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default ChatHistory;
