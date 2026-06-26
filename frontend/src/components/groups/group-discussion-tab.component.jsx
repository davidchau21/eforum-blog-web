import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BlogPostCard from "../blog-post.component";
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
      (c) => c._id === authorUser?._id,
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
        <div className="bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <p className="font-bold text-slate-900 dark:text-white font-inter flex items-center gap-2">
              Bạn có ý kiến hay tài liệu mới?
              {settings.memberPostApprovalRequired && (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
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
            className="py-3 px-5 text-xs font-bold uppercase tracking-wider font-inter bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl hover:shadow-[0_4px_20px_rgba(79,70,229,0.2)] transition-all shrink-0 self-stretch sm:self-auto text-center"
          >
            Đăng bài mới
          </button>
        </div>
      )}

      {activeBlogsList.length > 0 ? (
        <div className="space-y-4">
          {activeBlogsList.map((blog) => 
            discussionFilter === "published" ? (
              <BlogPostCard key={blog.blog_id} content={{ ...blog, group: null }} author={blog.author} members={members} />
            ) : (
              <div
                key={blog.blog_id}
                className="blog-post-card bg-white rounded-2xl border border-grey p-5 sm:p-6 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-[0_4px_24px_rgba(99,102,241,0.08)] transition-all duration-300 relative mb-4 text-left"
              >
                <div className="w-full">
                  {/* Author Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-2 group/author cursor-pointer relative"
                        onMouseEnter={() => setHoveredBlogId(blog.blog_id)}
                        onMouseLeave={() => setHoveredBlogId(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAuthorClick) onAuthorClick(blog.author);
                        }}
                      >
                        <img
                          src={blog.author?.personal_info?.profile_img}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-grey"
                          alt=""
                        />
                        <span className="text-[13.5px] font-bold text-black dark:text-white group-hover/author:text-indigo-500 transition-colors">
                          {blog.author?.personal_info?.fullname}
                        </span>

                        {/* Popover Hover Card for Pending Posts */}
                        <AnimatePresence>
                          {hoveredBlogId === blog.blog_id &&
                            blog.author &&
                            (() => {
                              const memberInfo = (members || []).find(
                                (m) => m.user?._id === blog.author?._id,
                              ) || {
                                role: "MEMBER",
                                user: {
                                  ...blog.author,
                                  personal_info: {
                                    ...blog.author.personal_info,
                                    bio: "Thành viên nhóm.",
                                  },
                                  account_info: {
                                    total_followers: 0,
                                    total_following: 0,
                                  },
                                },
                              };
                              const roleInfo = getRoleDetails(memberInfo.role);
                              const isSelf =
                                memberInfo.user.personal_info?.username ===
                                currentUsername;

                              return (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  transition={{ duration: 0.18, ease: "easeOut" }}
                                  className="absolute left-0 bottom-full mb-3.5 z-50 w-72 bg-white dark:bg-[#18181b]/95 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xl pointer-events-auto font-inter text-left"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-start gap-3">
                                    <img
                                      src={
                                        memberInfo.user.personal_info.profile_img
                                      }
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
                                        <i
                                          className={`fi ${roleInfo.icon} text-[7px]`}
                                        ></i>
                                        {roleInfo.label}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Bio */}
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-3 bg-slate-50 dark:bg-[#1f1f23] p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/45 italic line-clamp-2">
                                    {memberInfo.user.personal_info.bio ||
                                      "Không có giới thiệu tiểu sử."}
                                  </p>

                                  {/* Stats */}
                                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/40 text-center">
                                    <div>
                                      <p className="text-xs font-black text-slate-800 dark:text-white font-jakarta">
                                        {memberInfo.user.account_info
                                          ?.total_followers || 0}
                                      </p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                        Theo dõi
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-black text-slate-800 dark:text-white font-jakarta">
                                        {memberInfo.user.account_info
                                          ?.total_following || 0}
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
                      <span className="text-dark-grey text-xs opacity-60 font-medium ml-2">
                        {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="block group/title mb-1.5">
                    <h3 className="font-bold text-[16px] text-black dark:text-white leading-snug group-hover/title:text-indigo-500 transition-colors duration-200">
                      {blog.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <div className="block mb-4">
                    <p className="text-[14px] text-dark-grey line-clamp-2 leading-[1.6]">
                      {blog.des}
                    </p>
                  </div>

                  {/* Banner (Full width, hide if default) */}
                  {blog.banner && blog.banner !== "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg" && (
                    <div className="block mb-4 overflow-hidden rounded-xl border border-grey">
                      <img
                        src={blog.banner}
                        alt={blog.title}
                        className="w-full h-auto hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {blog.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-grey text-dark-grey text-[11.5px] px-2.5 py-1 rounded-md font-bold border border-grey hover:bg-indigo-500/10 hover:text-indigo-500 transition-all cursor-pointer uppercase tracking-wider opacity-80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Actions for Pending */}
                  <div className="flex items-center gap-3 pt-4 border-t border-grey/80 dark:border-zinc-800/80">
                    <button
                      onClick={() => handleApproveBlog(blog._id)}
                      className="py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      Duyệt bài
                    </button>
                    <button
                      onClick={() => handleRejectBlog(blog._id)}
                      className="py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[24px] shadow-sm">
          <i className="fi fi-rr-comments text-3xl mb-2 block text-slate-350 dark:text-zinc-700"></i>
          {discussionFilter === "published"
            ? "Chưa có bài viết thảo luận nào trong nhóm này."
            : "Không có bài viết nào đang chờ duyệt."}
        </div>
      )}
    </div>
  );
};
