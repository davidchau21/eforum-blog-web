import {
  BlogCardSkeleton,
  MinimalBlogSkeleton,
} from "../skeleton.component";
import BlogPostCard from "../blog-post.component";
import MinimalBlogPost from "../nobanner-blog-post.component";
import NoDataMessage from "../nodata.component";
import LoadMoreDataBtn from "../load-more.component";
import WritePostCard from "../write-post-card.component";
import WriteModal from "../write-modal.component";
import AnimationWrapper from "../../common/page-animation";
import groupBannerDefault from "../../imgs/group-banner-default.png";

/**
 * The center content area of the home feed.
 * Renders different content depending on activeTab (0=Bản tin, 1=Theo dõi, 2=Xu hướng, 3=Tin tức, 4=Nhóm).
 */
const HomeFeedContent = ({
  activeTab,
  pageState,
  blogs,
  followingBlogs,
  trendingBlogs,
  adminBlogs,
  joinedGroups,
  joinedGroupsTotal,
  joinedGroupsPage,
  showWriteModal,
  setShowWriteModal,
  categories,
  fetchLatestBlogsFn,
  fetchFollowingBlogsFn,
  fetchBlogsByCategoryFn,
  fetchJoinedGroupsFn,
  loadBlogByCategory,
  translations,
  navigate,
}) => {
  return (
    <div className="feed-content-wrapper">
      {/* ── Tab 0: Bản tin (Latest Feed) ─────────────────── */}
      {activeTab === 0 && (
        <div>
          {/* Mobile horizontal category scroll */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none scroll-smooth -mx-4 px-4 border-b border-grey/60 dark:border-zinc-800/60">
            <button
              onClick={() => { loadBlogByCategory({ target: { innerText: "" } }); }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                pageState === "feed"
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800/80 border-grey dark:border-zinc-700/80 text-dark-grey dark:text-grey/80"
              }`}
            >
              Tất cả
            </button>
            {categories.map((category, i) => {
              const isActive = pageState === category;
              return (
                <button
                  key={i}
                  onClick={loadBlogByCategory}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    isActive
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                      : "bg-white dark:bg-zinc-800/80 border-grey dark:border-zinc-700/80 text-dark-grey dark:text-grey/80 hover:bg-grey/50"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <WritePostCard openModal={() => setShowWriteModal(true)} />
          <WriteModal isOpen={showWriteModal} onClose={() => setShowWriteModal(false)} />

          {blogs == null ? (
            <>
              <BlogCardSkeleton key={1} />
              <BlogCardSkeleton key={2} />
              <BlogCardSkeleton key={3} />
            </>
          ) : blogs?.results?.length ? (
            <div className="flex flex-col gap-0">
              {blogs.results.map((blog, i) => (
                <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                  <BlogPostCard content={blog} author={blog.author} />
                </AnimationWrapper>
              ))}
            </div>
          ) : (
            <NoDataMessage message="No blogs published" />
          )}

          {blogs?.results?.length > 0 && blogs.results.length < blogs.totalDocs && (
            <LoadMoreDataBtn
              state={blogs}
              fetchDataFun={fetchLatestBlogsFn}
            />
          )}

          {blogs?.results?.length > 0 && blogs.results.length >= blogs.totalDocs && (
            <div className="flex flex-col items-center py-12 mt-8 border-t border-grey dark:border-zinc-800/80">
              <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-5 text-emerald-500 shadow-sm">
                <i className="fi fi-rr-check text-2xl mt-1"></i>
              </div>
              <p className="text-black dark:text-white font-bold text-lg mb-2">
                Bạn đã xem hết tin bài rồi! 🎉
              </p>
              <p className="text-dark-grey dark:text-grey text-[13px] mb-8 text-center max-w-[280px] leading-relaxed">
                Hãy quay lại sau để cập nhật thêm những kiến thức bổ ích nhé.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-black dark:bg-white text-white dark:text-black px-10 py-3.5 rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-xl active:scale-95 flex items-center gap-2 group"
              >
                <i className="fi fi-rr-arrow-small-up text-xl group-hover:-translate-y-0.5 transition-transform"></i>
                Quay về đầu trang
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 1: Theo dõi (Following) ───────────────────── */}
      {activeTab === 1 && (
        <div>
          <WritePostCard openModal={() => setShowWriteModal(true)} />
          <WriteModal isOpen={showWriteModal} onClose={() => setShowWriteModal(false)} />

          {followingBlogs == null ? (
            <>
              <BlogCardSkeleton key={1} />
              <BlogCardSkeleton key={2} />
            </>
          ) : followingBlogs?.results?.length ? (
            <div className="flex flex-col gap-0">
              {followingBlogs.results.map((blog, i) => (
                <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                  <BlogPostCard content={blog} author={blog.author} />
                </AnimationWrapper>
              ))}
            </div>
          ) : (
            <NoDataMessage message="Chưa có bài đăng nào từ những người bạn theo dõi." />
          )}

          {followingBlogs?.results?.length > 0 &&
            followingBlogs.results.length < followingBlogs.totalDocs && (
              <LoadMoreDataBtn
                state={followingBlogs}
                fetchDataFun={fetchFollowingBlogsFn}
              />
            )}
        </div>
      )}

      {/* ── Tab 4: Nhóm của tôi (My Groups) ──────────────── */}
      {activeTab === 4 && (
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-indigo-900/90 to-purple-900/90 dark:from-indigo-950/80 dark:to-purple-950/80 text-white p-8 shadow-xl border border-white/10 mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                  My Workspace
                </span>
                <h2 className="text-2xl md:text-3xl font-black font-jakarta tracking-tight leading-tight">
                  Cộng Đồng Của Bạn
                </h2>
                <p className="text-xs text-indigo-200/80 max-w-md font-medium leading-relaxed font-inter">
                  Nơi bạn tham gia học tập, thảo luận, nộp tài liệu và làm việc nhóm.
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-lg text-indigo-300">
                  <i className="fi fi-rr-users"></i>
                </div>
                <div>
                  <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Đã gia nhập</p>
                  <p className="text-xl font-black leading-tight font-jakarta">{joinedGroupsTotal} nhóm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Groups Grid */}
          {joinedGroups == null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900/60 rounded-3xl border border-grey dark:border-zinc-800/80 p-5 space-y-4 animate-pulse">
                  <div className="h-28 bg-slate-200 dark:bg-zinc-800 rounded-2xl w-full"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-zinc-800 shrink-0"></div>
                    <div className="space-y-2 flex-grow">
                      <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-2/3"></div>
                      <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : joinedGroups.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {joinedGroups.map((group, i) => {
                const getRoleRingClass = (role) => {
                  switch (role) {
                    case "OWNER": return "ring-4 ring-amber-450 dark:ring-amber-500/80 shadow-md shadow-amber-500/10";
                    case "DEPUTY": return "ring-4 ring-indigo-500 dark:ring-indigo-400/80 shadow-md shadow-indigo-500/10";
                    case "MODERATOR": return "ring-4 ring-emerald-500 dark:ring-emerald-400/80 shadow-md shadow-emerald-500/10";
                    default: return "ring-2 ring-slate-200 dark:ring-zinc-800";
                  }
                };
                const getRoleText = (role) => {
                  switch (role) {
                    case "OWNER": return "Trưởng nhóm";
                    case "DEPUTY": return "Phó nhóm";
                    case "MODERATOR": return "Kiểm duyệt";
                    default: return "Thành viên";
                  }
                };
                const initialsUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(group.name || "Group")}&backgroundColor=b3c5fc`;

                return (
                  <AnimationWrapper transition={{ duration: 0.4, delay: i * 0.05 }} key={group._id}>
                    <div className="bg-white dark:bg-[#111113]/60 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-[32px] overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(99,102,241,0.06)] dark:hover:border-indigo-500/30 hover:-translate-y-2 transition-all duration-300 flex flex-col h-[280px] group">
                      <div className="h-24 w-full overflow-hidden relative bg-slate-100 dark:bg-zinc-800/50">
                        <img
                          src={group.banner || groupBannerDefault}
                          onError={(e) => { e.target.onerror = null; e.target.src = groupBannerDefault; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={group.name}
                        />
                        <div className="absolute top-3 right-3 z-10">
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider backdrop-blur-md bg-black/30 border border-white/10 text-white">
                            {group.isPrivate ? "Riêng tư" : "Công khai"}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-grow relative justify-between">
                        <div className="flex items-end justify-between -mt-11 mb-2 shrink-0">
                          <div className={`w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 mask-squircle border-4 border-white dark:border-[#111113] ${getRoleRingClass(group.myMembership?.role)}`}>
                            <img
                              src={group.avatar || initialsUrl}
                              onError={(e) => { e.target.onerror = null; e.target.src = initialsUrl; }}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            group.myMembership?.role === "OWNER"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : group.myMembership?.role === "DEPUTY"
                                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                                : group.myMembership?.role === "MODERATOR"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5"
                          }`}>
                            {getRoleText(group.myMembership?.role)}
                          </span>
                        </div>

                        <div className="space-y-1 flex-grow">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight font-jakarta line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {group.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            Người tạo: {group.creator?.personal_info?.fullname || "Không rõ"}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed mt-1">
                            {group.description}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-slate-450 dark:text-slate-500">
                            <i className="fi fi-rr-users text-xs"></i>
                            <span className="text-[10px] font-bold">{group.totalMembers} thành viên</span>
                          </div>
                          <button
                            onClick={() => navigate(`/group/${group._id}`)}
                            className="text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 hover:scale-105 active:scale-95"
                          >
                            Vào Workspace
                          </button>
                        </div>
                      </div>
                    </div>
                  </AnimationWrapper>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#111113]/60 backdrop-blur-md rounded-[32px] border border-slate-200/60 dark:border-white/5 p-8 shadow-sm">
              <i className="fi fi-rr-users text-3xl mb-2 block text-slate-300 dark:text-zinc-700"></i>
              <p className="text-xs font-medium">Bạn chưa tham gia nhóm học tập nào.</p>
              <button
                onClick={() => navigate("/groups")}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all"
              >
                Khám phá các nhóm
              </button>
            </div>
          )}

          {joinedGroups?.length > 0 && joinedGroups.length < joinedGroupsTotal && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => fetchJoinedGroupsFn({ page: joinedGroupsPage + 1, append: true })}
                className="text-dark-grey hover:text-black dark:text-grey/80 dark:hover:text-white p-2.5 px-5 bg-white dark:bg-zinc-900 border border-grey dark:border-zinc-800 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                Tải thêm nhóm
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Xu hướng (Trending) ────────────────────── */}
      {activeTab === 2 && (
        <div>
          {trendingBlogs == null ? (
            <>
              <MinimalBlogSkeleton />
              <MinimalBlogSkeleton />
              <MinimalBlogSkeleton />
            </>
          ) : trendingBlogs.length ? (
            <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-grey dark:border-zinc-800/80 p-4 shadow-sm space-y-4">
              {trendingBlogs.map((blog, i) => (
                <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                  <MinimalBlogPost blog={blog} index={i} />
                </AnimationWrapper>
              ))}
            </div>
          ) : (
            <NoDataMessage message={translations.noTrendingBlogs} />
          )}
        </div>
      )}

      {/* ── Tab 3: Tin tức (Admin News) ───────────────────── */}
      {activeTab === 3 && (
        <div>
          {adminBlogs == null ? (
            <>
              <MinimalBlogSkeleton />
              <MinimalBlogSkeleton />
            </>
          ) : adminBlogs.length ? (
            <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-grey dark:border-zinc-800/80 p-4 shadow-sm space-y-4">
              {adminBlogs.map((blog, i) => (
                <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                  <MinimalBlogPost blog={blog} index={i} />
                </AnimationWrapper>
              ))}
            </div>
          ) : (
            <NoDataMessage message="Chưa có tin tức nào từ Ban quản trị." />
          )}
        </div>
      )}
    </div>
  );
};

export default HomeFeedContent;
