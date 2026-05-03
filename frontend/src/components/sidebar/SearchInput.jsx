import { useState } from "react";
import useConversation from "../../zustand/useConversation.jsx";
import useGetConversations from "../../hook/useGetConversations";
import toast from "react-hot-toast";

const SearchInput = () => {
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
        <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-grey text-[14px] pointer-events-none"></i>
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full bg-grey border border-grey rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-black placeholder:text-dark-grey/50 focus:outline-none focus:bg-white focus:border-indigo-300 transition-all duration-200"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {filteredConversations.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-grey rounded-xl shadow-lg z-50 overflow-hidden">
          {filteredConversations.slice(0, 5).map((conversation) => (
            <button
              key={conversation._id}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-grey/60 transition-colors text-left"
              onClick={() => handleResultClick(conversation)}
            >
              <img
                src={conversation.personal_info.profile_img}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                alt={conversation.personal_info.fullname}
              />
              <div className="overflow-hidden">
                <p className="text-[13px] font-semibold text-black truncate">
                  {conversation.personal_info.fullname}
                </p>
                <p className="text-[11px] text-dark-grey truncate">
                  @{conversation.personal_info.username}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchInput;
