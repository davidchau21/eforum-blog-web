/* eslint-disable no-undef */
import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer, {
  fetchComments,
} from "../components/comments.component";

export const blogStructure = {
  title: "",
  des: "",
  content: [],
  author: { personal_info: {} },
  banner: "",
  publishedAt: "",
  tags: [],
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blog_id } = useParams();
  const location = useLocation();

  const [blog, setBlog] = useState(blogStructure);
  const [similarBlogs, setSimilrBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [islikedByUser, setLikedByUser] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const { fullScreenImage, setFullScreenImage } = useContext(UserContext);
  const contentRef = useRef(null);

  const bannerDefault =
    "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg";
  const handleBannerError = (e) => {
    e.target.src = bannerDefault;
  };

  const {
    title,
    content,
    banner,
    des,
    tags,
    author: {
      personal_info: { fullname, username: author_username, profile_img } = {},
    } = {},
    publishedAt,
    activity,
  } = blog;

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.body.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setReadingProgress(
          Math.min(100, Math.round((window.scrollY / docHeight) * 100)),
        );
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
      .then(async ({ data: { blog } }) => {
        blog.comments = await fetchComments({
          blog_id: blog._id,
          setParentCommentCountFun: setTotalParentCommentsLoaded,
        });
        setBlog(blog);
        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
            tag: blog.tags[0],
            limit: 3,
            eliminate_blog: blog_id,
          })
          .then(({ data }) => setSimilrBlogs(data.blogs));
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetStates();
    fetchBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blog_id]);

  // Auto-scroll to comments section if URL contains ?comment=1
  useEffect(() => {
    if (location.search.includes("comment=1") && !loading) {
      setTimeout(() => {
        const element = document.getElementById("comments-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, [location.search, loading]);

  const resetStates = () => {
    setBlog(blogStructure);
    setSimilrBlogs(null);
    setLoading(true);
    setLikedByUser(false);
    setLikedByUser(false);
    setTotalParentCommentsLoaded(0);
    setReadingProgress(0);
  };

  const hasRealBanner = banner && banner !== bannerDefault;

  const estimateReadTime = (content) => {
    if (!content || !content[0]) return 1;
    const text = content[0].blocks.map((b) => b.data?.text || "").join(" ");
    return Math.max(1, Math.ceil(text.split(" ").length / 200));
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            islikedByUser,
            setLikedByUser,
            totalParentCommentsLoaded,
            setTotalParentCommentsLoaded,
            fullScreenImage,
            setFullScreenImage,
          }}
        >
          {/* Reading Progress Bar */}
          <div className="fixed top-0 left-0 w-full h-0.5 bg-grey/30 z-50 pointer-events-none">
            <div
              className="h-full bg-gradient-to-r from-purple to-emerald-500 transition-all duration-150 ease-out"
              style={{ width: `${readingProgress}%` }}
            />
          </div>

          <div ref={contentRef} className="text-black min-h-screen">
            {/* ═══════════ UNIFIED CONTAINER ═══════════ */}
            <div className="max-w-[98%] mx-auto px-2 lg:px-4">
              {/* ── HERO (aligns with article column) ── */}
              <div className="relative z-20 max-w-[96%] w-full mx-auto flex gap-12 items-start pt-10 pb-8 border-b border-grey/40">
                <div className="absolute inset-0 bg-gradient-to-br from-purple/[0.04] via-transparent to-emerald-500/[0.02] pointer-events-none" />

                {/* Hero content – same flex-1 as article below */}
                <div className="flex-1 min-w-0 relative z-10">
                  {/* Tags */}
                  {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {tags.slice(0, 5).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple/10 text-purple border border-purple/20 tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <p
                    className="text-black mb-3"
                    style={{
                      fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                      lineHeight: 1.15,
                      fontWeight: 800,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {title}
                  </p>

                  {/* Description */}
                  {des && (
                    <p
                      className="text-dark-grey leading-relaxed mb-6"
                      style={{ fontSize: "1.05rem" }}
                    >
                      {des}
                    </p>
                  )}

                  {/* Author + Meta Row */}
                  <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-grey/60">
                    <Link
                      to={`/user/${author_username}`}
                      className="flex items-center gap-3 group"
                    >
                      <img
                        src={profile_img}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-purple/40 transition-all duration-300 flex-shrink-0"
                        alt={fullname}
                      />
                      <div>
                        <p className="font-semibold text-black text-sm group-hover:text-purple transition-colors capitalize leading-tight">
                          {fullname}
                        </p>
                        <p className="text-xs text-dark-grey">
                          @{author_username}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-dark-grey">
                      <span className="flex items-center gap-1.5">
                        <i className="fi fi-rr-calendar text-purple/60 leading-none"></i>
                        {new Date(publishedAt).toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5 bg-grey/60 px-2.5 py-1 rounded-full font-medium">
                        <i className="fi fi-rr-time-read leading-none"></i>
                        {estimateReadTime(content)} phút đọc
                      </span>
                    </div>
                  </div>

                  {/* Banner (inside article column width) */}
                  {hasRealBanner && (
                    <div
                      className="mt-6 w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-xl shadow-black/10 cursor-zoom-in"
                      onClick={() => setFullScreenImage(banner)}
                    >
                      <img
                        src={banner}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        onError={handleBannerError}
                        alt="Banner bài viết"
                      />
                    </div>
                  )}
                </div>

                {/* Sidebar spacer in hero (keeps alignment) */}
                <div className="hidden lg:block w-[260px] flex-shrink-0" />
              </div>

              {/* ── CONTENT + SIDEBAR ── */}
              <div className="flex gap-12 items-start py-8">
                {/* Article */}
                <article className="flex-1 min-w-0">
                  <div className="mb-10 blog-page-content">
                    <div
                      className="font-gelasio leading-relaxed text-black/90"
                      style={{ fontSize: "1.05rem" }}
                    >
                      {content[0].blocks.map((block, i) => (
                        <div key={i} className="my-4 md:my-7">
                          <BlogContent block={block} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <BlogInteraction />

                  <CommentsContainer />
                </article>

                {/* Sticky Sidebar */}
                <aside className="hidden lg:block w-[260px] flex-shrink-0">
                  <div className="sticky top-20 space-y-4">
                    {/* Stats */}
                    {activity && (
                      <div className="bg-white rounded-3xl border border-grey/60 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
                        <p className="text-xs font-bold uppercase tracking-widest text-dark-grey/70 mb-4">
                          Thống kê
                        </p>
                        <div className="flex flex-col gap-3">
                          {[
                            {
                              icon: "fi-rr-heart",
                              bg: "bg-rose-50",
                              color: "text-rose-400",
                              val: activity.total_likes || 0,
                              label: "Lượt thích",
                            },
                            {
                              icon: "fi-rr-comment-dots",
                              bg: "bg-blue-50",
                              color: "text-blue-400",
                              val: activity.total_comments || 0,
                              label: "Bình luận",
                            },
                            {
                              icon: "fi-rr-share",
                              bg: "bg-emerald-50",
                              color: "text-emerald-500",
                              val: activity.total_share || 0,
                              label: "Chia sẻ",
                            },
                          ].map(({ icon, bg, color, val, label }) => (
                            <div
                              key={label}
                              className="flex items-center gap-3"
                            >
                              <div
                                className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
                              >
                                <i
                                  className={`fi ${icon} ${color} text-base leading-none`}
                                ></i>
                              </div>
                              <div>
                                <p className="font-bold text-black text-sm leading-none">
                                  {val}
                                </p>
                                <p className="text-xs text-dark-grey mt-0.5">
                                  {label}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                      <div className="bg-white rounded-3xl border border-grey/60 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
                        <p className="text-xs font-bold uppercase tracking-widest text-dark-grey/70 mb-3">
                          Chủ đề
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-grey/50 text-dark-grey text-xs rounded-full hover:bg-purple/10 hover:text-purple transition-all duration-200 cursor-pointer border border-transparent hover:border-purple/20"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reading Progress */}
                    <div className="bg-grey border border-grey/50 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-dark-grey/70">
                          Tiến độ
                        </p>
                        <span className="text-xs font-bold text-purple">
                          {readingProgress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-grey/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple to-emerald-500 transition-all duration-300 rounded-full"
                          style={{ width: `${readingProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-dark-grey mt-2 flex items-center gap-1">
                        <i className="fi fi-rr-time-read text-xs leading-none"></i>
                        ~{estimateReadTime(content)} phút đọc
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
              {/* end flex content+sidebar */}
            </div>
            {/* end unified container */}

            {/* ═══════════ SIMILAR BLOGS ═══════════ */}
            {similarBlogs != null && similarBlogs.length > 0 && (
              <div className="bg-grey/20 border-t border-grey/50">
                <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-12">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-7 bg-gradient-to-b from-purple to-emerald-500 rounded-full flex-shrink-0"></div>
                    <p
                      className="font-bold text-black"
                      style={{ fontSize: "1.25rem" }}
                    >
                      Bài viết tương tự
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {similarBlogs.map((blog, i) => {
                      const {
                        author: { personal_info },
                      } = blog;
                      return (
                        <AnimationWrapper
                          key={i}
                          transition={{ duration: 1, delay: i * 0.08 }}
                        >
                          <BlogPostCard content={blog} author={personal_info} />
                        </AnimationWrapper>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
