import React, { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import useConversation from "../../zustand/useConversation.jsx";
import useGetConversations from "../../hook/useGetConversations";
import toast from "react-hot-toast";

const SearchInput = () => {
  const [search, setSearch] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);
  const { setSelectedConversation } = useConversation();
  const { conversations } = useGetConversations();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;

    const conversation = conversations.find((conversation) =>
      conversation.personal_info.username.toLowerCase().includes(search.toLowerCase())
    );
    localStorage.setItem("search", search);

    if (conversation) {
      setSelectedConversation(conversation);
      setSearch("");
      setFilteredConversations([]); // Clear search results
    } else {
      toast.error("No user found with this username");
      setFilteredConversations([]); // Clear search results if no match
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);

    if (query) {
      const results = conversations.filter((conversation) =>
        conversation.personal_info.username.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredConversations(results);
    } else {
      setFilteredConversations([]); // Clear search results if input is empty
    }
  };

  const handleResultClick = (conversation) => {
    setSelectedConversation(conversation);
    setSearch(""); // Clear the search input
    setFilteredConversations([]); // Clear the search results dropdown
  };

  return (
    <form className="relative" onSubmit={handleSubmit}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered rounded-full w-full"
          value={search}
          onChange={handleSearchChange}
        />

        <button
          type="submit"
          className="btn btn-circle bg-emerald-500 text-white"
        >
          <IoSearchSharp className="w-6 h-6 outline-none" />
        </button>
      </div>

      {/* Dropdown for showing search results */}
      {filteredConversations.length > 0 && (
        <ul className="absolute w-full mt-1 bg-white border rounded-lg shadow-md z-10">
          {filteredConversations.map((conversation) => (
            <li
              key={conversation.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleResultClick(conversation)}
            >
              {conversation.personal_info.username}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};

export default SearchInput;
