import React from "react";
import SearchInput from "./SearchInput";
import Coversations from "./Coversations";

const Sidebar = () => {
  return (
    <div className="flex flex-col h-full bg-white overflow-x-hidden">
      <div className="px-6 py-6 border-b border-slate-100/80">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Messages</h2>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            <i className="fi fi-rr-edit text-sm"></i>
          </button>
        </div>
        <SearchInput />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        <Coversations />
      </div>
    </div>
  );
};

export default Sidebar;
