import { useState } from "react";
import ReactMarkdown from "react-markdown";
import PropTypes from 'prop-types';
import chatBot from "../imgs/chatbot.png"; // We can reuse the chatbot image for bot avatar

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-grey/40 bg-grey/10 dark:bg-grey/20">
      {/* Code Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-grey/30 border-b border-grey/40 text-xs text-dark-grey font-mono">
        <span className="capitalize">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-purple transition-colors font-sans text-xs focus:outline-none"
        >
          {copied ? (
            <>
              <i className="fi fi-rr-check text-green-500"></i>
              <span className="text-green-500">Đã sao chép</span>
            </>
          ) : (
            <>
              <i className="fi fi-rr-copy"></i>
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>
      {/* Code Pre */}
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

CodeBlock.propTypes = {
  language: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
};

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
                <ReactMarkdown
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeText = String(children).replace(/\n$/, '');
                      
                      return match ? (
                        <CodeBlock language={match[1]} code={codeText} />
                      ) : (
                        <code className="bg-grey/30 dark:bg-grey/50 px-1.5 py-0.5 rounded font-mono text-xs text-purple font-semibold break-all" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {message.message}
                </ReactMarkdown>
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
