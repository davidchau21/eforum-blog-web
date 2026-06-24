import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImage } from "../../common/aws";
import { toast } from "react-hot-toast";
import axios from "axios";

/* eslint-disable react/prop-types */
export const CreateGroupModal = ({
  isOpen,
  onClose,
  groupForm,
  setGroupForm,
  handleCreateGroup,
  theme,
  token,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Search users dynamically
  useEffect(() => {
    if (!isOpen) return;

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const { data } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/users/search-users",
          { query: searchTerm, forGroupInvite: true },
          config
        );
        // Exclude already selected users
        const filtered = (data.users || []).filter(
          u => !selectedUsers.some(su => su._id === u._id)
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error("Lỗi khi tìm kiếm người dùng:", err);
      } finally {
        setIsSearching(false);
      }
    }, searchTerm.trim() ? 450 : 0);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedUsers, token, isOpen]);

  // Reset local state on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers([]);
      setSearchTerm("");
      setSearchResults([]);
      setIsInputFocused(false);
    }
  }, [isOpen]);

  const handleSelectUser = (user) => {
    const updatedSelected = [...selectedUsers, user];
    setSelectedUsers(updatedSelected);
    setSearchTerm("");
    setSearchResults([]);
    setGroupForm({
      ...groupForm,
      invitedUserIds: updatedSelected.map(u => u._id)
    });
  };

  const handleRemoveUser = (userId) => {
    const updatedSelected = selectedUsers.filter(u => u._id !== userId);
    setSelectedUsers(updatedSelected);
    setGroupForm({
      ...groupForm,
      invitedUserIds: updatedSelected.map(u => u._id)
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Content Panel */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative w-full max-w-lg p-8 rounded-[32px] border ${
              theme === "light"
                ? "bg-white border-slate-200"
                : "bg-[#18181b] border-white/5 text-white"
            } shadow-2xl z-10 overflow-hidden font-jakarta`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black tracking-tight">
                Tạo nhóm học tập
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            <form
              onSubmit={handleCreateGroup}
              className="space-y-4 font-inter text-sm"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tên nhóm *
                </label>
                <input
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={(e) =>
                    setGroupForm({ ...groupForm, name: e.target.value })
                  }
                  placeholder="Nhập tên nhóm học tập..."
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Mô tả nhóm
                </label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) =>
                    setGroupForm({
                      ...groupForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Viết một đoạn ngắn giới thiệu về nhóm..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-all resize-none text-slate-700 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Ảnh đại diện (Avatar)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-white/5 shrink-0 flex items-center justify-center">
                      {groupForm.avatar ? (
                        <img
                          src={groupForm.avatar}
                          className="w-full h-full object-cover"
                          alt="avatar"
                        />
                      ) : (
                        <i className="fi fi-rr-picture text-slate-400"></i>
                      )}
                    </div>
                    <label className="flex-grow cursor-pointer">
                      <span className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-xs font-bold text-slate-600 dark:text-slate-350 text-center">
                        <i className="fi fi-rr-upload text-sm"></i>
                        Tải ảnh lên
                      </span>
                      <input
                        type="file"
                        accept=".png, .jpg, .jpeg"
                        hidden
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const loadingToast = toast.loading(
                            "Đang tải ảnh đại diện lên..."
                          );
                          try {
                            const url = await uploadImage(file);
                            setGroupForm((prev) => ({
                              ...prev,
                              avatar: url,
                            }));
                            toast.success("Tải ảnh đại diện thành công!");
                          } catch (err) {
                            toast.error("Không thể tải ảnh đại diện.");
                          } finally {
                            toast.dismiss(loadingToast);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Ảnh bìa (Banner)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-white/5 shrink-0 flex items-center justify-center">
                      {groupForm.banner ? (
                        <img
                          src={groupForm.banner}
                          className="w-full h-full object-cover"
                          alt="banner"
                        />
                      ) : (
                        <i className="fi fi-rr-picture text-slate-400"></i>
                      )}
                    </div>
                    <label className="flex-grow cursor-pointer">
                      <span className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-xs font-bold text-slate-600 dark:text-slate-350 text-center">
                        <i className="fi fi-rr-upload text-sm"></i>
                        Tải ảnh lên
                      </span>
                      <input
                        type="file"
                        accept=".png, .jpg, .jpeg"
                        hidden
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const loadingToast = toast.loading(
                            "Đang tải ảnh bìa lên..."
                          );
                          try {
                            const url = await uploadImage(file);
                            setGroupForm((prev) => ({
                              ...prev,
                              banner: url,
                            }));
                            toast.success("Tải ảnh bìa thành công!");
                          } catch (err) {
                            toast.error("Không thể tải ảnh bìa.");
                          } finally {
                            toast.dismiss(loadingToast);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/5">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white font-jakarta">
                    Nhóm riêng tư
                  </p>
                  <p className="text-xs text-slate-450">
                    Yêu cầu người dùng phải được duyệt mới có thể gia nhập và
                    xem bài.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupForm.isPrivate}
                    onChange={(e) =>
                      setGroupForm({
                        ...groupForm,
                        isPrivate: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Thêm thành viên vào nhóm
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                    placeholder="Tìm kiếm theo tên hoặc username..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-all text-xs text-slate-700 dark:text-slate-200"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {isSearching ? (
                      <div className="w-4 h-4 border-2 border-slate-350 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <i className="fi fi-rr-search text-xs"></i>
                    )}
                  </div>
                </div>

                {/* Search Results Dropdown */}
                {isInputFocused && searchResults.length > 0 && (
                  <div className="absolute z-20 mt-1 max-h-48 w-[calc(100%-4rem)] overflow-y-auto bg-white dark:bg-[#18181b] border border-slate-200/60 dark:border-white/10 rounded-xl shadow-xl py-2 divide-y divide-slate-100 dark:divide-white/5">
                    {searchResults.map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-all"
                      >
                        <img
                          src={user.personal_info.profile_img}
                          className="w-7 h-7 rounded-full bg-slate-100 object-cover"
                          alt=""
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {user.personal_info.fullname}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            @{user.personal_info.username}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Users list */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 max-h-24 overflow-y-auto">
                    {selectedUsers.map((user) => (
                      <span
                        key={user._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                      >
                        <img
                          src={user.personal_info.profile_img}
                          className="w-4 h-4 rounded-full object-cover"
                          alt=""
                        />
                        <span>{user.personal_info.fullname}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(user._id)}
                          className="text-indigo-500 hover:text-rose-500 transition-all ml-0.5 shrink-0"
                        >
                          <i className="fi fi-rr-cross-small text-[10px] block mt-0.5"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-3 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 font-bold transition-all text-xs font-jakarta"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-xs font-jakarta shadow-lg shadow-indigo-500/25"
                >
                  Xác nhận tạo
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
