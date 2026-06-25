import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GroupPrivateLock } from "./group-private-lock.component";
import useGetConversations from "../../hook/useGetConversations";
import useConversation from "../../zustand/useConversation";

/* eslint-disable react/prop-types */
export const GroupDiscussionTab = ({
  group,
  showLockScreen,
  handleToggleJoin,
  isJoined,
  settings = {},
  id,
  blogs = [],
  navigate,
  isAdminOrMod = false,
  pendingBlogs = [],
  handleApproveBlog,
  handleRejectBlog,
  onAuthorClick,
  members = [],
}) => {
  const [discussionFilter, setDiscussionFilter] = useState("published"); // published, pending
  const [hoveredBlogId, setHoveredBlogId] = useState(null);

  const { conversations } = useGetConversations();
  const { setSelectedConversation } = useConversation();

  const currentUsername = localStorage.getItem("username");

  const handleStartChat = (authorUser) => {
    const preloadedConv = (conversations || []).find(
      (c) => c._id === authorUser?._id
    );
    setSelectedConversation(preloadedConv || authorUser);
    navigate("/chat");
  };

  const getRoleDetails = (role) => {
    switch (role) {
      case "OWNER":
        return {
          label: "Trưởng nhóm",
          icon: "fi-sr-crown",
          badgeStyle:
            "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        };
      case "DEPUTY":
        return {
          label: "Phó nhóm",
          icon: "fi-sr-star",
          badgeStyle:
            "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
        };
      case "MODERATOR":
        return {
          label: "Kiểm duyệt",
          icon: "fi-sr-shield",
          badgeStyle:
            "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        };
      default:
        return {
          label: "Thành viên",
          icon: "fi-rr-user",
          badgeStyle:
            "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5",
        };
    }
  };

  if (showLockScreen) {
    return (
      <GroupPrivateLock group={group} handleToggleJoin={handleToggleJoin} />
    );
  }

  const activeBlogsList =
    discussionFilter === "published" ? blogs : pendingBlogs;

  return (
    <div className="space-y-6">
      {/* Discussion Sub-Tabs (Published vs Pending) - Only visible to Admins/Mods */}
      {isAdminOrMod && pendingBlogs.length > 0 && (
        <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit font-inter">
          <button
            onClick={() => setDiscussionFilter("published")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              discussionFilter === "published"
                ? "bg-white dark:bg-[#1e1e22] text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Đã đăng ({blogs.length})
          </button>
          <button
            onClick={() => setDiscussionFilter("pending")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              discussionFilter === "pending"
                ? "bg-white dark:bg-[#1e1e22] text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Chờ duyệt ({pendingBlogs.length})
          </button>
        </div>
      )}

      {/* Create Blog Banner */}
      {isJoined && discussionFilter === "published" && (
        <div className="bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <p className="font-black text-slate-900 dark:text-white font-jakarta flex items-center gap-2 font-inter">
              Bạn có ý kiến hay tài liệu mới?
              {settings.memberPostApprovalRequired && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                  Cần duyệt bài
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Viết bài blog học tập để chia sẻ kiến thức tới mọi người.
            </p>
          </div>
          <button
            onClick={() => navigate(`/group-editor?groupId=${id}`)}
            className="py-3 px-5 text-xs font-black uppercase tracking-wider font-jakarta bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-500/10 shrink-0 self-stretch sm:self-auto text-center"
          >
            Đăng bài mới
          </button>
        </div>
      )}

      {activeBlogsList.length > 0 ? (
        <div className="space-y-6">
          {activeBlogsList.map((blog) => (
            <div
              key={blog.blog_id}
              className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-[0_20px_50px_rgba(99,102,241,0.06)] hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all duration-300 cursor-pointer group"
              onClick={() => {
                if (discussionFilter === "published") {
                  navigate(`/blog/${blog.blog_id}`);
                }
              }}
            >
              <div className="flex-grow space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div
                    className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 relative"
                    onMouseEnter={() => setHoveredBlogId(blog.blog_id)}
                    onMouseLeave={() => setHoveredBlogId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAuthorClick) onAuthorClick(blog.author);
                    }}
                  >
                    <img
                      src={blog.author?.personal_info?.profile_img}
                      className="w-6 h-6 rounded-full border border-slate-200/60 dark:border-white/10"
                      alt=""
                    />
                    <span className="font-bold">
                      @{blog.author?.personal_info?.username}
                    </span>

                    {/* Popover Hover Card */}
                    <AnimatePresence>
                      {hoveredBlogId === blog.blog_id && blog.author && (() => {
                        const memberInfo = (members || []).find((m) => m.user?._id === blog.author?._id) || {
                          role: "MEMBER",
                          user: {
                            ...blog.author,
                            personal_info: {
                              ...blog.author.personal_info,
                              bio: "Thành viên nhóm."
                            },
                            account_info: {
                              total_followers: 0,
                              total_following: 0
                            }
                          }
                        };
                        const roleInfo = getRoleDetails(memberInfo.role);
                        const isSelf = memberInfo.user.personal_info?.username === currentUsername;

                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="absolute left-0 bottom-full mb-3.5 z-50 w-72 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto font-inter text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-start gap-3.5">
                              <img
                                src={memberInfo.user.personal_info.profile_img}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200/60 dark:border-white/5 bg-slate-100 dark:bg-zinc-800"
                                alt=""
                              />
                              <div className="min-w-0 flex-grow">
                                <h5 className="text-xs font-black text-slate-900 dark:text-white font-jakarta leading-snug truncate">
                                  {memberInfo.user.personal_info.fullname}
                                </h5>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5 truncate">
                                  @{memberInfo.user.personal_info.username}
                                </p>

                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider ${roleInfo.badgeStyle} leading-none mt-2`}
                                >
                                  <i className={`fi ${roleInfo.icon} text-[7px]`}></i>
                                  {roleInfo.label}
                                </span>
                              </div>
                            </div>

                            {/* Bio */}
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-3 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-100 dark:border-white/5 italic max-h-16 overflow-y-auto">
                              {memberInfo.user.personal_info.bio || "Không có giới thiệu tiểu sử."}
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-white/5 text-center">
                              <div>
                                <p className="text-xs font-black text-slate-800 dark:text-white font-jakarta">
                                  {memberInfo.user.account_info?.total_followers || 0}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                  Theo dõi
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-800 dark:text-white font-jakarta">
                                  {memberInfo.user.account_info?.total_following || 0}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                  Đang theo dõi
                                </p>
                              </div>
                            </div>

                            {/* Message button */}
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleStartChat(memberInfo.user);
                                }}
                                className="w-full mt-4 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/15 cursor-pointer"
                              >
                                <i className="fi fi-rr-paper-plane text-[10px]"></i>
                                Nhắn tin ngay
                              </button>
                            )}
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                  <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full shrink-0"></span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-md font-bold font-jakarta text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed font-medium">
                  {blog.des}
                </p>
                {discussionFilter === "published" ? (
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-2">
                    <span className="flex items-center gap-1">
                      <i className="fi fi-rr-heart text-xs"></i>{" "}
                      {blog.activity?.total_likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fi fi-rr-comment-alt text-xs"></i>{" "}
                      {blog.activity?.total_comments || 0}
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5 mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleApproveBlog(blog._id)}
                      className="py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Duyệt bài
                    </button>
                    <button
                      onClick={() => handleRejectBlog(blog._id)}
                      className="py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </div>

              {blog.banner && (
                <div className="w-full md:w-44 h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800">
                  <img
                    src={blog.banner}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt=""
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-3xl">
          <i className="fi fi-rr-comments text-3xl mb-2 block text-slate-300 dark:text-zinc-750"></i>
          {discussionFilter === "published"
            ? "Chưa có bài viết thảo luận nào trong nhóm này."
            : "Không có bài viết nào đang chờ duyệt."}
        </div>
      )}
    </div>
  );
};
