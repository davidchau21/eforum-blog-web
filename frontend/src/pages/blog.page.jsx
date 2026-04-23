/* eslint-disable no-unused-vars */
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
import { getTranslations } from "../../translations";
import { toast } from "react-hot-toast";

export const blogStructure = {
  title: "",
  des: "",
  content: [],
  author: { personal_info: {} },
  banner: "",
  publishedAt: "",
  tags: [],
  activity: { total_likes: 0, total_comments: 0, total_share: 0 },
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blog_id } = useParams();
  const location = useLocation();

  const [blog, setBlog] = useState(blogStructure);
  const [similarBlogs, setSimilrBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [islikedByUser, setLikedByUser] = useState(false);
  const [isSavedByUser, setSavedByUser] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const {
    fullScreenImage,
    setFullScreenImage,
    userAuth: { language, access_token } = {},
  } = useContext(UserContext);

  const trackInterest = (tags) => {
    if (access_token && tags && tags.length) {
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/track-interest",
          { tags },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        )
        .catch((err) => console.log("Interest tracking failed", err));
    }
  };

  const translations = getTranslations(language);
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
      _id: authorId,
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

        // Track interest
        trackInterest(blog.tags);

        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
            tag: blog.tags[0],
            limit: 3,
            eliminate_blog: blog_id,
          })
          .then(({ data }) => setSimilrBlogs(data.blogs));

        // Check follow status
        if (access_token) {
          axios
            .post(
              import.meta.env.VITE_SERVER_DOMAIN + "/users/is-following",
              { target_id: blog.author._id },
              { headers: { Authorization: `Bearer ${access_token}` } },
            )
            .then(({ data }) => setIsFollowingAuthor(data.is_following))
            .catch((err) => console.log(err));
        }

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

  const handleFollowAuthor = () => {
    if (!access_token) {
      return toast.error("Vui lòng đăng nhập để theo dõi");
    }

    // Toggle local state for instant feedback
    const newStatus = !isFollowingAuthor;
    setIsFollowingAuthor(newStatus);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/users/follow-user",
        { target_id: authorId },
        { headers: { Authorization: `Bearer ${access_token}` } },
      )
      .then(({ data }) => {
        setIsFollowingAuthor(data.followed_status);
        toast.success(
          data.followed_status
            ? `Đã theo dõi ${fullname}`
            : `Đã bỏ theo dõi ${fullname}`,
        );
      })
      .catch((err) => {
        setIsFollowingAuthor(!newStatus); // Revert on error
        console.log(err);
        toast.error("Không thể cập nhật trạng thái theo dõi");
      });
  };

  const resetStates = () => {
    setBlog(blogStructure);
    setSimilrBlogs(null);
    setLoading(true);
    setLikedByUser(false);
    setSavedByUser(false);
    setTotalParentCommentsLoaded(0);
    setReadingProgress(0);
    setIsFollowingAuthor(false);
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
            isSavedByUser,
            setSavedByUser,
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

          <div
            ref={contentRef}
            className="text-black min-h-screen bg-slate-50 py-8"
          >
            <div className="max-w-[1200px] mx-auto px-4 lg:px-8 flex flex-col lg:flex-row gap-8 items-start">
              {/* ── LEFT COLUMN (Article + Comments) ── */}
              <div className="flex-1 min-w-0 w-full">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500 mb-6 capitalize tracking-wide">
                  {tags && tags.length > 0 ? (
                    <>
                      <span>{tags[0]}</span>
                      {tags[1] && (
                        <>
                          <i className="fi fi-rr-angle-small-right text-slate-400"></i>
                          <span>{tags[1]}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <span>Article</span>
                  )}
                </div>

                {/* MAIN ARTICLE CARD */}
                <article className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm mb-10">
                  {/* Card Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-semibold tracking-wide">
                      {translations.post || "Post"}
                    </span>
                    <span className="text-[13px] text-slate-400 font-medium">
                      Posted {new Date(publishedAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-[40px] font-bold text-slate-900 leading-[1.15] mb-6 tracking-tight">
                    {title}
                  </h1>

                  {/* Description (Optional, since sometimes it's just content) */}
                  {des && (
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                      {des}
                    </p>
                  )}

                  {/* Banner */}
                  {hasRealBanner && (
                    <div
                      className="w-full aspect-video rounded-xl overflow-hidden shadow-md cursor-zoom-in mb-8 border border-slate-100"
                      onClick={() => setFullScreenImage(banner)}
                    >
                      <img
                        src={banner}
                        className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                        onError={handleBannerError}
                        alt="Banner"
                      />
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="blog-page-content font-inter leading-relaxed text-slate-800 text-[1.05rem]">
                    {content[0].blocks.map((block, i) => (
                      <div key={i} className="my-5 md:my-7">
                        <BlogContent block={block} />
                      </div>
                    ))}
                  </div>

                  {/* Card Footer (Tags + Interactions) */}
                  <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100 flex-wrap gap-4">
                    {/* Left: Tags */}
                    <div className="flex flex-wrap gap-2">
                      {tags &&
                        tags.map((tag, i) => (
                          <span
                            key={i}
                            className="bg-slate-50 text-slate-500 text-[12px] px-3 py-1.5 rounded-md font-medium border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>

                    {/* Right: Interactions */}
                    <BlogInteraction />
                  </div>
                </article>

                {/* Comments */}
                <div className="mb-10">
                  <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
                    Comments{" "}
                    <span className="text-slate-400 font-medium text-lg">
                      ({activity?.total_comments || 0})
                    </span>
                  </h4>
                  <CommentsContainer />
                </div>
              </div>

              {/* ── RIGHT SIDEBAR ── */}
              <aside className="w-full lg:w-[320px] flex-shrink-0 space-y-6 lg:sticky lg:top-[100px]">
                {/* Author Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center text-center shadow-sm">
                  <Link to={`/user/${author_username}`} className="mb-4">
                    <img
                      src={profile_img}
                      className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm hover:scale-105 transition-transform"
                      alt={fullname}
                    />
                  </Link>
                  <Link to={`/user/${author_username}`}>
                    <h3 className="font-bold text-lg text-slate-900 hover:text-indigo-600 transition-colors">
                      {fullname}
                    </h3>
                  </Link>
                  <p className="text-[13px] text-slate-500 mb-6">
                    @{author_username}
                  </p>

                  {/* Stats Grid */}
                  <div className="flex items-center justify-center gap-8 w-full border-t border-slate-100 pt-5 mb-6">
                    <div className="text-center">
                      <p className="font-bold text-indigo-600 text-lg leading-none mb-1">
                        {activity?.total_likes > 1000
                          ? (activity.total_likes / 1000).toFixed(1) + "k"
                          : activity?.total_likes || 0}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Rep
                      </p>
                    </div>
                    <div className="w-px h-8 bg-slate-100"></div>
                    <div className="text-center">
                      <p className="font-bold text-slate-900 text-lg leading-none mb-1">
                        {activity?.total_comments || 0}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Posts
                      </p>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button 
                    onClick={handleFollowAuthor}
                    className={`w-full font-medium text-sm py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${isFollowingAuthor ? "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200" : "bg-[#111113] text-white hover:bg-slate-800 shadow-lg shadow-black/5"}`}
                  >
                    <i className={`fi ${isFollowingAuthor ? "fi-rr-user-check" : "fi-rr-user-add"} text-sm`}></i>
                    {isFollowingAuthor ? "Following" : "Follow"}
                  </button>
                </div>

                {/* Related Stream Placeholder */}
                {similarBlogs && similarBlogs.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Related Stream
                    </p>
                    <div className="space-y-4">
                      {similarBlogs.slice(0, 2).map((b, i) => (
                        <Link
                          to={`/blog/${b.blog_id}`}
                          key={i}
                          className="block group"
                        >
                          <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors mb-1 line-clamp-2 leading-tight">
                            {b.title}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {b.activity?.total_comments || 0} replies •{" "}
                            {new Date(b.publishedAt).toLocaleDateString(
                              "en-GB",
                            )}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
            {/* end unified container */}

            {/* ═══════════ SIMILAR BLOGS ═══════════ */}
            {similarBlogs != null && similarBlogs.length > 0 && (
              <div className="max-w-[1200px] mx-auto mt-16 mb-24 px-4 sm:px-6">
                <div className="border-t border-slate-200 pt-12">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full flex-shrink-0"></div>
                    <h3 className="text-xl font-bold text-slate-800">
                      {translations.similarPosts}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {similarBlogs.map((blog, i) => {
                      return (
                        <AnimationWrapper
                          key={i}
                          transition={{ duration: 1, delay: i * 0.08 }}
                        >
                          <BlogPostCard
                            content={{ ...blog, layout: "grid" }}
                            author={blog.author}
                          />
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
