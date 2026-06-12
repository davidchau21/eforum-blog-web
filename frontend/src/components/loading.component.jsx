import PropTypes from "prop-types";
import chatBot from "../imgs/chatbot.png"; // Reuse the bot avatar

const Loading = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="flex w-full justify-start items-end font-sans animate-pulse">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-1 flex-shrink-0 mr-2 mt-auto shadow-sm">
        <img
          src={chatBot}
          alt="Bot"
          className="w-full h-full object-contain filter brightness-0 invert"
        />
      </div>

      {/* Chat Bubble with Bouncing Dots */}
      <div className="bg-white text-black border border-grey/40 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[85%]">
        <div className="flex items-center space-x-1.5 py-1">
          <span
            className="w-2 h-2 bg-purple/60 rounded-full animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "0.8s" }}
          ></span>
          <span
            className="w-2 h-2 bg-purple/80 rounded-full animate-bounce"
            style={{ animationDelay: "150ms", animationDuration: "0.8s" }}
          ></span>
          <span
            className="w-2 h-2 bg-purple rounded-full animate-bounce"
            style={{ animationDelay: "300ms", animationDuration: "0.8s" }}
          ></span>
        </div>
      </div>
    </div>
  );
};

Loading.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

export default Loading;
