import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getGroupBlogs } from "../../services/group.service";
import useGetConversations from "../../hook/useGetConversations";
import useConversation from "../../zustand/useConversation";

/* eslint-disable react/prop-types */
export const GroupMemberModal = ({
  isOpen,
  onClose,
  member,
  groupId,
  token,
  theme,
}) => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);

  const { conversations } = useGetConversations();
  const { setSelectedConversation } = useConversation();

  const user = member?.user;
  const isSelf = user?.personal_info?.username === localStorage.getItem("username");

  // Fetch blogs when selected member changes
  useEffect(() => {
    if (!isOpen || !groupId || !user?._id) return;

    const fetchMemberBlogs = async () => {
      setIsLoadingBlogs(true);
      try {
        const data = await getGroupBlogs(groupId, token, user._id, 100);
        setBlogs(data.list || []);
      } catch (err) {
        console.error("Lỗi khi tải bài viết của thành viên:", err);
      } finally {
        setIsLoadingBlogs(false);
      }
    };

    fetchMemberBlogs();
  }, [isOpen, groupId, user?._id, token]);

  if (!isOpen || !member || !user) return null;

  const handleStartChat = () => {
    if (!token) {
      return navigate("/signin");
    }
    const preloadedConv = (conversations || []).find(
      (c) => c._id === user._id
    );
    setSelectedConversation(preloadedConv || user);
    onClose();
    navigate("/chat");
  };

  const getRoleDetails = (role) => {
    switch (role) {
      case "OWNER":
        return {
          label: "Trưởng nhóm",
          icon: "fi-sr-crown",
          badgeStyle:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
          ringStyle: "ring-4 ring-amber-500/20 border-amber-400",
        };
      case "DEPUTY":
        return {
          label: "Phó nhóm",
          icon: "fi-sr-star",
          badgeStyle:
            "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
          ringStyle: "ring-4 ring-indigo-500/20 border-indigo-400",
        };
      case "MODERATOR":
        return {
          label: "Kiểm duyệt",
          icon: "fi-sr-shield",
          badgeStyle:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
          ringStyle: "ring-4 ring-emerald-500/20 border-emerald-400",
        };
      default:
        return {
          label: "Thành viên",
          icon: "fi-rr-user",
          badgeStyle:
            "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5",
          ringStyle: "ring-4 ring-slate-100 dark:ring-zinc-800 border-slate-200 dark:border-zinc-800",
        };
    }
  };

  const roleInfo = getRoleDetails(member.role);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container Panel */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative w-full max-w-4xl rounded-[32px] border ${
            theme === "light"
              ? "bg-white border-slate-200"
              : "bg-[#111113]/90 border-white/5 text-white"
          } shadow-2xl z-10 overflow-hidden font-inter flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]`}
        >
          {/* Decorative mesh glows */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer z-20"
          >
            <i className="fi fi-rr-cross-small text-lg"></i>
          </button>

          {/* LEFT COLUMN: Profile info & stats */}
          <div className="w-full md:w-5/12 p-6 md:p-8 flex flex-col items-center md:items-stretch text-center md:text-left border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/[0.15] dark:bg-white/[0.005] justify-between">
            <div className="space-y-5 w-full">
              {/* Avatar Frame */}
              <div
                className={`w-20 h-20 md:w-24 md:h-24 rounded-[24px] border-2 ${roleInfo.ringStyle} overflow-hidden bg-slate-100 dark:bg-zinc-800 mx-auto md:mx-0 shrink-0`}
              >
                <img
                  src={user.personal_info?.profile_img}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>

              {/* Name Details */}
              <div className="space-y-1">
                <h3 className="text-md font-black text-slate-900 dark:text-white font-jakarta leading-tight truncate">
                  {user.personal_info?.fullname}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-none truncate">
                  @{user.personal_info?.username}
                </p>
                <div className="pt-1 flex justify-center md:justify-start">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${roleInfo.badgeStyle} leading-none`}
                  >
                    <i className={`fi ${roleInfo.icon} text-[8px]`}></i>
                    {roleInfo.label}
                  </span>
                </div>
              </div>

              {/* Bio Summary */}
              <div className="space-y-1 w-full text-left">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block text-center md:text-left">
                  Tiểu sử
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed font-medium bg-slate-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5 italic max-h-24 overflow-y-auto scrollbar-thin">
                  {user.personal_info?.bio || "Thành viên này chưa cập nhật tiểu sử."}
                </p>
              </div>

              {/* Stats block */}
              <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-white/5 py-4 text-center font-jakarta">
                <div>
                  <span className="text-sm font-black text-slate-800 dark:text-white">
                    {user.account_info?.total_followers || 0}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                    Theo dõi
                  </span>
                </div>
                <div>
                  <span className="text-sm font-black text-slate-800 dark:text-white">
                    {user.account_info?.total_following || 0}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                    Đang theo dõi
                  </span>
                </div>
              </div>
            </div>

            {/* Actions (Stuck at the bottom on desktop) */}
            <div className="grid grid-cols-2 gap-3 w-full mt-6 shrink-0">
              <Link
                to={`/user/${user.personal_info?.username}`}
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center gap-1 font-jakarta"
              >
                <i className="fi fi-rr-user text-xs"></i>
                Cá nhân
              </Link>
              {!isSelf ? (
                <button
                  type="button"
                  onClick={handleStartChat}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5 cursor-pointer font-jakarta"
                >
                  <i className="fi fi-rr-paper-plane text-xs"></i>
                  Nhắn tin
                </button>
              ) : (
                <div className="py-2.5 px-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center font-jakarta">
                  Bạn
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Group activity / blogs */}
          <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col min-h-0 relative z-10">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 flex items-center gap-2 mb-4 font-jakarta">
              <span>Hoạt động đóng góp trong nhóm</span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              {!isLoadingBlogs && (
                <span className="text-[10px] font-bold text-slate-400 normal-case">
                  ({blogs.length} bài viết)
                </span>
              )}
            </h4>

            {/* List container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[220px]">
              {isLoadingBlogs ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : blogs.length > 0 ? (
                blogs.map((blog) => (
                  <div
                    key={blog.blog_id}
                    onClick={() => {
                      onClose();
                      navigate(`/blog/${blog.blog_id}`);
                    }}
                    className={`p-4 rounded-2xl border ${
                      theme === "light"
                        ? "bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 hover:border-slate-350"
                        : "bg-white/[0.01] hover:bg-white/[0.03] border-white/5 hover:border-white/10"
                    } shadow-sm transition-all duration-200 cursor-pointer flex gap-4 items-center group`}
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] text-slate-450 dark:text-slate-550 leading-none font-medium">
                        <span>
                          {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="w-1 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full shrink-0 animate-pulse" />
                        <span className="flex items-center gap-0.5">
                          <i className="fi fi-rr-heart text-[10px]"></i>
                          {blog.activity?.total_likes || 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <i className="fi fi-rr-comment-alt text-[10px]"></i>
                          {blog.activity?.total_comments || 0}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold font-jakarta text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {blog.title}
                      </h5>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {blog.des || "Không có tóm tắt bài viết."}
                      </p>
                    </div>

                    {blog.banner && (
                      <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800 border border-slate-200/50 dark:border-white/5">
                        <img
                          src={blog.banner}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt=""
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center font-jakarta">
                  <i className="fi fi-rr-document text-2xl mb-1.5 text-slate-350 dark:text-zinc-700 animate-bounce"></i>
                  <p className="text-[10px] font-bold">Chưa đóng góp bài đăng</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 max-w-[200px]">
                    Thành viên này chưa chia sẻ bài đăng thảo luận nào trong nhóm này.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
