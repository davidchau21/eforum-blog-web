import { useState } from "react";

import Sidebar from "../components/sidebar/Sidebar";
import MessageContainer from "../components/messages/MessageContainer";
import AnimationWrapper from "../common/page-animation";

const ChatUI = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AnimationWrapper>
      <section className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-white relative">
        {/* Sidebar Container */}
        <div
          className={`fixed md:static left-0 top-0 h-full md:h-auto w-[320px] bg-white border-r border-grey z-30 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar />
        </div>

        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-grey sticky top-0 z-20">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-grey text-black active:scale-95 transition-all"
            onClick={toggleSidebar}
          >
            <i
              className={`fi ${isSidebarOpen ? "fi-rr-cross" : "fi-rr-menu-burger"} text-[16px]`}
            ></i>
          </button>
          <div className="text-[18px] font-bold text-black">Messages</div>
          <div className="w-10"></div>
        </div>

        {/* Overlay when sidebar is open (Mobile Only) */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-20 transition-opacity"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Message Container */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <MessageContainer />
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default ChatUI;
