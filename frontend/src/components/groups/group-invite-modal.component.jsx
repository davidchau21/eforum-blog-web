import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { inviteMember } from "../../services/group.service";

/* eslint-disable react/prop-types */
export const GroupInviteModal = ({
  isOpen,
  onClose,
  groupId,
  token,
  theme,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [invitingIds, setInvitingIds] = useState({}); // Tracking which IDs are currently inviting

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
          setSearchResults(data.users || []);
        } catch (err) {
          console.error("Lỗi khi tìm kiếm người dùng:", err);
        } finally {
          setIsSearching(false);
        }
      },
      searchTerm.trim() ? 400 : 0,
    );

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, token, isOpen]);

  // Reset local state on close
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      setInvitingIds({});
    }
  }, [isOpen]);

  const handleInviteUser = async (userId) => {
    setInvitingIds((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await inviteMember(groupId, userId, token);
      toast.success(
        res.message || "Đã mời thành viên tham gia nhóm thành công!",
      );
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi mời thành viên.");
    } finally {
      setInvitingIds((prev) => ({ ...prev, [userId]: false }));
    }
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
            className={`relative w-full max-w-md p-6 rounded-[28px] border ${
              theme === "light"
                ? "bg-white border-slate-200"
                : "bg-[#18181b] border-white/5 text-white"
            } shadow-2xl z-10 overflow-hidden font-jakarta`}
          >
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center mb-5 relative z-10">
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <i className="fi fi-rr-user-add text-indigo-500"></i>
                Mời thành viên mới
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                Nhập tên hoặc username của người bạn muốn mời. Bất kỳ thành viên
                nào cũng có quyền mời thành viên mới tham gia vào học tập cùng
                nhau.
              </p>

              {/* Search Box */}
              <div className="relative">
                <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên, username..."
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-indigo-500 transition-all text-xs text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Search Results */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 min-h-[100px] flex flex-col justify-start">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors border border-transparent dark:hover:border-white/5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={user.personal_info?.profile_img}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover bg-slate-200 dark:bg-zinc-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none mb-1">
                            {user.personal_info?.fullname}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate leading-none">
                            @{user.personal_info?.username}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInviteUser(user._id)}
                        disabled={invitingIds[user._id]}
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/40 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-indigo-600/10 active:scale-95 shrink-0"
                      >
                        {invitingIds[user._id] ? "Đang mời..." : "Mời"}
                      </button>
                    </div>
                  ))
                ) : searchTerm.trim() ? (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                    Không tìm thấy người dùng phù hợp.
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                    Chưa có bạn bè hay người theo dõi. Hãy nhập từ khóa để tìm
                    kiếm.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
