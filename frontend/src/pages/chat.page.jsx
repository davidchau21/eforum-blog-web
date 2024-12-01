import React, { useState } from "react";

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
      <section className="gap-2 flex flex-col sm:flex-row h-full sm:h-screen rounded-lg overflow-hidden bg-gray-100 p-4 shadow-lg bg-white relative">
        {/* Sidebar */}
        <div
          className={`fixed sm:static top-0 left-0 h-full sm:h-auto w-[250px] sm:w-[300px] bg-white shadow-md border border-gray-300 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } sm:translate-x-0 transition-transform duration-300 ${
            isSidebarOpen ? "z-50" : "sm:z-auto"
          }`}
        >
          <Sidebar />
        </div>

        {/* Header (Menu Button + "Đoạn chat") */}
        <div className="sm:hidden flex items-center justify-between">
          {/* Sidebar Toggle Button */}
          <button
            className="w-12 transform"
            onClick={toggleSidebar}
          >
            <i className="fi fi-rr-menu-burger text-3xl text-black"></i>
          </button>

          {/* Đoạn chat */}
          <div className="transform text-2xl font-semibold text-black">Đoạn Chat</div>
        </div>

        {/* Overlay when sidebar is open (Mobile Only) */}
        {isSidebarOpen && (
          <div
            className="sm:hidden fixed inset-0 bg-black opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Message Container */}
        <div
          className="gap-2 flex-1 bg-white rounded-lg border border-gray-300 shadow-md p-4 flex flex-col h-full sm:h-auto 
            sm:max-h-full sm:overflow-visible max-h-[80vh] overflow-y-auto"
        >
          <MessageContainer />
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default ChatUI;
