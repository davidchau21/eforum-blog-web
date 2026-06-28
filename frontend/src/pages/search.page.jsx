import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { UserContext, ThemeContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import AnimationWrapper from "../common/page-animation";

// ─── Skeleton Loaders ───────────────────────────────────────────────────────
const BlogSkeleton = () => (
  <div className="flex gap-4 py-5 border-b border-slate-100 dark:border-white/5 animate-pulse">
    <div className="flex-1 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
      <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
      <div className="flex gap-3 mt-2">
        <div className="h-3 w-12 rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-3 w-12 rounded bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
    <div className="w-28 h-20 rounded-xl bg-slate-200 dark:bg-white/10 shrink-0" />
  </div>
);

const UserSkeleton = () => (
  <div className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-white/5 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-32 rounded bg-slate-200 dark:bg-white/10" />
      <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-white/10" />
      <div className="h-2.5 w-48 rounded bg-slate-200 dark:bg-white/10" />
    </div>
    <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-white/10" />
  </div>
);

// ─── Blog Card ────────────────────────────────────────────────────────────────
const SearchBlogCard = ({ blog }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const tags = blog.tags?.slice(0, 2) || [];
  const readTime = blog.content?.blocks
    ? Math.max(1, Math.ceil(blog.content.blocks.reduce((acc, b) => acc + (b.data?.text?.split(/\s+/).length || 0), 0) / 200))
    : blog.des?.split(/\s+/).length
    ? Math.max(1, Math.ceil(blog.des.split(/\s+/).length / 200))
    : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group"
    >
      <Link
        to={`/blog/${blog.blog_id}`}
        className="flex gap-5 py-5 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.03] rounded-xl px-3 -mx-3 transition-colors"
      >
        <div className="flex-1 min-w-0 space-y-2">
          {/* Author row */}
          <div className="flex items-center gap-2">
            <img
              src={blog.author?.personal_info?.profile_img}
              className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-white/10"
              alt=""
            />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
              {blog.author?.personal_info?.fullname}
            </span>
            {blog.group && (
              <>
                <span className="text-slate-300 dark:text-white/20 text-xs">in</span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                  {blog.group.name}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {blog.title}
          </h3>

          {/* Description */}
          <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {blog.des}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
            <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-auto">
              {readTime} phút đọc
            </span>
          </div>
        </div>

        {/* Banner */}
        {blog.banner && (
          <div className="w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-white/5">
            <img
              src={blog.banner}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </Link>
    </motion.div>
  );
};

// ─── User Card ────────────────────────────────────────────────────────────────
const SearchUserCard = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-white/5"
    >
      <Link to={`/user/${user.personal_info?.username}`} className="shrink-0">
        <img
          src={user.personal_info?.profile_img}
          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-white/10 hover:scale-105 transition-transform"
          alt={user.personal_info?.fullname}
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/user/${user.personal_info?.username}`}>
          <p className="font-bold text-[14px] text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate">
            {user.personal_info?.fullname}
          </p>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          @{user.personal_info?.username}
        </p>
        {user.personal_info?.bio && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {user.personal_info.bio}
          </p>
        )}
      </div>
      <Link
        to={`/user/${user.personal_info?.username}`}
        className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:border-indigo-500 transition-all"
      >
        Xem hồ sơ
      </Link>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SearchPage = () => {
  const { query } = useParams();
  const { theme } = useContext(ThemeContext);
  const { userAuth } = useContext(UserContext);
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("blogs"); // blogs | people
  const [blogs, setBlogs] = useState(null);
  const [users, setUsers] = useState(null);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [blogPage, setBlogPage] = useState(1);

  const tabs = [
    { id: "blogs", label: "Bài viết", icon: "fi-rr-document" },
    { id: "people", label: "Người dùng", icon: "fi-rr-user" },
  ];

  const searchBlogs = useCallback(
    async ({ page = 1, create_new_arr = false } = {}) => {
      setBlogsLoading(true);
      try {
        const { data } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/blogs/search-blogs",
          { query, page }
        );
        const formatted = await filterPaginationData({
          state: create_new_arr ? null : blogs,
          data: data.blogs,
          page,
          countRoute: "/blogs/search-blogs-count",
          data_to_send: { query },
          create_new_arr,
        });
        setBlogs(formatted);
      } catch (e) {
        console.error(e);
      } finally {
        setBlogsLoading(false);
      }
    },
    [query]
  );

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/users/search-users",
        { query }
      );
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  }, [query]);

  useEffect(() => {
    setBlogs(null);
    setUsers(null);
    setBlogsLoading(true);
    setUsersLoading(true);
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const loadMoreBlogs = () => {
    const nextPage = blogPage + 1;
    setBlogPage(nextPage);
    searchBlogs({ page: nextPage, create_new_arr: false });
  };

  const totalBlogCount = blogs?.totalDocs ?? 0;
  const totalUserCount = users?.length ?? 0;

  return (
    <AnimationWrapper>
      <div
        className={`min-h-screen pb-20 ${
          isDark ? "bg-[#09090B] text-white" : "bg-[#F8FAFC] text-slate-900"
        } transition-colors`}
      >
        <div className="max-w-2xl mx-auto px-4 pt-6">
          {/* ── Result Summary ── */}
          <div className="mb-5">
            <h1 className="text-xl font-black text-slate-900 dark:text-white font-jakarta">
              Kết quả cho{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                &ldquo;{query}&rdquo;
              </span>
            </h1>
            {!blogsLoading && !usersLoading && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tìm thấy{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {totalBlogCount}
                </span>{" "}
                bài viết và{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {totalUserCount}
                </span>{" "}
                người dùng
              </p>
            )}
          </div>

          {/* ── Tabs ── */}
          <div
            className={`flex gap-1 p-1 rounded-2xl mb-6 ${
              isDark ? "bg-white/5" : "bg-slate-200/60"
            }`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? isDark
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-white text-indigo-600 shadow-sm"
                    : isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <i className={`fi ${tab.icon} text-sm leading-none`}></i>
                {tab.label}
                {tab.id === "blogs" && !blogsLoading && totalBlogCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : isDark
                        ? "bg-white/10 text-slate-400"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {totalBlogCount > 99 ? "99+" : totalBlogCount}
                  </span>
                )}
                {tab.id === "people" && !usersLoading && totalUserCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : isDark
                        ? "bg-white/10 text-slate-400"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {totalUserCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <AnimatePresence mode="wait">
            {activeTab === "blogs" && (
              <motion.div
                key="blogs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {blogsLoading ? (
                  <div className="space-y-1">
                    {Array(5).fill(0).map((_, i) => <BlogSkeleton key={i} />)}
                  </div>
                ) : blogs?.results?.length ? (
                  <>
                    <div>
                      {blogs.results.map((blog, i) => (
                        <SearchBlogCard key={blog.blog_id || i} blog={blog} />
                      ))}
                    </div>
                    {blogs.results.length < blogs.totalDocs && (
                      <button
                        onClick={loadMoreBlogs}
                        className={`w-full mt-6 py-3 rounded-2xl text-sm font-bold border transition-all hover:scale-[1.01] active:scale-[0.99] ${
                          isDark
                            ? "border-white/10 text-slate-300 hover:bg-white/5"
                            : "border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        <i className="fi fi-rr-angle-down mr-2"></i>
                        Tải thêm ({blogs.totalDocs - blogs.results.length} còn lại)
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div
                      className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center text-2xl ${
                        isDark ? "bg-white/5" : "bg-slate-100"
                      }`}
                    >
                      <i className="fi fi-rr-document"></i>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white mb-1">
                      Không tìm thấy bài viết
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Thử tìm kiếm với từ khóa khác
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "people" && (
              <motion.div
                key="people"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {usersLoading ? (
                  <div>
                    {Array(5).fill(0).map((_, i) => <UserSkeleton key={i} />)}
                  </div>
                ) : users?.length ? (
                  <div>
                    {users.map((user, i) => (
                      <SearchUserCard key={user._id || i} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div
                      className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center text-2xl ${
                        isDark ? "bg-white/5" : "bg-slate-100"
                      }`}
                    >
                      <i className="fi fi-rr-user"></i>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white mb-1">
                      Không tìm thấy người dùng
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Thử tìm kiếm với tên hoặc username khác
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default SearchPage;