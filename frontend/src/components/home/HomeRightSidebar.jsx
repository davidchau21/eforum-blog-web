import {
  TrendingTopicsSkeleton,
  TopContributorsSkeleton,
  MinimalBlogSkeleton,
} from "../skeleton.component";
import AnimationWrapper from "../../common/page-animation";
import MinimalBlogPost from "../nobanner-blog-post.component";

const HomeRightSidebar = ({
  trendingTopics,
  topContributors,
  adminBlogs,
  setPageState,
  navigate,
  translations,
}) => {
  const getRankBadge = (idx) => {
    if (idx === 0) return "🥇";
    if (idx === 1) return "🥈";
    if (idx === 2) return "🥉";
    return null;
  };

  const getAvatarRing = (idx) => {
    if (idx === 0) return "ring-2 ring-amber-400 shadow-sm shadow-amber-400/20";
    if (idx === 1) return "ring-2 ring-slate-300 shadow-sm shadow-slate-300/10";
    if (idx === 2) return "ring-2 ring-amber-600/45 shadow-sm shadow-amber-600/10";
    return "ring-1 ring-grey";
  };

  return (
    <aside className="home-sidebar hidden lg:flex w-72 flex-shrink-0 h-[calc(100vh-80px)] sticky right-0 top-[80px] bg-white dark:bg-zinc-900 border-l border-grey dark:border-zinc-800 flex-col overflow-y-auto scrollbar-hide">
      {/* Trending Topics */}
      <div className="px-5 pt-5 pb-4 border-b border-grey dark:border-zinc-800">
        <p className="text-[10px] font-bold text-dark-grey dark:text-zinc-500 uppercase tracking-widest mb-4">
          🔥 Trending Topics
        </p>
        <div className="space-y-3">
          {trendingTopics.length ? (
            trendingTopics.map((tag, index) => (
              <div
                key={index}
                className="group cursor-pointer"
                onClick={() => setPageState(tag)}
              >
                <div className="text-[10px] text-black dark:text-zinc-500 uppercase tracking-wider mb-0.5 font-bold opacity-40">
                  Subject • Trending
                </div>
                <div className="font-bold text-black dark:text-zinc-100 text-sm capitalize group-hover:text-indigo-500 transition-colors">
                  #{tag}
                </div>
              </div>
            ))
          ) : (
            <TrendingTopicsSkeleton />
          )}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="px-5 py-4 border-b border-grey dark:border-zinc-800">
        <p className="text-[10px] font-bold text-dark-grey dark:text-zinc-500 uppercase tracking-widest mb-4">
          🏆 Top Contributors
        </p>
        <div className="space-y-3">
          {topContributors.length ? (
            topContributors.map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-3 group cursor-pointer p-1.5 rounded-xl hover:bg-grey/30 dark:hover:bg-zinc-800/50 transition-colors"
                onClick={() => navigate(`/user/${user.personal_info.username}`)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.personal_info.profile_img}
                    className={`w-8 h-8 rounded-full object-cover ${getAvatarRing(index)}`}
                  />
                  {getRankBadge(index) && (
                    <span className="absolute -top-1.5 -right-1.5 text-xs drop-shadow-sm select-none">
                      {getRankBadge(index)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-black dark:text-zinc-100 text-sm truncate group-hover:text-indigo-500 transition-colors">
                    {user.personal_info.fullname}
                  </div>
                  <div className="text-[11px] text-dark-grey dark:text-zinc-500 font-medium flex items-center gap-1">
                    <span className="font-black text-indigo-500">
                      {user.account_info.total_reads > 1000
                        ? (user.account_info.total_reads / 1000).toFixed(1) + "K"
                        : user.account_info.total_reads}
                    </span>
                    <span>REP</span>
                  </div>
                </div>
                <button className="w-7 h-7 bg-grey border border-grey text-dark-grey rounded-full flex items-center justify-center hover:bg-indigo-500/10 hover:text-indigo-500 hover:border-indigo-500/30 transition-all active:scale-90 shrink-0">
                  <i className="fi fi-rr-user-add text-[10px] mt-0.5"></i>
                </button>
              </div>
            ))
          ) : (
            <TopContributorsSkeleton />
          )}
        </div>
      </div>

      {/* Admin Posts */}
      <div className="px-5 py-4 border-b border-grey dark:border-zinc-800">
        <p className="text-[10px] font-bold text-dark-grey dark:text-zinc-500 uppercase tracking-widest mb-4">
          📌 {translations.adminPosts}
        </p>
        <div className="space-y-3">
          {adminBlogs == null ? (
            <>
              <MinimalBlogSkeleton />
              <MinimalBlogSkeleton />
            </>
          ) : adminBlogs.length ? (
            adminBlogs.slice(0, 3).map((blog, i) => (
              <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                <MinimalBlogPost blog={blog} />
              </AnimationWrapper>
            ))
          ) : (
            <div className="text-dark-grey dark:text-zinc-500 normal-case text-sm">
              No admin posts found.
            </div>
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-auto px-5 py-4">
        <nav className="flex flex-col space-y-2.5">
          <a
            className="text-dark-grey dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2.5 text-[10px] uppercase font-bold tracking-wider"
            href="#"
          >
            <i className="fi fi-rr-shield text-xs"></i> Community Guidelines
          </a>
          <a
            className="text-dark-grey dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2.5 text-[10px] uppercase font-bold tracking-wider"
            href="#"
          >
            <i className="fi fi-rr-interrogation text-xs"></i> Support
          </a>
          <a
            className="text-dark-grey dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2.5 text-[10px] uppercase font-bold tracking-wider"
            href="#"
          >
            <i className="fi fi-rr-comment-alt text-xs"></i> Feedback
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default HomeRightSidebar;
