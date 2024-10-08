import React from "react";
import SearchInput from "./SearchInput";
import Coversations from "./Coversations";

const Sidebar = () => {
  return (
    <div className="border-r border-slate-500 p-4 flex flex-col h-full"> {/* Ensuring full height */}
    <SearchInput />
    <div className="divider px-3"></div>

    <div className="flex-1 overflow-y-auto"> {/* Makes only the conversations scrollable */}
      <Coversations />
    </div>
  </div>
  );
};

export default Sidebar;
