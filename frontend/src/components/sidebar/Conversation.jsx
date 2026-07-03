/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useContext, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; // Import createPortal để đưa menu ra document.body
import useConversation from "../../zustand/useConversation";
import { UserContext } from "../../App";

const Conversation = ({ conversation, lastIndex, online, closeSidebar, onRequestDelete }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { userAuth } = useContext(UserContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 }); // Lưu toạ độ hiển thị dropdown
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null); // Tham chiếu tới nút bấm ba chấm

  const isOnline = online?.includes(conversation._id);
  const isSelected = selectedConversation?._id === conversation._id;
  const isLastMessageFromMe = conversation.last_message_sender === userAuth._id;

  const formatLastMessageTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { day: "numeric", month: "short" });
  };

  // Close dropdown khi click ra ngoài hoặc khi cuộn danh sách
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Nếu click vào nút ba chấm thì bỏ qua vì handleDropdownToggle đã xử lý
      if (buttonRef.current && buttonRef.current.contains(e.target)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    const handleScroll = () => {
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      // Lắng nghe sự kiện cuộn ở bất kỳ container nào (capture phase)
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [showDropdown]);

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    if (!showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Tính toán toạ độ tuyệt đối trên màn hình
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX - 130, // Dịch sang trái 130px để khớp với chiều rộng mới (w-40)
      });
    }
    setShowDropdown((prev) => !prev);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    onRequestDelete?.(conversation); // Mở modal toàn màn hình xác nhận từ parent
  };

  return (
    <div
      className={`flex gap-3 items-center mx-2 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200 group relative overflow-visible ${
        showDropdown ? "z-20 bg-grey/50" : "z-0"
      } ${
        isSelected
          ? "bg-purple/10 border border-purple/20"
          : "hover:bg-grey border border-transparent"
      }`}
      onClick={() => {
        setSelectedConversation(conversation);
        if (closeSidebar) closeSidebar();
      }}
    >
      {/* Selected left accent bar */}
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-purple rounded-full"></div>
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-11 h-11 rounded-full overflow-hidden ring-2 transition-all duration-200 ${
            isSelected ? "ring-purple/30" : "ring-grey"
          }`}
        >
          <img
            src={conversation.personal_info.profile_img}
            className="w-full h-full object-cover"
            alt={conversation.personal_info.fullname}
          />
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60"></span>
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <div className="flex justify-between items-center">
          <h1 className="text-[13px] font-semibold truncate leading-snug text-black">
            {conversation.personal_info.fullname}
          </h1>

          {/* Dấu ba chấm & Dropdown Menu */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2 relative">
            {/* Nút ba chấm — hiện khi hover hoặc khi dropdown đang mở */}
            <button
              ref={buttonRef}
              onClick={handleDropdownToggle}
              title="Thêm"
              className={`w-6 h-6 flex items-center justify-center rounded-lg text-dark-grey hover:bg-grey hover:text-black transition-all duration-150 ${
                showDropdown ? "opacity-100 bg-grey" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <i className="fi fi-rr-menu-dots text-[11px]"></i>
            </button>

            {/* Dropdown Menu nhỏ chứa nút Xóa — Render ra body để không bao giờ bị che khuất */}
            {showDropdown && createPortal(
              <div
                ref={dropdownRef}
                style={{
                  position: "absolute",
                  top: `${coords.top}px`,
                  left: `${coords.left}px`,
                  zIndex: 9999,
                }}
                className="w-40 bg-white dark:bg-[#18181b] border border-grey rounded-xl shadow-2xl py-1 overflow-hidden animate-fadeIn"
              >
                <button
                  onClick={handleDeleteClick}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 text-red hover:bg-red/5 text-left transition-colors text-[12.5px] font-bold whitespace-nowrap"
                >
                  <i className="fi fi-rr-trash text-[12px]"></i>
                  Xóa hội thoại
                </button>
              </div>,
              document.body
            )}

            {/* Time + unread — ẩn khi hover để có không gian cho dấu ba chấm */}
            <div className={`flex items-center gap-1.5 ${showDropdown ? "hidden" : "group-hover:hidden"}`}>
              {conversation.last_message_time && (
                <span
                  className={`text-[10px] whitespace-nowrap font-medium ${
                    isSelected ? "text-purple" : "text-dark-grey"
                  }`}
                >
                  {formatLastMessageTime(conversation.last_message_time)}
                </span>
              )}
              {conversation.unread_count > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm shadow-violet-500/30">
                  {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
                </span>
              )}
            </div>
          </div>
        </div>

        <p
          className={`text-[11px] truncate mt-0.5 leading-snug ${
            isSelected ? "text-purple/70" : "text-dark-grey"
          }`}
        >
          {conversation.last_message
            ? isLastMessageFromMe
              ? `You: ${conversation.last_message}`
              : conversation.last_message
            : `@${conversation.personal_info.username}`}
        </p>
      </div>
    </div>
  );
};

export default Conversation;
