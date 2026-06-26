import { useContext, useEffect, useState } from "react";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import { ThemeContext, UserContext } from "../App";
import { getTranslations } from "../../translations";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

const BentoCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={twMerge(
      "bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_20px_50px_rgba(99,102,241,0.06)] dark:hover:border-indigo-500/15 transition-all duration-500 group relative overflow-hidden",
      className
    )}
  >
    {children}
  </motion.div>
);

const RisingListRow = ({ blog, index, navigate }) => {
  const { title, blog_id: id, author, publishedAt, banner, activity } = blog || {};
  const { personal_info: { username, fullname, profile_img } = {} } = author || {};
  const isDefaultBanner = banner === "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg";

  const getDisplayDate = (date) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffTime = Math.abs(now - publishedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return `${diffDays} ngày trước`;
    return publishedDate.toLocaleDateString("en-GB");
  };

  return (
    <div
      onClick={() => navigate(`/blog/${id}`)}
      className="group flex items-center justify-between py-5 border-b border-slate-100 dark:border-white/5 last:border-b-0 cursor-pointer hover:bg-slate-50/30 dark:hover:bg-white/[0.01] px-2 rounded-2xl transition-colors duration-200"
    >
      <div className="flex gap-4 items-start flex-1 min-w-0 pr-4">
        {/* Index Rank */}
        <span className="text-xl md:text-2xl font-bold font-jakarta text-slate-300 dark:text-zinc-700 group-hover:text-indigo-500 transition-colors w-8 shrink-0 text-left pt-0.5">
          {index < 10 ? `0${index}` : index}
        </span>

        {/* Content info */}
        <div className="space-y-1.5 min-w-0 text-left">
          <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-1 font-jakarta">
            {title}
          </h4>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span className="font-bold text-slate-500 dark:text-slate-450">@{username}</span>
            <span>•</span>
            <span className="truncate max-w-[120px]">{fullname}</span>
            <span>•</span>
            <span>{getDisplayDate(publishedAt)}</span>
          </div>
        </div>
      </div>

      {/* Stats and Thumbnail wrapper */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="hidden sm:flex items-center gap-3.5 text-xs font-bold text-slate-400 dark:text-slate-500">
          {activity?.total_reads !== undefined && (
            <span className="flex items-center gap-1">
              <i className="fi fi-rr-eye text-[11px]"></i>
              {activity.total_reads}
            </span>
          )}
          {activity?.total_likes !== undefined && (
            <span className="flex items-center gap-1">
              <i className="fi fi-rr-heart text-[11px]"></i>
              {activity.total_likes}
            </span>
          )}
        </div>

        {banner && !isDefaultBanner && (
          <div className="w-16 h-12 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 shrink-0 shadow-sm">
            <img src={banner} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
      </div>
    </div>
  );
};

const HeroSkeleton = () => (
  <div className="animate-pulse grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
    <div className="md:col-span-7 space-y-6">
      <div className="w-24 h-5 bg-slate-200 dark:bg-zinc-800/80 rounded-full" />
      <div className="space-y-3">
        <div className="w-full h-8 bg-slate-200 dark:bg-zinc-800/80 rounded-xl" />
        <div className="w-4/5 h-8 bg-slate-200 dark:bg-zinc-800/80 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-4 bg-slate-100 dark:bg-zinc-800/40 rounded-full" />
        <div className="w-full h-4 bg-slate-100 dark:bg-zinc-800/40 rounded-full" />
        <div className="w-2/3 h-4 bg-slate-100 dark:bg-zinc-800/40 rounded-full" />
      </div>
      <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800/80" />
        <div className="space-y-1.5">
          <div className="w-24 h-3.5 bg-slate-200 dark:bg-zinc-800/80 rounded-full" />
          <div className="w-16 h-2 bg-slate-100 dark:bg-zinc-800/40 rounded-full" />
        </div>
      </div>
    </div>
    <div className="md:col-span-5">
      <div className="w-full h-48 md:h-60 rounded-2xl bg-slate-200 dark:bg-zinc-800/60" />
    </div>
  </div>
);

const ScholarSkeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-2">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-800/60" />
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800/60" />
          <div className="space-y-1.5">
            <div className="w-24 h-3 bg-slate-200 dark:bg-zinc-800/60 rounded-full" />
            <div className="w-16 h-2 bg-slate-100 dark:bg-zinc-800/30 rounded-full" />
          </div>
        </div>
        <div className="w-8 h-6 bg-slate-200 dark:bg-zinc-800/60 rounded-lg" />
      </div>
    ))}
  </div>
);

const GroupSkeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800/60 shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0 text-left">
            <div className="w-24 h-3 bg-slate-200 dark:bg-zinc-800/60 rounded-full" />
            <div className="w-16 h-2 bg-slate-100 dark:bg-zinc-800/30 rounded-full mt-1" />
          </div>
        </div>
        <div className="w-8 h-6 bg-slate-200 dark:bg-zinc-800/60 rounded-lg shrink-0 ml-4" />
      </div>
    ))}
  </div>
);

const TagsSkeleton = () => (
  <div className="animate-pulse flex flex-wrap gap-2 w-full">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="w-20 h-8 bg-slate-200 dark:bg-zinc-800/60 rounded-xl" />
    ))}
  </div>
);

const RisingSkeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-white/5 last:border-b-0 px-2">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-8 h-8 bg-slate-200 dark:bg-zinc-800/60 rounded-lg" />
          <div className="space-y-2 flex-1">
            <div className="w-3/4 h-4 bg-slate-200 dark:bg-zinc-800/60 rounded-full" />
            <div className="w-1/2 h-2.5 bg-slate-100 dark:bg-zinc-800/40 rounded-full" />
          </div>
        </div>
        <div className="w-16 h-12 bg-slate-200 dark:bg-zinc-800/60 rounded-xl ml-4" />
      </div>
    ))}
  </div>
);

