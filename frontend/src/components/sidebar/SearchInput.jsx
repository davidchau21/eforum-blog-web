import { useState } from "react";
import useConversation from "../../zustand/useConversation.jsx";
import useGetConversations from "../../hook/useGetConversations";
import toast from "react-hot-toast";

const SearchInput = ({ closeSidebar }) => {
  const [search, setSearch] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);
  const { setSelectedConversation } = useConversation();
  const { conversations } = useGetConversations();

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);
    if (query.trim()) {
      const results = conversations.filter(
        (c) =>
          c.personal_info.username
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          c.personal_info.fullname.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredConversations(results);
    } else {
      setFilteredConversations([]);
    }
  };

  const handleResultClick = (conversation) => {
    setSelectedConversation(conversation);
    setSearch("");
    setFilteredConversations([]);
    if (closeSidebar) closeSidebar();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;
    const conversation = conversations.find((c) =>
      c.personal_info.username.toLowerCase().includes(search.toLowerCase()),
    );
    if (conversation) {
      handleResultClick(conversation);
    } else {
      toast.error("No user found");
    }
  };

  return (
    <form className="relative" onSubmit={handleSubmit}>
      <div className="relative">
        <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-grey text-[13px] pointer-events-none"></i>
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full bg-grey border border-grey rounded-xl py-2.5 pl-10 pr-4 text-[12px] text-black placeholder:text-dark-grey/50 focus:outline-none focus:bg-white focus:border-violet-400/50 focus:shadow-lg focus:shadow-violet-400/10 transition-all duration-200"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {filteredConversations.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-grey rounded-xl shadow-xl shadow-black/10 z-50 overflow-hidden">
          {filteredConversations.slice(0, 5).map((conversation) => (
            <button
              key={conversation._id}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-grey transition-colors text-left group"
              onClick={() => handleResultClick(conversation)}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={conversation.personal_info.profile_img}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-grey group-hover:ring-violet-400/30 transition-all"
                  alt={conversation.personal_info.fullname}
                />
              </div>
              <div className="overflow-hidden">
                <p className="text-[12px] font-semibold text-black truncate">
                  {conversation.personal_info.fullname}
                </p>
                <p className="text-[11px] text-dark-grey truncate">
                  @{conversation.personal_info.username}
                </p>
              </div>
              <i className="fi fi-rr-arrow-small-right text-dark-grey ml-auto group-hover:text-violet-500 transition-colors text-[14px]"></i>
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchInput;
