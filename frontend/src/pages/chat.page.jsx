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
      <section className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50 relative">
        {/* Sidebar Container */}
        <div
          className={`fixed md:static left-0 top-0 h-full md:h-auto w-[320px] bg-white border-r border-slate-200/60 z-30 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar />
        </div>

        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-20">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 active:scale-95 transition-all"
            onClick={toggleSidebar}
          >
            <i
              className={`fi ${isSidebarOpen ? "fi-rr-cross" : "fi-rr-menu-burger"} text-xl`}
            ></i>
          </button>
          <div className="text-lg font-bold text-slate-400">Messages</div>
          <div className="w-10"></div>
        </div>

        {/* Overlay when sidebar is open (Mobile Only) */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 transition-opacity"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Message Container */}
        <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden relative">
          <MessageContainer />
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default ChatUI;
