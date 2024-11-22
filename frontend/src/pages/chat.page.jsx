import React, { useContext } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import MessageContainer from "../components/messages/MessageContainer";
import AnimationWrapper from "../common/page-animation";

const ChatUI = () => {
  return (
    <AnimationWrapper>
      <section className="gap-2 flex flex-col sm:flex-row h-full sm:h-screen rounded-lg overflow-hidden bg-gray-100 p-4 shadow-lg bg-white">
        {/* Sidebar */}
        <div className="sm:w-[300px] flex-none bg-white rounded-lg shadow-md border border-gray-300 h-full sm:h-auto mb-4 sm:mb-0">
          <Sidebar />
        </div>

        {/* Message Container */}
        <div className="gap-2 flex-1 bg-white rounded-lg border border-gray-300 shadow-md p-4 flex flex-col h-full sm:h-auto">
          <MessageContainer />
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default ChatUI;
