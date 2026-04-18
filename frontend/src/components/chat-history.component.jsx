import ReactMarkdown from "react-markdown";
import PropTypes from 'prop-types';
import chatBot from "../imgs/chatbot.png"; // We can reuse the chatbot image for bot avatar

const ChatHistory = ({ chatHistory }) => {
  return (
    <div className="flex flex-col space-y-4 font-sans">
      {chatHistory.map((message, index) => {
        const isUser = message.type === "user";
        
        return (
          <div
            key={index}
            className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
          >
            {/* Bot Avatar (only show for bot messages) */}
            {!isUser && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-1 flex-shrink-0 mr-2 mt-auto shadow-sm">
                <img src={chatBot} alt="Bot" className="w-full h-full object-contain filter brightness-0 invert" />
              </div>
            )}

            {/* Chat Bubble */}
            <div
              className={`relative max-w-[85%] px-4 py-3 text-sm shadow-sm ${
                isUser
                  ? "bg-purple text-white rounded-2xl rounded-br-sm"
                  : "bg-white text-black border border-grey/40 rounded-2xl rounded-bl-sm"
              }`}
            >
              <div className={`prose prose-sm max-w-none break-words ${isUser ? "prose-invert" : ""}`}>
                <ReactMarkdown>{message.message}</ReactMarkdown>
              </div>
            </div>

            {/* Optional User Avatar placeholder if you wanted them to match (currently hidden for clean look) */}
          </div>
        );
      })}
    </div>
  );
};

ChatHistory.propTypes = {
  chatHistory: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ChatHistory;
