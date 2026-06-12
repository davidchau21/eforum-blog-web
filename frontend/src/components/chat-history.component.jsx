import ReactMarkdown from "react-markdown";
import PropTypes from 'prop-types';
import chatBot from "../imgs/chatbot.png"; // We can reuse the chatbot image for bot avatar

const ChatHistory = ({ chatHistory, isGenerating }) => {
  return (
    <div className="flex flex-col space-y-4 font-sans">
      <style>{`
        @keyframes typing-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .typing-cursor p:last-child::after,
        .typing-cursor li:last-child::after,
        .typing-cursor h1:last-child::after,
        .typing-cursor h2:last-child::after,
        .typing-cursor h3:last-child::after,
        .typing-cursor h4:last-child::after,
        .typing-cursor h5:last-child::after,
        .typing-cursor h6:last-child::after,
        .typing-cursor pre:last-child::after,
        .typing-cursor blockquote:last-child::after,
        .typing-cursor:empty::after {
          content: "▋";
          display: inline-block;
          color: #8b5cf6;
          animation: typing-blink 1s step-start infinite;
          margin-left: 4px;
          vertical-align: baseline;
        }
      `}</style>
      {chatHistory.map((message, index) => {
        const isUser = message.type === "user";
        const isLastMessage = index === chatHistory.length - 1;
        const showCursor = isLastMessage && !isUser && isGenerating;
        
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
              <div className={`prose prose-sm max-w-none break-words ${isUser ? "prose-invert" : ""} ${showCursor ? "typing-cursor" : ""}`}>
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
  isGenerating: PropTypes.bool,
};

export default ChatHistory;
