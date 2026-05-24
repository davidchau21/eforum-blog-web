import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BlogCardSkeleton,
  MinimalBlogSkeleton,
} from "../components/skeleton.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import SupportChat from "../components/support-chat.component";
import { getTranslations } from "../../translations";
import { UserContext } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import WritePostCard from "../components/write-post-card.component";
import WriteModal from "../components/write-modal.component";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [followingBlogs, setFollowingBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [adminBlogs, setAdminBlogs] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const { userAuth } = useContext(UserContext);
  const { language, access_token } = userAuth;
  const translations = getTranslations(language);
  const location = useLocation();
  const navigate = useNavigate();

  const getPageStateFromURL = () => {
    if (location.pathname === "/feed/following") return translations.following;
    return "feed";
  };

  const [pageState, setPageState] = useState(getPageStateFromURL());
  const [tags, setTags] = useState([]);
  const [adminAlert, setAdminAlert] = useState(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  let categories = [
    "Toán",
    "Văn",
    "Anh",
    "Lý",
    "Hóa",
    "Sinh",
    "Sử",
    "Địa",
    "GDCD",
    "Công Nghệ",
    "Tin Học",
    "Môn học khác",
  ];

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/tags?limit=0")
      .then((response) => {
        const fetchedTags = response.data.list || [];
        const sortedTags = fetchedTags.sort((a, b) =>
          a.tag_name.localeCompare(b.tag_name),
        );
        setTags(sortedTags);
      })
      .catch((error) => console.error("Failed to fetch tags:", error));
  }, []);

  const fetchAdminBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/admin-blogs")
      .then(({ data }) => setAdminBlogs(data.blogs))
      .catch(console.log);
  };

  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/latest-blogs",
        { page },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(async ({ data }) => {
        const formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/blogs/all-latest-blogs-count",
          user: access_token,
        });
        setBlogs(formattedData);
      })
      .catch(console.log);
  };

  const fetchFollowingBlogs = ({ page = 1 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/get-user-blogs",
        { page },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(async ({ data }) => {
        const formattedData = await filterPaginationData({
          state: followingBlogs,
          data: data.blogs,
          page,
          countRoute: "/blogs/get-user-blogs-count",
          user: access_token,
        });
        setFollowingBlogs(formattedData);
      })
      .catch(console.log);
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/search-blogs", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        const formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/blogs/search-blogs-count",
          data_to_send: { tag: pageState },
        });
        setBlogs(formattedData);
      })
      .catch(console.log);
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/trending-blogs")
      .then(({ data }) => setTrendingBlogs(data.blogs))
      .catch(console.log);
  };

  const fetchTrendingTopics = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/trending-topics")
      .then(({ data }) => setTrendingTopics(data.topics))
      .catch(console.log);
  };

  const fetchTopContributors = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/top-contributors")
      .then(({ data }) => setTopContributors(data.contributors))
      .catch(console.log);
  };

  const loadBlogByCategory = (e) => {
    const category = e.target.innerText;
    setBlogs(null);
    setPageState(pageState === category ? "feed" : category);
  };

  const loadBlogByTag = (e) => {
    const tag = e.target.value;
    setBlogs(null);
    if (tag === translations.allSubjects) {
      setPageState("feed");
    } else {
      setPageState(tag);
    }
  };

  useEffect(() => {
    setPageState(getPageStateFromURL());
  }, [location.pathname]);

  useEffect(() => {
    setBlogs(null); // Reset blogs for the new tab
    if (pageState === "feed") {
      setActiveTab(0);
      fetchLatestBlogs({ page: 1 });
    } else if (pageState === translations.following) {
      if (!access_token) {
        setPageState("feed");
        setActiveTab(0);
      } else {
        setActiveTab(1);
        fetchFollowingBlogs({ page: 1 });
      }
    } else {
      setActiveTab(0);
      fetchBlogsByCategory({ page: 1 });
    }
    if (!trendingBlogs) fetchTrendingBlogs();
    if (!adminBlogs) fetchAdminBlogs();
    fetchTrendingTopics();
    fetchTopContributors();
  }, [pageState, access_token]);

  useEffect(() => {
    fetchAlert();
  }, [access_token]);

  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    if (adminAlert) {
      setShowAlert(true);
      const timeout = setTimeout(() => {
        setShowAlert(false);
        setTimeout(() => setAdminAlert(null), 500);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [adminAlert]);

  const fetchAlert = () => {
    const alertKey = "adminAlertShown";
    const hasShownAlert = sessionStorage.getItem(alertKey);

    if (!hasShownAlert) {
      axios
        .get(import.meta.env.VITE_SERVER_DOMAIN + "/notifications/alert", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(({ data }) => {
          if (data.list && data.list.length > 0) {
            setAdminAlert(data.list[0].message);
            sessionStorage.setItem(alertKey, "true");
            setTimeout(() => {
              setAdminAlert(null);
            }, 5000);
          }
        })
        .catch(console.log);
    }
  };

  return (
    <AnimationWrapper>
      {/* Admin Alert Toast */}
      {adminAlert && (
        <div
          role="alert"
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${showAlert ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
          id="alert-box"
        >
          <div className="flex items-center gap-3 px-5 py-3.5 bg-white/90 dark:bg-grey/90 border border-amber-200 dark:border-amber-900/30 shadow-xl rounded-2xl backdrop-blur-sm">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-amber-600 dark:text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <span className="text-amber-800 dark:text-amber-200 font-medium text-sm">
              {adminAlert}
            </span>
            <button
              className="ml-2 text-amber-400 hover:text-amber-700 dark:hover:text-amber-200 transition-colors duration-200"
              onClick={() => setAdminAlert(null)}
            >
              <i className="fi fi-rr-cross-small text-xl"></i>
            </button>
          </div>
        </div>
      )}

      <section className="home-section w-full flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-grey transition-colors duration-300">
        {/* Left SideNavBar */}
        <aside className="home-sidebar hidden md:flex w-64 flex-shrink-0 h-[calc(100vh-80px)] sticky left-0 top-[80px] bg-white border-r border-grey flex-col overflow-y-auto scrollbar-hide">
          {/* Brand Header */}
          <div className="px-5 py-4 border-b border-grey">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-500 flex-shrink-0">
                <i className="fi fi-rr-graduation-cap text-base mt-0.5"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-black leading-tight">
                  EForum
                </p>
                <p className="text-[10px] text-dark-grey tracking-wide uppercase font-bold">
                  Academic Community
                </p>
              </div>
            </div>
          </div>

          <nav className="px-3 py-3 space-y-0.5">
            <button
              onClick={() => {
                navigate("/feed");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm ${pageState === "feed" ? "bg-indigo-500/10 text-indigo-500 font-bold" : "text-dark-grey hover:bg-grey hover:text-black"}`}
            >
              <i
                className={`fi fi-rr-home text-base mt-0.5 ${pageState === "feed" ? "text-indigo-500" : ""}`}
              ></i>
              Home
            </button>
            <button
              onClick={() => {
                navigate("/trending");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm ${location.pathname === "/trending" ? "bg-indigo-500/10 text-indigo-500 font-bold" : "text-dark-grey hover:bg-grey hover:text-black"}`}
            >
              <i
                className={`fi fi-rr-arrow-trend-up text-base mt-0.5 ${location.pathname === "/trending" ? "text-indigo-500" : ""}`}
              ></i>
              Popular
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm text-dark-grey hover:bg-grey hover:text-black">
              <i className="fi fi-rr-users text-base mt-0.5"></i>
              {translations.myGroups}
            </button>
            <button
              onClick={() => {
                if (!access_token) return navigate("/signin");
                navigate("/feed/saved");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm ${pageState === translations.savedBlogs ? "bg-indigo-500/10 text-indigo-500 font-bold" : "text-dark-grey hover:bg-grey hover:text-black"}`}
            >
              <i
                className={`fi fi-rr-bookmark text-base mt-0.5 ${pageState === translations.savedBlogs ? "text-indigo-500" : ""}`}
              ></i>
              {translations.savedBlogs}
            </button>
          </nav>

          <div className="px-3 py-3 border-t border-grey">
            <p className="px-3 text-[10px] font-bold text-dark-grey uppercase tracking-widest mb-2">
              Subjects
            </p>
            <nav className="space-y-1">
              {categories.slice(0, 8).map((category, i) => {
                const isActive = pageState === category;
                return (
                  <button
                    key={i}
                    onClick={loadBlogByCategory}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm transform hover:translate-x-1 ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/5 text-indigo-600 font-extrabold border-l-4 border-indigo-500 shadow-sm"
                        : "text-dark-grey hover:bg-grey/80 hover:text-black"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 transition-transform ${
                        isActive ? "scale-125" : ""
                      } ${
                        i % 3 === 0 ? "bg-blue-400" : i % 3 === 1 ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <span className="capitalize truncate tracking-tight">{category}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto px-3 py-4 border-t border-grey space-y-0.5">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-grey hover:bg-grey hover:text-black transition-colors">
              <i className="fi fi-rr-time-past text-base mt-0.5"></i>
              History
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-grey hover:bg-grey hover:text-black transition-colors">
              <i className="fi fi-rr-settings text-base mt-0.5"></i>
              Settings
            </button>
            <div className="relative pt-3">
              <select
                className="w-full appearance-none bg-grey text-black border border-grey rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
                onChange={(e) => {
                  loadBlogByTag(e);
                  if (e.target.value === translations.allSubjects)
                    setPageState("feed");
                }}
              >
                <option>{translations.allSubjects}</option>
                {tags.map((tag, index) => (
                  <option key={index} value={tag.tag_name}>
                    {tag.tag_name}
                  </option>
                ))}
              </select>
              <i className="fi fi-rr-angle-small-down absolute right-3 top-1/2 mt-1 text-dark-grey pointer-events-none text-sm"></i>
            </div>
            <button className="w-full bg-indigo-500 text-white font-bold text-sm py-2.5 rounded-lg hover:bg-indigo-600 transition-all mt-2 active:scale-95">
              Join Subject
            </button>
          </div>
        </aside>

        {/* Center Feed */}
        <main className="home-feed-main flex-1 min-w-0 pb-12 bg-grey">
          <div className="max-w-3xl mx-auto py-5 px-4 lg:px-8">
            {/* Facebook-Style Sub-Navigation Tab Bar */}
            <div className="flex bg-white dark:bg-zinc-900 border border-grey/80 dark:border-zinc-800/80 rounded-2xl mb-6 shadow-sm sticky top-[80px] z-30 transition-all overflow-hidden">
              <button
                onClick={() => {
                  setActiveTab(0);
                  setPageState("feed");
                }}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3.5 text-xs sm:text-sm font-extrabold transition-all relative ${
                  activeTab === 0
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-dark-grey hover:bg-grey/30 dark:hover:bg-zinc-800/50"
                }`}
              >
                <i className={`fi ${activeTab === 0 ? "fi-sr-home text-base" : "fi-rr-home text-base"} mt-0.5`}></i>
                <span className="capitalize">{pageState === "feed" ? "Bản tin" : pageState}</span>
                {activeTab === 0 && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {access_token && (
                <button
                  onClick={() => {
                    setActiveTab(1);
                    setPageState(translations.following);
                  }}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3.5 text-xs sm:text-sm font-extrabold transition-all relative ${
                    activeTab === 1
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-dark-grey hover:bg-grey/30 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <i className={`fi ${activeTab === 1 ? "fi-sr-users text-base" : "fi-rr-users text-base"} mt-0.5`}></i>
                  <span>Theo dõi</span>
                  {activeTab === 1 && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  setActiveTab(2);
                }}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3.5 text-xs sm:text-sm font-extrabold transition-all relative ${
                  activeTab === 2
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-dark-grey hover:bg-grey/30 dark:hover:bg-zinc-800/50"
                }`}
              >
                <i className={`fi ${activeTab === 2 ? "fi-sr-arrow-trend-up text-base" : "fi-rr-arrow-trend-up text-base"} mt-0.5`}></i>
                <span>Xu hướng</span>
                {activeTab === 2 && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab(3);
                }}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3.5 text-xs sm:text-sm font-extrabold transition-all relative ${
                  activeTab === 3
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-dark-grey hover:bg-grey/30 dark:hover:bg-zinc-800/50"
                }`}
              >
                <i className={`fi ${activeTab === 3 ? "fi-sr-megaphone text-base" : "fi-rr-megaphone text-base"} mt-0.5`}></i>
                <span>Tin tức</span>
                {activeTab === 3 && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>

            {/* Dynamic Feed Content Layout Blocks */}
            <div className="feed-content-wrapper">
              {activeTab === 0 && (
                <div>
                  {/* Horizontal Subjects Scroll Bar for Mobile/Tablet (Fully Responsive) */}
                  <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none scroll-smooth -mx-4 px-4 border-b border-grey/60 dark:border-zinc-800/60">
                    <button
                      onClick={() => {
                        setBlogs(null);
                        setPageState("feed");
                      }}
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
                  <WriteModal
                    isOpen={showWriteModal}
                    onClose={() => setShowWriteModal(false)}
                  />
                  
                  {blogs == null ? (
                    <>
                      <BlogCardSkeleton key={1} />
                      <BlogCardSkeleton key={2} />
                      <BlogCardSkeleton key={3} />
                    </>
                  ) : blogs?.results?.length ? (
                    <div className="flex flex-col gap-0">
                      {blogs.results.map((blog, i) => (
                        <AnimationWrapper
                          transition={{ duration: 1, delay: i * 0.1 }}
                          key={i}
                        >
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
                      fetchDataFun={pageState === "feed" ? fetchLatestBlogs : fetchBlogsByCategory}
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

              {activeTab === 1 && (
                <div>
                  <WritePostCard openModal={() => setShowWriteModal(true)} />
                  <WriteModal
                    isOpen={showWriteModal}
                    onClose={() => setShowWriteModal(false)}
                  />

                  {followingBlogs == null ? (
                    <>
                      <BlogCardSkeleton key={1} />
                      <BlogCardSkeleton key={2} />
                    </>
                  ) : followingBlogs?.results?.length ? (
                    <div className="flex flex-col gap-0">
                      {followingBlogs.results.map((blog, i) => (
                        <AnimationWrapper
                          transition={{ duration: 1, delay: i * 0.1 }}
                          key={i}
                        >
                          <BlogPostCard content={blog} author={blog.author} />
                        </AnimationWrapper>
                      ))}
                    </div>
                  ) : (
                    <NoDataMessage message="Chưa có bài đăng nào từ những người bạn theo dõi." />
                  )}

                  {followingBlogs?.results?.length > 0 && followingBlogs.results.length < followingBlogs.totalDocs && (
                    <LoadMoreDataBtn
                      state={followingBlogs}
                      fetchDataFun={fetchFollowingBlogs}
                    />
                  )}
                </div>
              )}

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
                        <AnimationWrapper
                          transition={{ duration: 1, delay: i * 0.1 }}
                          key={i}
                        >
                          <MinimalBlogPost blog={blog} index={i} />
                        </AnimationWrapper>
                      ))}
                    </div>
                  ) : (
                    <NoDataMessage message={translations.noTrendingBlogs} />
                  )}
                </div>
              )}

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
                        <AnimationWrapper
                          transition={{ duration: 1, delay: i * 0.1 }}
                          key={i}
                        >
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
          </div>
        </main>

        {/* Right SideNavBar (Activity) */}
        <aside className="home-sidebar hidden lg:flex w-72 flex-shrink-0 h-[calc(100vh-80px)] sticky right-0 top-[80px] bg-white border-l border-grey flex-col overflow-y-auto scrollbar-hide">
          {/* Trending Topics */}
          <div className="px-5 pt-5 pb-4 border-b border-grey">
            <p className="text-[10px] font-bold text-dark-grey uppercase tracking-widest mb-4">
              🔥 Trending Topics
            </p>
            <div className="space-y-3">
              {trendingTopics.length ? (
                trendingTopics.map((tag, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer"
                    onClick={() => {
                      setPageState(tag);
                    }}
                  >
                    <div className="text-[10px] text-black uppercase tracking-wider mb-0.5 font-bold opacity-40">
                      Subject • Trending
                    </div>
                    <div className="font-bold text-black text-sm capitalize group-hover:text-indigo-500 transition-colors">
                      #{tag}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-dark-grey text-sm normal-case">
                  Loading topics...
                </div>
              )}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="px-5 py-4 border-b border-grey">
            <p className="text-[10px] font-bold text-dark-grey uppercase tracking-widest mb-4">
              🏆 Top Contributors
            </p>
            <div className="space-y-3">
              {topContributors.length ? (
                topContributors.map((user, index) => {
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
                    <div
                      key={index}
                      className="flex items-center gap-3 group cursor-pointer p-1.5 rounded-xl hover:bg-grey/30 transition-colors"
                      onClick={() =>
                        navigate(`/user/${user.personal_info.username}`)
                      }
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
                        <div className="font-bold text-black text-sm truncate group-hover:text-indigo-500 transition-colors">
                          {user.personal_info.fullname}
                        </div>
                        <div className="text-[11px] text-dark-grey font-medium flex items-center gap-1">
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
                  );
                })
              ) : (
                <div className="text-dark-grey text-sm normal-case">
                  Loading contributors...
                </div>
              )}
            </div>
          </div>

          {/* Admin Posts */}
          <div className="px-5 py-4 border-b border-grey">
            <p className="text-[10px] font-bold text-dark-grey uppercase tracking-widest mb-4">
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
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} />
                  </AnimationWrapper>
                ))
              ) : (
                <div className="text-dark-grey normal-case text-sm">
                  No admin posts found.
                </div>
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-auto px-5 py-4">
            <nav className="flex flex-col space-y-2.5">
              <a
                className="text-dark-grey hover:text-black transition-colors flex items-center gap-2.5 text-[10px] uppercase font-bold tracking-wider"
                href="#"
              >
                <i className="fi fi-rr-shield text-xs"></i>{" "}
                Community Guidelines
              </a>
              <a
                className="text-dark-grey hover:text-black transition-colors flex items-center gap-2.5 text-[10px] uppercase font-bold tracking-wider"
                href="#"
              >
                <i className="fi fi-rr-interrogation text-xs"></i>{" "}
                Support
              </a>
              <a
                className="text-dark-grey hover:text-black transition-colors flex items-center gap-2.5 text-[10px] uppercase font-bold tracking-wider"
                href="#"
              >
                <i className="fi fi-rr-comment-alt text-xs"></i>{" "}
                Feedback
              </a>
            </nav>
          </div>
        </aside>
      </section>

      <SupportChat />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-[88px] right-7 z-40 w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-xl border border-grey/25 hover:bg-indigo-600 dark:hover:bg-indigo-100 transition-colors cursor-pointer group"
            aria-label="Scroll to top"
          >
            <i className="fi fi-rr-arrow-small-up text-2xl group-hover:-translate-y-0.5 transition-transform"></i>
          </motion.button>
        )}
      </AnimatePresence>
    </AnimationWrapper>
  );
};

export default HomePage;
