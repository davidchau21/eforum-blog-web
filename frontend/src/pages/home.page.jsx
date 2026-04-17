import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { useContext, useEffect, useState } from "react";
import Loader from "../components/loader.component";
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

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [adminBlogs, setAdminBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");
  const { userAuth } = useContext(UserContext);
  const { language } = userAuth;
  const translations = getTranslations(language);
  const [tags, setTags] = useState([]);
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  const [adminAlert, setAdminAlert] = useState(null);

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
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/admin-blogs")
      .then(({ data }) => setAdminBlogs(data.blogs))
      .catch(console.log);
  };

  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
      .then(async ({ data }) => {
        const formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-latest-blogs-count",
        });
        setBlogs(formattedData);
      })
      .catch(console.log);
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        const formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { tag: pageState },
        });
        setBlogs(formattedData);
      })
      .catch(console.log);
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
      .then(({ data }) => setTrendingBlogs(data.blogs))
      .catch(console.log);
  };

  const loadBlogByCategory = (e) => {
    const category = e.target.innerText;
    setBlogs(null);
    setPageState(pageState === category ? "home" : category);
  };

  const loadBlogByTag = (e) => {
    const tag = e.target.value;
    setBlogs(null);
    setPageState(pageState === tag ? "home" : tag);
  };

  useEffect(() => {
    activeTabRef.current.click();
    if (pageState === "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }
    if (!trendingBlogs) fetchTrendingBlogs();
    if (!adminBlogs) fetchAdminBlogs();
  }, [pageState]);

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
        .get(import.meta.env.VITE_SERVER_DOMAIN + "/alert", {
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

      {/* NEW STYLE: Centered Kinetic Hero Section */}
      <div className="relative min-h-[600px] overflow-hidden bg-white flex flex-col items-center justify-center text-center px-6 pt-16 pb-20 border-b border-grey/50">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-purple/5 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-400/5 rounded-full blur-[120px]"
          />
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [5, -5, 5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] left-[12%] w-24 h-24 opacity-60 filter blur-[1px] hover:blur-0 transition-all duration-500 overflow-hidden"
          >
            <img
              src={eduIcons}
              alt="Edu"
              className="w-full h-full object-contain scale-[2.2] -translate-x-[22%] -translate-y-[22%]"
              style={{ clipPath: "inset(0 50% 50% 0)" }}
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0], rotate: [-10, 10, -10] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-[20%] right-[15%] w-20 h-20 opacity-60 filter blur-[1px] overflow-hidden"
          >
            <img
              src={eduIcons}
              alt="Edu"
              className="w-full h-full object-contain scale-[2.2] translate-x-[22%] -translate-y-[22%]"
              style={{ clipPath: "inset(0 0 50% 50%)" }}
            />
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.1, 1], y: [0, -15, 0] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-[20%] left-[18%] w-22 h-22 opacity-60 filter blur-[1px] overflow-hidden"
          >
            <img
              src={eduIcons}
              alt="Edu"
              className="w-full h-full object-contain scale-[2.2] -translate-x-[22%] translate-y-[22%]"
              style={{ clipPath: "inset(50% 50% 0 0)" }}
            />
          </motion.div>

          <motion.div
            animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
            className="absolute bottom-[25%] right-[10%] w-24 h-24 opacity-60 filter blur-[1px] overflow-hidden"
          >
            <img
              src={eduIcons}
              alt="Edu"
              className="w-full h-full object-contain scale-[2.2] translate-x-[22%] translate-y-[22%]"
              style={{ clipPath: "inset(50% 0 0 50%)" }}
            />
          </motion.div>
        </div>

        <div className="relative z-20 max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-xs font-bold mb-8 hover:bg-purple duration-300 cursor-pointer shadow-xl shadow-black/10">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
              Hơn 10,000+ tài liệu mới vừa được cập nhật
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-[1000] text-black tracking-tight leading-[0.9] mb-8">
              Khám phá <br />
              <span className="bg-gradient-to-r from-purple via-blue-600 to-emerald-500 bg-clip-text text-transparent animate-gradient-x">
                Tri thức mới
              </span>
            </h1>

            <p className="text-dark-grey text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Nền tảng chia sẻ và thảo luận học tập hiện đại nhất dành cho học
              sinh, <br className="hidden md:block" /> sinh viên và giáo sinh
              tại Việt Nam.
            </p>

            <div className="relative max-w-xl mx-auto group">
              <div className="absolute inset-0 bg-purple/10 blur-2xl group-hover:bg-purple/20 transition-all duration-500 rounded-full"></div>
              <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-grey/50 rounded-2xl p-2.5 shadow-2xl shadow-purple/5 focus-within:ring-2 focus-within:ring-purple/20 transition-all duration-300">
                <i className="fi fi-rr-search text-dark-grey mx-4 text-xl"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết, chủ đề, tên giáo viên..."
                  className="bg-transparent border-none outline-none w-full text-black font-medium py-3 text-lg placeholder:text-dark-grey/60"
                />
                <button className="bg-purple text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition-all duration-300 shadow-lg shadow-purple/20">
                  Tìm kiếm
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8 opacity-70">
              <span className="text-xs font-bold text-dark-grey uppercase tracking-widest">
                Xu hướng:
              </span>
              {categories.slice(0, 4).map((cat, i) => (
                <button
                  key={i}
                  className="text-sm font-bold text-black hover:text-purple transition-all"
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <section className="w-full min-h-screen flex flex-col lg:flex-row gap-6 py-8">
        <aside className="hidden lg:flex lg:w-1/4 sticky-section scrollbar-hide flex-col gap-2">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-grey p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <i className="fi fi-rr-user-pen text-emerald-600 text-base leading-none"></i>
              </div>
              <p className="font-bold text-black text-base">
                {translations.adminPosts}
              </p>
            </div>
            {adminBlogs == null ? (
              <Loader />
            ) : adminBlogs.length ? (
              <div className="space-y-1">
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
        </aside>

        <div className="w-full lg:w-1/2">
          <InPageNavigation
            routes={[pageState, "trendings", "news"]}
            defaultHidden={["trendings", "news"]}
          >
            <div>
              {blogs == null ? (
                <Loader />
              ) : blogs?.results?.length ? (
                <div className="flex flex-col gap-0">
                  {blogs.results.map((blog, i) => (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  ))}
                </div>
              ) : (
                <NoDataMessage message="No blogs published" />
              )}
              {blogs?.results?.length > 0 ? (
                <LoadMoreDataBtn
                  state={blogs}
                  fetchDataFun={
                    pageState == "home"
                      ? fetchLatestBlogs
                      : fetchBlogsByCategory
                  }
                />
              ) : null}
            </div>

            <div>
              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                <div className="bg-white rounded-2xl border border-grey p-4">
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
                <Loader />
              ) : adminBlogs.length ? (
                <div className="bg-white rounded-2xl border border-grey p-4">
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

        <aside className="hidden lg:flex lg:w-1/4 sticky-section scrollbar-hide flex-col gap-4">
          <div className="bg-white rounded-2xl border border-grey p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple/10 rounded-lg flex items-center justify-center">
                <i className="fi fi-rr-filter text-purple text-base leading-none"></i>
              </div>
              <p className="font-bold text-black text-base">
                {translations.subjects}
              </p>
            </div>
            <div className="relative mb-4">
              <select
                className="w-full appearance-none bg-grey/50 text-black border border-grey rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer hover:border-purple/40 focus:border-purple focus:outline-none focus:ring-2 focus:ring-purple/20 transition-all duration-200"
                onChange={(e) => {
                  loadBlogByTag(e);
                  if (e.target.value === "All Subjects") setPageState("home");
                }}
              >
                <option>All Subjects</option>
                {tags.map((tag, index) => (
                  <option key={index} value={tag.tag_name}>
                    {tag.tag_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, i) => (
                <button
                  key={i}
                  onClick={loadBlogByCategory}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${pageState === category ? "bg-purple text-white border-purple shadow-md shadow-purple/30 scale-105" : "bg-white text-dark-grey border-grey hover:border-purple/40 hover:text-purple hover:bg-purple/5"}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple/5 to-white rounded-2xl border border-grey p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <i className="fi fi-rr-arrow-trend-up text-rose-500 text-base leading-none"></i>
              </div>
              <p className="font-bold text-black text-base">
                {translations.trending}
              </p>
            </div>
            {trendingBlogs == null ? (
              <Loader />
            ) : trendingBlogs.length ? (
              <div className="space-y-1">
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
        </aside>
      </section>

      <SupportChat />
    </AnimationWrapper>
  );
};

export default HomePage;
