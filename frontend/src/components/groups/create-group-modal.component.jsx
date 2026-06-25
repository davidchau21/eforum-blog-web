import { useState, useEffect } from "react";
import groupBannerDefault from "../../imgs/group-banner-default.png";
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

    const delayDebounce = setTimeout(
      async () => {
        setIsSearching(true);
        try {
          const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
          const { data } = await axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + "/users/search-users",
            { query: searchTerm, forGroupInvite: true },
            config,
          );
          // Exclude already selected users
          const filtered = (data.users || []).filter(
            (u) => !selectedUsers.some((su) => su._id === u._id),
          );
          setSearchResults(filtered);
        } catch (err) {
          console.error("Lỗi khi tìm kiếm người dùng:", err);
        } finally {
          setIsSearching(false);
        }
      },
      searchTerm.trim() ? 450 : 0,
    );

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
      invitedUserIds: updatedSelected.map((u) => u._id),
    });
  };

  const handleRemoveUser = (userId) => {
    const updatedSelected = selectedUsers.filter((u) => u._id !== userId);
    setSelectedUsers(updatedSelected);
    setGroupForm({
      ...groupForm,
      invitedUserIds: updatedSelected.map((u) => u._id),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with premium blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-md"
          />

          {/* Premium Modal Panel */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={`relative w-full max-w-3xl p-8 md:p-10 rounded-[36px] border ${
              theme === "light"
                ? "bg-white border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                : "bg-[#0b0b0d] border-white/[0.05] text-white shadow-[0_30px_70px_rgba(0,0,0,0.45)]"
            } z-10 overflow-hidden font-jakarta`}
          >
            {/* Ambient Background Glow Bubbles */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-600/10 dark:bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100 dark:border-white/[0.05] relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full border border-indigo-500/20 text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                  Tạo Cộng Đồng Mới
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2 font-jakarta">
                  Thiết Lập Cộng Đồng
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all duration-300"
              >
                <i className="fi fi-rr-cross-small text-lg"></i>
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateGroup}
              className="space-y-6 relative z-10 font-inter text-sm"
            >
              {/* Symmetrical 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-jakarta">
                      Tên nhóm học tập <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={groupForm.name}
                      onChange={(e) =>
                        setGroupForm({ ...groupForm, name: e.target.value })
                      }
                      placeholder="Nhập tên nhóm học tập..."
                      className="w-full bg-slate-50/80 focus:bg-white dark:bg-[#131316]/85 dark:focus:bg-[#18181C] border-2 border-slate-100 dark:border-white/[0.02] focus:border-indigo-500 rounded-2xl py-3.5 px-4 outline-none text-xs font-semibold focus:shadow-[0_0_20px_rgba(99,102,241,0.08)] transition-all duration-300 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-jakarta">
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
                      placeholder="Mô tả tóm tắt nội dung và mục tiêu học tập của nhóm..."
                      rows={5}
                      className="w-full bg-slate-50/80 focus:bg-white dark:bg-[#131316]/85 dark:focus:bg-[#18181C] border-2 border-slate-100 dark:border-white/[0.02] focus:border-indigo-500 rounded-2xl py-3.5 px-4 outline-none text-xs font-semibold focus:shadow-[0_0_20px_rgba(99,102,241,0.08)] transition-all duration-300 text-slate-800 dark:text-slate-200 resize-none h-[116px]"
                    />
                  </div>

                  {/* Selecting Privacy Cards */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-jakarta">
                      Chế độ hiển thị
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Public Card */}
                      <div
                        onClick={() =>
                          setGroupForm({ ...groupForm, isPrivate: false })
                        }
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col gap-2 relative overflow-hidden group/card hover:scale-[1.02] active:scale-[0.98] ${
                          !groupForm.isPrivate
                            ? "border-indigo-600 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.08] shadow-[0_8px_30px_rgba(99,102,241,0.06)] text-slate-900 dark:text-white"
                            : "border-slate-100 dark:border-white/[0.02] bg-slate-50/50 dark:bg-[#131316]/50 hover:border-slate-300/65 dark:hover:border-white/10 text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {/* Radio Dot */}
                        <div className="absolute top-3.5 right-3.5">
                          {!groupForm.isPrivate ? (
                            <div className="w-4.5 h-4.5 rounded-full border-2 border-indigo-600 dark:border-indigo-400 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                            </div>
                          ) : (
                            <div className="w-4.5 h-4.5 rounded-full border border-slate-250 dark:border-white/10"></div>
                          )}
                        </div>

                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover/card:bg-indigo-500/10 group-hover/card:text-indigo-500 transition-all">
                          <i className="fi fi-rr-globe text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs font-black font-jakarta">
                            Công khai
                          </p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal mt-0.5">
                            Ai cũng có thể tìm thấy và tham gia.
                          </p>
                        </div>
                      </div>

                      {/* Private Card */}
                      <div
                        onClick={() =>
                          setGroupForm({ ...groupForm, isPrivate: true })
                        }
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col gap-2 relative overflow-hidden group/card hover:scale-[1.02] active:scale-[0.98] ${
                          groupForm.isPrivate
                            ? "border-indigo-600 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.08] shadow-[0_8px_30px_rgba(99,102,241,0.06)] text-slate-900 dark:text-white"
                            : "border-slate-100 dark:border-white/[0.02] bg-slate-50/50 dark:bg-[#131316]/50 hover:border-slate-300/65 dark:hover:border-white/10 text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {/* Radio Dot */}
                        <div className="absolute top-3.5 right-3.5">
                          {groupForm.isPrivate ? (
                            <div className="w-4.5 h-4.5 rounded-full border-2 border-indigo-600 dark:border-indigo-400 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                            </div>
                          ) : (
                            <div className="w-4.5 h-4.5 rounded-full border border-slate-250 dark:border-white/10"></div>
                          )}
                        </div>

                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover/card:bg-indigo-500/10 group-hover/card:text-indigo-500 transition-all">
                          <i className="fi fi-rr-lock text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs font-black font-jakarta">
                            Riêng tư
                          </p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal mt-0.5">
                            Cần có sự phê duyệt của trưởng nhóm.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Upload Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Avatar Upload Card */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-jakarta">
                        Ảnh đại diện
                      </label>
                      <label className="cursor-pointer block group/upload">
                        <div
                          className={`h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                            groupForm.avatar
                              ? "border-emerald-500 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400"
                              : "border-slate-200 dark:border-white/[0.04] bg-slate-50/50 dark:bg-[#131316]/50 hover:border-indigo-500/50 hover:bg-slate-100/30 dark:hover:bg-[#1b1b1e] text-slate-400 hover:text-indigo-500"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover/upload:scale-110 ${
                              groupForm.avatar
                                ? "bg-emerald-500/10"
                                : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover/upload:text-indigo-500 group-hover/upload:bg-indigo-500/10"
                            }`}
                          >
                            <i
                              className={`text-base ${
                                groupForm.avatar
                                  ? "fi fi-rr-check text-emerald-500"
                                  : "fi fi-rr-picture"
                              }`}
                            ></i>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-center">
                            {groupForm.avatar
                              ? "Đã chọn avatar"
                              : "Tải ảnh lên"}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept=".png, .jpg, .jpeg"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const loadingToast = toast.loading(
                              "Đang tải ảnh đại diện lên...",
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

                    {/* Banner Upload Card */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-jakarta">
                        Ảnh bìa (Banner)
                      </label>
                      <label className="cursor-pointer block group/upload">
                        <div
                          className={`h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                            groupForm.banner
                              ? "border-emerald-500 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400"
                              : "border-slate-200 dark:border-white/[0.04] bg-slate-50/50 dark:bg-[#131316]/50 hover:border-indigo-500/50 hover:bg-slate-100/30 dark:hover:bg-[#1b1b1e] text-slate-400 hover:text-indigo-500"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover/upload:scale-110 ${
                              groupForm.banner
                                ? "bg-emerald-500/10"
                                : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover/upload:text-indigo-500 group-hover/upload:bg-indigo-500/10"
                            }`}
                          >
                            <i
                              className={`text-base ${
                                groupForm.banner
                                  ? "fi fi-rr-check text-emerald-500"
                                  : "fi fi-rr-picture"
                              }`}
                            ></i>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-center">
                            {groupForm.banner
                              ? "Đã chọn banner"
                              : "Tải ảnh lên"}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept=".png, .jpg, .jpeg"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const loadingToast = toast.loading(
                              "Đang tải ảnh bìa lên...",
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

                  {/* Member Recruitment Search */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-jakarta">
                      Thành viên ban đầu
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() =>
                          setTimeout(() => setIsInputFocused(false), 200)
                        }
                        placeholder="Tìm theo tên hoặc @username..."
                        className="w-full bg-slate-50/80 focus:bg-white dark:bg-[#131316]/85 dark:focus:bg-[#18181C] border-2 border-slate-100 dark:border-white/[0.02] focus:border-indigo-500 rounded-2xl py-3.5 px-4 pl-10 outline-none text-xs font-semibold focus:shadow-[0_0_20px_rgba(99,102,241,0.08)] transition-all duration-300 text-slate-800 dark:text-slate-200"
                      />
                      <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        {isSearching ? (
                          <div className="w-4 h-4 border-2 border-slate-350 border-t-transparent rounded-full animate-spin"></div>
                        ) : null}
                      </div>

                      {/* Search Results Dropdown (Nested inside relative container for perfect width alignment) */}
                      {isInputFocused && searchResults.length > 0 && (
                        <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 w-full overflow-y-auto bg-white/95 dark:bg-[#141416]/95 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] py-2 divide-y divide-slate-100 dark:divide-white/5">
                          {searchResults.map((user) => (
                            <button
                              key={user._id}
                              type="button"
                              onClick={() => handleSelectUser(user)}
                              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-all"
                            >
                              <img
                                src={user.personal_info.profile_img}
                                className="w-7 h-7 rounded-full bg-slate-100 object-cover border border-slate-200/50 dark:border-white/5"
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
                    </div>

                    {/* Layout-Stable Selected Users Container (Displaying single-column rows) */}
                    <div className="mt-3 h-[130px] w-full rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.05] bg-slate-50/30 dark:bg-[#131316]/25 p-3 overflow-y-auto">
                      {selectedUsers.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {selectedUsers.map((user) => (
                            <div
                              key={user._id}
                              className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.03] transition-all hover:bg-slate-200/50 dark:hover:bg-white/[0.05]"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={user.personal_info.profile_img}
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200/50 dark:border-white/5 shrink-0"
                                  alt=""
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate leading-none">
                                    {user.personal_info.fullname}
                                  </p>
                                  <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-1 leading-none font-mono">
                                    @{user.personal_info.username}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(user._id)}
                                className="w-5 h-5 rounded-lg bg-slate-200/50 hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-rose-500/10 text-slate-450 hover:text-rose-500 flex items-center justify-center transition-colors duration-200 cursor-pointer shrink-0"
                              >
                                <i className="fi fi-rr-cross-small text-[10px]"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider gap-2">
                          <i className="fi fi-rr-users text-sm"></i>
                          <span>Chưa chọn thành viên</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-white/[0.05] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-250 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 font-bold transition-all text-xs font-jakarta cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all text-xs font-jakarta shadow-lg shadow-indigo-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
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
