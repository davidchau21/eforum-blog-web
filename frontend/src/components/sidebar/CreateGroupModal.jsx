import { useState } from "react";
import { createPortal } from "react-dom";
import useCreateGroup from "../../hook/useCreateGroup";
import useGetConversations from "../../hook/useGetConversations";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { conversations } = useGetConversations();

  // Lọc ra các liên hệ 1-1 có sẵn từ danh sách sidebar
  const contacts = (conversations || []).filter(
    (c) => !c.isGroup && c.personal_info,
  );

  // Tìm kiếm liên hệ trong danh sách
  const filteredContacts = contacts.filter(
    (c) =>
      c.personal_info.fullname
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      c.personal_info.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreateSuccess = () => {
    setGroupName("");
    setSelectedUsers([]);
    onClose();
  };

  const { createGroup, loading } = useCreateGroup(handleCreateSuccess);

  const handleSubmit = (e) => {
    e.preventDefault();
    createGroup(groupName, selectedUsers);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#09090b] w-full max-w-md rounded-2xl border border-grey shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 border-b border-grey flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <i className="fi fi-rr-users text-[13px] text-white"></i>
            </div>
            <h3 className="text-[16px] font-bold text-black dark:text-white">
              Tạo nhóm chat mới
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-dark-grey hover:bg-grey hover:text-black transition-all"
          >
            <i className="fi fi-rr-cross text-[10px]"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-6 flex-1 overflow-y-auto space-y-5 scrollbar-hide">
            {/* Tên nhóm */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-dark-grey uppercase tracking-wider">
                Tên nhóm chat
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Nhập tên nhóm thảo luận..."
                className="w-full px-4 py-3 rounded-xl border border-grey bg-grey/30 text-[13px] focus:outline-none focus:border-purple/35 focus:bg-white text-black transition-all placeholder:text-dark-grey/60"
                maxLength={40}
                required
              />
            </div>

            {/* Danh sách thành viên */}
            <div className="flex flex-col gap-3 min-h-0 flex-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-dark-grey uppercase tracking-wider">
                  Chọn thành viên
                </label>
                <span className="text-[11px] font-semibold text-purple bg-purple/10 px-2.5 py-0.5 rounded-full">
                  Đã chọn {selectedUsers.length}
                </span>
              </div>

              {/* Ô tìm kiếm nhanh thành viên */}
              <div className="relative flex-shrink-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm thành viên theo tên..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-grey text-[12px] bg-grey/20 focus:outline-none focus:border-purple/30 text-black placeholder:text-dark-grey/50"
                />
                <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-dark-grey"></i>
              </div>

              {/* List liên hệ cuộn */}
              <div className="flex-1 min-h-[180px] max-h-[300px] overflow-y-auto border border-grey/80 rounded-2xl p-2 bg-grey/5 flex flex-col gap-1">
                {filteredContacts.length === 0 ? (
                  <p className="text-[12px] text-dark-grey/60 text-center py-8">
                    Không tìm thấy thành viên phù hợp
                  </p>
                ) : (
                  filteredContacts.map((contact) => {
                    const isChecked = selectedUsers.includes(contact._id);
                    return (
                      <div
                        key={contact._id}
                        onClick={() => handleUserToggle(contact._id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                          isChecked
                            ? "bg-purple/5 border border-purple/15"
                            : "hover:bg-grey/50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-grey bg-grey shrink-0">
                            <img
                              src={contact.personal_info.profile_img}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[12px] font-semibold text-black truncate leading-snug">
                              {contact.personal_info.fullname}
                            </span>
                            <span className="text-[10px] text-dark-grey">
                              @{contact.personal_info.username}
                            </span>
                          </div>
                        </div>

                        {/* Custom checkbox */}
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                            isChecked
                              ? "bg-purple border-purple text-white shadow-sm shadow-purple/30"
                              : "border-dark-grey/30 bg-white"
                          }`}
                        >
                          {isChecked && (
                            <i className="fi fi-rr-check text-[10px]"></i>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-grey bg-grey/10 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-[12px] font-bold text-dark-grey hover:bg-grey transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || selectedUsers.length === 0}
              className="px-5 py-2.5 rounded-xl text-[12px] font-bold text-white bg-purple hover:opacity-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-purple/15 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <i className="fi fi-rr-spinner animate-spin"></i>
                  Đang tạo nhóm...
                </>
              ) : (
                "Tạo nhóm chat"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default CreateGroupModal;
