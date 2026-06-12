import { useState, useRef, useEffect } from "react";
import ChatHistory from "./chat-history.component";
import Loading from "./loading.component";
import { GoogleGenerativeAI } from "@google/generative-ai";
import chatBot from "../imgs/chatbot.png"; // Assuming this is an avatar/icon image

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Create a ref for the chat container to automatically scroll to bottom
  const chatEndRef = useRef(null);

  // Refs to manage typewriter effect for smooth streaming
  const fullTextRef = useRef("");
  const displayedTextRef = useRef("");
  const typewriterIntervalRef = useRef(null);
  const isStreamingRef = useRef(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  // Initialize Gemini API
  // IMPORTANT: It's best practice to put API keys in .env
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const startTypewriter = () => {
    if (typewriterIntervalRef.current) return;

    typewriterIntervalRef.current = setInterval(() => {
      const fullText = fullTextRef.current;
      const displayedText = displayedTextRef.current;

      if (displayedText.length < fullText.length) {
        // Calculate adaptive characters to print at once to catch up if lagging
        const lag = fullText.length - displayedText.length;
        const charsToAdd = lag > 40 ? 4 : lag > 15 ? 2 : 1;
        
        const nextText = fullText.slice(0, displayedText.length + charsToAdd);
        displayedTextRef.current = nextText;

        setChatHistory((prevHistory) => {
          const updatedHistory = [...prevHistory];
          if (updatedHistory.length > 0 && updatedHistory[updatedHistory.length - 1].type === "bot") {
            updatedHistory[updatedHistory.length - 1] = {
              ...updatedHistory[updatedHistory.length - 1],
              message: nextText,
            };
          }
          return updatedHistory;
        });
      } else if (!isStreamingRef.current) {
        // Stream has completed and we caught up
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
        setIsGenerating(false);
      }
    }, 15); // Print a character every 15ms
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (userInput.trim() === "") return;

    // Save input and immediately clear the input box & show as loading
    const currentInput = userInput;
    setUserInput("");
    setIsLoading(true);
    setIsGenerating(true);
    isStreamingRef.current = true;

    const newChatHistory = [
      ...chatHistory,
      { type: "user", message: currentInput },
    ];

    setChatHistory(newChatHistory);

    // Reset typewriter refs
    fullTextRef.current = "";
    displayedTextRef.current = "";
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }

    try {
      // Call Gemini API to get a response stream
      const result = await model.generateContentStream(currentInput);

      // Add a placeholder message for the bot to show the stream starts
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { type: "bot", message: "" }
      ]);
      
      // Stop showing the loading spinner, as we're starting the stream
      setIsLoading(false);

      // Start typewriter loop
      startTypewriter();

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullTextRef.current += chunkText;
        startTypewriter();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Clean up typewriter interval
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
      setIsGenerating(false);

      setChatHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        const lastMsgIndex = updatedHistory.length - 1;
        if (lastMsgIndex >= 0 && updatedHistory[lastMsgIndex].type === "bot") {
          updatedHistory[lastMsgIndex] = {
            type: "bot",
            message: "Xin lỗi, đã có lỗi xảy ra. Hãy thử lại sau nhé.",
          };
          return updatedHistory;
        } else {
          return [
            ...updatedHistory,
            {
              type: "bot",
              message: "Xin lỗi, đã có lỗi xảy ra. Hãy thử lại sau nhé.",
            },
          ];
        }
      });
    } finally {
      setIsLoading(false);
      isStreamingRef.current = false;
    }
  };

  // Function to clear the chat history
  const clearChat = () => {
    if (window.confirm("Bạn có chắc muốn xóa lịch sử trò chuyện?")) {
      setChatHistory([]);
    }
  };

  // Cleanup typewriter interval on unmount
  useEffect(() => {
    return () => {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
      }
    };
  }, []);

  // Auto-scroll logic (uses smooth scroll on open/toggle/load, but auto/instant scroll during streaming to avoid lag)
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: isGenerating ? "auto" : "smooth" });
    }
  }, [chatHistory, isLoading, isOpen, isGenerating]);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* ── Chat Window ── */}
      <div
        className={`absolute bottom-16 right-0 w-[calc(100vw-3rem)] sm:w-[380px] h-[550px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-grey/50 transition-all duration-300 origin-bottom-right ${isOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple to-emerald-500 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center p-1.5 backdrop-blur-sm">
              <img
                src={chatBot}
                alt="EduBot"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-semibold text-[11px] leading-tight">
                Trợ lý AI
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs text-white/80">Trực tuyến</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {chatHistory.length > 0 && (
              <button
                onClick={clearChat}
                disabled={isGenerating}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors tooltip disabled:opacity-50 disabled:cursor-not-allowed"
                title="Xóa rác"
              >
                <i className="fi fi-rr-trash text-sm"></i>
              </button>
            )}
            <button
              onClick={toggleChat}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <i className="fi fi-rr-cross-small text-xl"></i>
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-grey/10 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-dark-grey opacity-70 px-4">
              <i className="fi fi-rr-messages text-4xl mb-3"></i>
              <p className="text-sm">
                Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện!
              </p>
            </div>
          ) : (
            <ChatHistory chatHistory={chatHistory} isGenerating={isGenerating} />
          )}

          <Loading isLoading={isLoading} />
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-grey/50 shrink-0">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              className="w-full bg-grey/30 pt-3 pb-3 pl-4 pr-12 rounded-full focus:outline-none focus:bg-grey/50 focus:ring-1 focus:ring-purple/50 transition-all text-sm"
              value={userInput}
              onChange={handleUserInput}
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={isGenerating || !userInput.trim()}
              className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-full bg-purple text-white hover:bg-purple/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fi fi-rr-paper-plane text-sm mt-1 mr-0.5"></i>
            </button>
          </form>
        </div>
      </div>

      {/* ── Floating Action Button (FAB) ── */}
      <button
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 ${isOpen ? "bg-white text-black border border-grey rotate-90" : "bg-gradient-to-r from-purple to-emerald-500 text-white"}`}
      >
        {isOpen ? (
          <i className="fi fi-rr-cross text-xl"></i>
        ) : (
          <i className="fi fi-rr-comment-alt text-2xl mt-1"></i>
        )}
      </button>
    </div>
  );
};

export default SupportChat;
