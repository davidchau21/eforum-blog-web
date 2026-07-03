import React from "react";
import SearchInput from "./SearchInput";
import Conversations from "./Conversations";

const Sidebar = ({ closeSidebar }) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0 border-b border-grey">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <i className="fi fi-rr-messages text-[13px] text-white"></i>
            </div>
            <h2 className="text-[16px] font-bold text-black tracking-tight">Messages</h2>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-grey hover:opacity-80 text-dark-grey hover:text-black transition-all duration-200 group">
            <i className="fi fi-rr-edit text-[13px] group-hover:rotate-12 transition-transform duration-200"></i>
          </button>
        </div>
        <SearchInput closeSidebar={closeSidebar} />
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
        <Conversations closeSidebar={closeSidebar} />
      </div>
    </div>
  );
};

export default Sidebar;
