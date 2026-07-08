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
          className={`fixed md:static left-0 top-0 h-full md:h-auto w-[300px] bg-white border-r border-grey z-30 transform transition-all duration-300 ease-in-out ${
            isSidebarOpen
              ? "translate-x-0 shadow-2xl shadow-black/20"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
        </div>

        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-grey sticky top-0 z-20">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-grey text-black hover:opacity-80 active:scale-95 transition-all duration-200"
            onClick={toggleSidebar}
          >
            <i
              className={`fi ${isSidebarOpen ? "fi-rr-cross" : "fi-rr-menu-burger"} text-[14px]`}
            ></i>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <i className="fi fi-rr-messages text-[10px] text-white"></i>
            </div>
            <span className="text-[15px] font-bold text-black">Messages</span>
          </div>
          <div className="w-9"></div>
        </div>

        {/* Overlay when sidebar is open (Mobile Only) */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-20 transition-opacity"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Message Container */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
          <MessageContainer />
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default ChatUI;
