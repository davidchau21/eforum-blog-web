/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/loader.component";
import {
  BlogCardSkeleton,
  MinimalBlogSkeleton,
} from "../components/skeleton.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import SupportChat from "../components/support-chat.component";
import { getTranslations } from "../../translations";
import { UserContext } from "../App";
import { motion } from "framer-motion";
import eduIcons from "../imgs/edu-icons.png";
import WritePostCard from "../components/write-post-card.component";
import WriteModal from "../components/write-modal.component";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [followingBlogs, setFollowingBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [adminBlogs, setAdminBlogs] = useState(null);
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

  // ... (categories array stays the same)
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

  const loadBlogByCategory = (e) => {
    const category = e.target.innerText;
    setBlogs(null);
    setPageState(pageState === category ? "feed" : category);
  };

  useEffect(() => {
    setPageState(getPageStateFromURL());
  }, [location.pathname]);

  useEffect(() => {
    activeTabRef.current.click();
    setBlogs(null); // Reset blogs for the new tab
    if (pageState === "feed") {
      fetchLatestBlogs({ page: 1 });
    } else if (pageState === translations.following) {
      if (!access_token) {
        setPageState("feed");
      } else {
        fetchFollowingBlogs({ page: 1 });
      }
    } else {
      fetchBlogsByCategory({ page: 1 });
    }
    if (!trendingBlogs) fetchTrendingBlogs();
    if (!adminBlogs) fetchAdminBlogs();
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
          <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 shadow-xl rounded-2xl backdrop-blur-sm">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-amber-600"
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
            <span className="text-amber-800 font-medium text-sm">
              {adminAlert}
            </span>
            <button
              className="ml-2 text-amber-400 hover:text-amber-700 transition-colors duration-200"
              onClick={() => setAdminAlert(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <section className="home-section w-full flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-slate-50">
        {/* Left SideNavBar */}
        <aside className="home-sidebar hidden md:flex w-64 flex-shrink-0 h-[calc(100vh-80px)] sticky left-0 top-[80px] bg-white border-r border-slate-200 flex-col overflow-y-auto scrollbar-hide">
          {/* Brand Header */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                <i className="fi fi-rr-graduation-cap text-base mt-0.5"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  EForum
                </p>
                <p className="text-[10px] text-slate-400 tracking-wide">
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm ${pageState === "feed" ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            >
              <i
                className={`fi fi-rr-home text-base mt-0.5 ${pageState === "feed" ? "text-indigo-600" : ""}`}
              ></i>
              Home
            </button>
            <button
              onClick={() => {
                setPageState(translations.trending);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm ${pageState === translations.trending ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            >
              <i
                className={`fi fi-rr-arrow-trend-up text-base mt-0.5 ${pageState === translations.trending ? "text-indigo-600" : ""}`}
              ></i>
              Popular
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800">
              <i className="fi fi-rr-users text-base mt-0.5"></i>
              {translations.myGroups}
            </button>
            <button
              onClick={() => {
                if (!access_token) return navigate("/signin");
                navigate("/feed/saved");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm ${pageState === translations.savedBlogs ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            >
              <i
                className={`fi fi-rr-bookmark text-base mt-0.5 ${pageState === translations.savedBlogs ? "text-indigo-600" : ""}`}
              ></i>
              {translations.savedBlogs}
            </button>
          </nav>

          <div className="px-3 py-3 border-t border-slate-100">
            <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Subjects
            </p>
            <nav className="space-y-0.5">
              {categories.slice(0, 6).map((category, i) => (
                <button
                  key={i}
                  onClick={loadBlogByCategory}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm ${pageState === category ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${i % 3 === 0 ? "bg-blue-400" : i % 3 === 1 ? "bg-emerald-400" : "bg-amber-400"}`}
                  ></span>
                  <span className="capitalize truncate">{category}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto px-3 py-4 border-t border-slate-100 space-y-0.5">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <i className="fi fi-rr-time-past text-base mt-0.5"></i>
              History
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <i className="fi fi-rr-settings text-base mt-0.5"></i>
              Settings
            </button>
            <div className="relative pt-3">
              <select
                className="w-full appearance-none bg-slate-50 text-slate-600 border border-slate-200 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
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
              <i className="fi fi-rr-angle-small-down absolute right-3 top-1/2 mt-1 text-slate-400 pointer-events-none text-sm"></i>
            </div>
            <button className="w-full bg-indigo-600 text-white font-medium text-sm py-2.5 rounded-lg hover:bg-indigo-700 transition-colors mt-1">
              Join Subject
            </button>
          </div>
        </aside>

        {/* Center Feed */}
        <main className="home-feed-main flex-1 min-w-0 pb-12 bg-slate-50">
          <div className="max-w-3xl mx-auto py-5 px-4 lg:px-8">
            <InPageNavigation
              routes={[
                pageState === "feed" ? translations.feed : pageState,
                translations.trending,
                translations.adminPosts,
              ]}
              defaultHidden={[translations.trending, translations.adminPosts]}
              hiddenAll={pageState === "feed" ? [translations.feed] : []}
            >
              <div>
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
                {blogs?.results?.length > 0 ? (
                  blogs.results.length < blogs.totalDocs ? (
                    <LoadMoreDataBtn
                      state={blogs}
                      fetchDataFun={
                        pageState == "feed"
                          ? fetchLatestBlogs
                          : fetchBlogsByCategory
                      }
                    />
                  ) : (
                    <div className="flex flex-col items-center py-12 mt-8 border-t border-slate-100">
                      <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-5 text-emerald-500 shadow-sm">
                        <i className="fi fi-rr-check text-2xl mt-1"></i>
                      </div>
                      <p className="text-slate-800 font-bold text-lg mb-2">
                        Bạn đã xem hết tin bài rồi! 🎉
                      </p>
                      <p className="text-slate-500 text-[13px] mb-8 text-center max-w-[280px] leading-relaxed">
                        Hãy quay lại sau để cập nhật thêm những kiến thức bổ ích
                        nhé.
                      </p>
                      <button
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                        className="bg-[#111113] text-white px-10 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] active:scale-95 flex items-center gap-2 group"
                      >
                        <i className="fi fi-rr-arrow-small-up text-xl group-hover:-translate-y-0.5 transition-transform"></i>
                        Quay về đầu trang
                      </button>
                    </div>
                  )
                ) : null}
              </div>

              <div>
                {trendingBlogs == null ? (
                  <>
                    <MinimalBlogSkeleton />
                    <MinimalBlogSkeleton />
                    <MinimalBlogSkeleton />
                  </>
                ) : trendingBlogs.length ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
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

              <div>
                {adminBlogs == null ? (
                  <>
                    <MinimalBlogSkeleton />
                    <MinimalBlogSkeleton />
                    <MinimalBlogSkeleton />
                  </>
                ) : adminBlogs.length ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
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
                  <NoDataMessage message="No admin posts available" />
                )}
              </div>
            </InPageNavigation>
          </div>
        </main>

        {/* Right SideNavBar (Activity) */}
        <aside className="home-sidebar hidden lg:flex w-72 flex-shrink-0 h-[calc(100vh-80px)] sticky right-0 top-[80px] bg-white border-l border-slate-200 flex-col overflow-y-auto scrollbar-hide">
          {/* Trending Topics */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
              🔥 Trending Topics
            </p>
            <div className="space-y-3">
              {tags.slice(0, 4).map((tag, index) => (
                <div
                  key={index}
                  className="group cursor-pointer"
                  onClick={() => {
                    setPageState(tag.tag_name);
                    activeTabRef.current.click();
                  }}
                >
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                    Subject • Trending
                  </div>
                  <div className="font-semibold text-slate-700 text-sm capitalize group-hover:text-indigo-600 transition-colors">
                    #{tag.tag_name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {Math.floor(Math.random() * 900 + 100)} posts
                  </div>
                </div>
              ))}
              {tags.length === 0 && (
                <div className="text-slate-400 text-sm normal-case">
                  Loading topics...
                </div>
              )}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
              🏆 Top Contributors
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 group cursor-pointer">
                <img
                  src="https://i.pravatar.cc/150?img=11"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-700 text-sm truncate group-hover:text-indigo-600 transition-colors">
                    Prof. E. Vance
                  </div>
                  <div className="text-[11px] text-slate-400">12.4K REP</div>
                </div>
                <button className="w-7 h-7 bg-slate-50 border border-slate-200 text-slate-500 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                  <i className="fi fi-rr-user-add text-xs mt-0.5"></i>
                </button>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <img
                  src="https://i.pravatar.cc/150?img=33"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-700 text-sm truncate group-hover:text-indigo-600 transition-colors">
                    Alex Rider
                  </div>
                  <div className="text-[11px] text-slate-400">8.9K REP</div>
                </div>
                <button className="w-7 h-7 bg-slate-50 border border-slate-200 text-slate-500 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                  <i className="fi fi-rr-user-add text-xs mt-0.5"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Admin Posts */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
              📌 Admin Posts
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
                <div className="text-slate-400 normal-case text-sm">
                  No admin posts found.
                </div>
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-auto px-5 py-4">
            <nav className="flex flex-col space-y-2.5">
              <a
                className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-2.5 text-xs normal-case"
                href="#"
              >
                <i className="fi fi-rr-shield text-sm leading-none"></i>{" "}
                Community Guidelines
              </a>
              <a
                className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-2.5 text-xs normal-case"
                href="#"
              >
                <i className="fi fi-rr-interrogation text-sm leading-none"></i>{" "}
                Support
              </a>
              <a
                className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-2.5 text-xs normal-case"
                href="#"
              >
                <i className="fi fi-rr-comment-alt text-sm leading-none"></i>{" "}
                Feedback
              </a>
            </nav>
          </div>
        </aside>
      </section>

      <SupportChat />
    </AnimationWrapper>
  );
};

export default HomePage;
