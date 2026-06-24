import { GroupPrivateLock } from "./group-private-lock.component";

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
}) => {
  if (showLockScreen) {
    return (
      <GroupPrivateLock
        group={group}
        handleToggleJoin={handleToggleJoin}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Blog Banner */}
      {isJoined && (
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
            onClick={() => navigate(`/editor?groupId=${id}`)}
            className="py-3 px-5 text-xs font-black uppercase tracking-wider font-jakarta bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-500/10 shrink-0 self-stretch sm:self-auto text-center"
          >
            Đăng bài mới
          </button>
        </div>
      )}

      {blogs.length > 0 ? (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <div
              key={blog.blog_id}
              className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-[0_20px_50px_rgba(99,102,241,0.06)] hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/blog/${blog.blog_id}`)}
            >
              <div className="flex-grow space-y-3">
                <div className="flex items-center gap-2">
                  <img
                    src={blog.author.personal_info.profile_img}
                    className="w-6 h-6 rounded-full border border-slate-200/60 dark:border-white/10"
                    alt=""
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    @{blog.author.personal_info.username}
                  </span>
                  <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full"></span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(blog.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-black font-jakarta text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed font-medium">
                  {blog.des}
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-2">
                  <span className="flex items-center gap-1">
                    <i className="fi fi-rr-heart text-xs"></i>{" "}
                    {blog.activity.total_likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fi fi-rr-comment-alt text-xs"></i>{" "}
                    {blog.activity.total_comments}
                  </span>
                </div>
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
          Chưa có bài viết thảo luận nào trong nhóm này.
        </div>
      )}
    </div>
  );
};