const TrendingPage = () => {
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [trendingGroups, setTrendingGroups] = useState([]);
  const { theme } = useContext(ThemeContext);
  const { userAuth } = useContext(UserContext);
  const translations = getTranslations(userAuth.language);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingData();
  }, []);

  const fetchTrendingData = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/trending-blogs")
      .then(({ data }) => setTrendingBlogs(data.blogs))
      .catch((err) => console.log(err));

    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/trending-topics")
      .then(({ data }) => setTrendingTopics(data.topics))
      .catch((err) => console.log(err));

    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/top-contributors")
      .then(({ data }) => setTopContributors(data.contributors))
      .catch((err) => console.log(err));

    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/groups/trending")
      .then(({ data }) => setTrendingGroups(data.groups))
      .catch((err) => console.log(err));
  };

  const isDefaultHeroBanner =
    trendingBlogs?.[0]?.banner ===
    "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg";

  return (
    <AnimationWrapper>
      <section
        className={`min-h-screen py-20 px-[5vw] md:px-[10vw] relative overflow-hidden transition-colors duration-500 font-inter ${
          theme === "light" ? "bg-[#F8FAFC]" : "bg-[#09090B]"
        }`}
      >
        {/* Ambient background glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[130px]" />
          <div className="absolute bottom-[15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-emerald-500/5 dark:bg-emerald-600/5 blur-[160px]" />
          <div className="absolute top-[35%] left-[50%] w-[500px] h-[500px] rounded-full bg-purple-500/5 dark:bg-purple-600/5 blur-[120px]" />
        </div>

        {/* Header Block */}
        <div className="max-w-7xl mx-auto mb-16 flex flex-col items-start gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50/80 dark:bg-indigo-500/10 rounded-full border border-indigo-100 dark:border-indigo-500/20 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] font-jakarta">
                Live Pulse
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95] font-jakarta">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-white dark:via-indigo-100 dark:to-indigo-200">
                {translations.trending || "Trending"}
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-md">
              Curated intelligence from the forefront of the academic community.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-3xl pt-4">
            <div className="bg-white/40 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 backdrop-blur-md shadow-sm text-left">
              <p className="text-xs text-slate-400 dark:text-slate-50 font-bold uppercase tracking-wider">Trending Stories</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-jakarta">
                {trendingBlogs ? trendingBlogs.length : 0}
              </p>
            </div>
            <div className="bg-white/40 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 backdrop-blur-md shadow-sm text-left">
              <p className="text-xs text-slate-400 dark:text-slate-50 font-bold uppercase tracking-wider">Elite Scholars</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-jakarta">
                {topContributors ? topContributors.length : 0}
              </p>
            </div>
            <div className="bg-white/40 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 backdrop-blur-md shadow-sm text-left">
              <p className="text-xs text-slate-400 dark:text-slate-50 font-bold uppercase tracking-wider">Hot Topics</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-jakarta">
                {trendingTopics ? trendingTopics.length : 0}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Column Layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10 items-start">
          
          {/* Left Column: Featured and Rising List (Span 8) */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            
            {/* Bento Card #1: Hero Article */}
            <BentoCard className="border-t-4 border-t-indigo-500/80 min-h-[380px] flex items-center">
              {trendingBlogs === null ? (
                <HeroSkeleton />
              ) : trendingBlogs.length ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
                  {/* Content info */}
                  <div className="md:col-span-7 space-y-6 flex flex-col justify-between h-full text-left">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                          #1 Trending
                        </span>
                        {trendingBlogs[0].tags?.[0] && (
                          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                            {trendingBlogs[0].tags[0]}
                          </span>
                        )}
                      </div>

                      <h2
                        className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight font-jakarta cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        onClick={() => navigate(`/blog/${trendingBlogs[0].blog_id}`)}
                      >
                        {trendingBlogs[0].title}
                      </h2>

                      <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed line-clamp-3">
                        {trendingBlogs[0].des}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500 pt-2">
                        {trendingBlogs[0].activity?.total_reads !== undefined && (
                          <span className="flex items-center gap-1.5">
                            <i className="fi fi-rr-eye"></i>
                            {trendingBlogs[0].activity.total_reads} lượt đọc
                          </span>
                        )}
                        {trendingBlogs[0].activity?.total_likes !== undefined && (
                          <span className="flex items-center gap-1.5">
                            <i className="fi fi-rr-heart"></i>
                            {trendingBlogs[0].activity.total_likes} lượt thích
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 mt-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={trendingBlogs[0].author.personal_info.profile_img}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-zinc-800 shadow"
                        />
                        <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            {trendingBlogs[0].author.personal_info.fullname}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mt-0.5">
                            @{trendingBlogs[0].author.personal_info.username}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/blog/${trendingBlogs[0].blog_id}`)}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 dark:bg-white dark:hover:bg-indigo-50 dark:hover:text-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all shadow-md group/btn"
                      >
                        Chi tiết
                        <i className="fi fi-rr-arrow-right group-hover/btn:translate-x-1 transition-transform"></i>
                      </button>
                    </div>
                  </div>

                  {/* Banner wrapper */}
                  <div className="md:col-span-5 w-full">
                    {trendingBlogs[0].banner && !isDefaultHeroBanner ? (
                      <div
                        onClick={() => navigate(`/blog/${trendingBlogs[0].blog_id}`)}
                        className="w-full h-48 md:h-60 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/5 cursor-pointer relative group/banner shadow-lg"
                      >
                        <img
                          src={trendingBlogs[0].banner}
                          className="w-full h-full object-cover group-hover/banner:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover/banner:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ) : (
                      <div
                        onClick={() => navigate(`/blog/${trendingBlogs[0].blog_id}`)}
                        className="w-full h-48 md:h-60 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 cursor-pointer relative overflow-hidden group/banner flex items-center justify-center border border-white/10 shadow-lg shadow-indigo-500/10"
                      >
                        <div className="absolute -inset-10 bg-grid-pattern opacity-10"></div>
                        <i className="fi fi-rr-document text-6xl text-white/20 group-hover/banner:scale-110 transition-transform duration-500"></i>
                        <div className="absolute bottom-4 left-4 right-4 bg-white/10 dark:bg-black/20 backdrop-blur-md p-3.5 rounded-xl border border-white/20">
                          <p className="text-white text-xs font-bold font-jakarta line-clamp-1">{trendingBlogs[0].title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 w-full text-slate-400">Chưa có bài viết thịnh hành nào.</div>
              )}
            </BentoCard>

            {/* Bento Card #2: Rising List Container */}
            <BentoCard className="w-full">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <i className="fi fi-rr-chart-histogram text-indigo-500"></i>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Danh sách thịnh hành tiếp theo
                  </h3>
                </div>
              </div>

              {trendingBlogs === null ? (
                <RisingSkeleton />
              ) : trendingBlogs.length <= 1 ? (
                <div className="text-center py-10 text-slate-400 font-semibold text-sm">
                  Không có bài viết thịnh hành nào khác.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {trendingBlogs.slice(1, 10).map((blog, i) => (
                    <RisingListRow key={i} blog={blog} index={i + 2} navigate={navigate} />
                  ))}
                </div>
              )}
            </BentoCard>

          </div>

          {/* Right Column: Sidebar (Span 4) */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8">
            
            {/* Bento Card #3: Trending Tags */}
            <BentoCard className="border-l-4 border-l-indigo-600 bg-white dark:bg-[#111113]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 text-left">
                  Chủ đề nổi bật
                </h3>
                <i className="fi fi-rr-tags text-indigo-500 opacity-60"></i>
              </div>
              
              {trendingTopics.length === 0 ? (
                <TagsSkeleton />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/search/${tag}`)}
                      className="px-3.5 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 hover:scale-[1.02]"
                    >
                      <i className="fi fi-rr-hashtag text-[10px] opacity-60"></i>
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </BentoCard>

            {/* Bento Card #4: Elite Scholars */}
            <BentoCard className="border-l-4 border-l-emerald-500 bg-white dark:bg-[#111113]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 text-left">
                  Độc giả & Tác giả tiêu biểu
                </h3>
                <i className="fi fi-rr-trophy text-emerald-500 opacity-60"></i>
              </div>

              <div className="space-y-4">
                {topContributors.length === 0 ? (
                  <ScholarSkeleton />
                ) : (
                  topContributors.slice(0, 3).map((user, i) => {
                    const rankColors = [
                      "bg-amber-500 text-white shadow-amber-500/20",
                      "bg-slate-400 text-white shadow-slate-400/20",
                      "bg-amber-700 text-white shadow-amber-700/20",
                    ];
                    return (
                      <div
                        key={i}
                        onClick={() => navigate(`/user/${user.personal_info.username}`)}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-slate-100 dark:hover:border-white/5 cursor-pointer group transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <span className={twMerge("w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black font-jakarta shadow-md", rankColors[i] || "bg-slate-200 text-slate-700")}>
                            {i + 1}
                          </span>
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 ring-2 ring-transparent group-hover:ring-indigo-500/20 transition-all duration-300">
                            <img src={user.personal_info.profile_img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {user.personal_info.fullname}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-none mt-0.5">
                              @{user.personal_info.username}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-700 dark:text-slate-300">{user.account_info.total_reads}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">reads</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </BentoCard>

            {/* Bento Card #5: Trending Groups */}
            <BentoCard className="border-l-4 border-l-purple-500 bg-white dark:bg-[#111113]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 text-left">
                  Cộng đồng nổi bật
                </h3>
                <i className="fi fi-rr-users text-purple-500 opacity-60"></i>
              </div>

              <div className="space-y-4">
                {trendingGroups.length === 0 ? (
                  <GroupSkeleton />
                ) : (
                  trendingGroups.slice(0, 3).map((group, i) => {
                    const initialsUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(group.name || "Group")}&backgroundColor=b3c5fc`;
                    return (
                      <div
                        key={i}
                        onClick={() => navigate(`/group/${group._id}`)}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-slate-100 dark:hover:border-white/5 cursor-pointer group transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 ring-2 ring-transparent group-hover:ring-purple-500/20 transition-all duration-300 shrink-0">
                            <img
                              src={group.avatar || initialsUrl}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                              {group.name}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-none mt-1 line-clamp-1">
                              {group.description || "Không có mô tả."}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-xs font-black text-slate-700 dark:text-slate-300">{group.totalMembers}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">members</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </BentoCard>

          </div>

        </div>
      </section>
    </AnimationWrapper>
  );
};

export default TrendingPage;
