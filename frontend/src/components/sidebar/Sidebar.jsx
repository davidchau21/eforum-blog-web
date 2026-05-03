import React from "react";
import SearchInput from "./SearchInput";
import Coversations from "./Coversations";

const Sidebar = () => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-grey overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-grey flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-black">Messages</h2>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-dark-grey hover:bg-grey hover:text-black transition-all">
            <i className="fi fi-rr-edit text-[14px]"></i>
          </button>
        </div>
        <SearchInput />
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2">
        <Coversations />
      </div>
    </div>
  );
};

export default Sidebar;
