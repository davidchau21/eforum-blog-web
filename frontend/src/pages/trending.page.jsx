import { useContext, useEffect, useState } from "react";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import { ThemeContext, UserContext } from "../App";
import { getTranslations } from "../../translations";
import { MinimalBlogSkeleton } from "../components/skeleton.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import NoDataMessage from "../components/nodata.component";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* ─── Modern Editorial Bento (Frontend Design) ───────────────────────────
   Aesthetic: "Editorial Academic" — clean, authoritative, yet dynamic.
   DFII Score: 14 (High Impact, High Fit)
   
   Tokens:
     primary   = #6366F1 (Indigo - Site Theme)
     accent    = #10B981 (Emerald - Success/Live)
     surface   = #F8FAFC (Standard Light) / #09090B (Standard Dark)
     text      = #0F172A / #F8FAFC
     typography= Plus Jakarta Sans (Headers), Inter (Body)
──────────────────────────────────────────────────────────────────────────── */

import { twMerge } from "tailwind-merge";

const BentoCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={twMerge(
      "bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_50px_rgba(99,102,241,0.08)] transition-all duration-500 group",
      className
    )}
  >
    {children}
  </motion.div>
);

const TrendingPage = () => {
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
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
  };

  return (
    <AnimationWrapper>
      <section
        className={`min-h-screen py-20 px-[5vw] md:px-[10vw] ${theme === "light" ? "bg-[#F8FAFC]" : "bg-[#09090B]"} transition-colors duration-500 font-inter`}
      >
        {/* Dynamic Header */}
        <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-full border border-indigo-100 dark:border-indigo-500/20">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">
                Live Insights
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] font-jakarta">
              {translations.trending || "Trending"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-md">
              Curated intelligence from the forefront of the academic community.
            </p>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-auto">
          {/* Hero: #1 Trending Article */}
          <BentoCard className="md:col-span-12 lg:col-span-8 row-span-2 min-h-[500px] flex flex-col justify-between overflow-hidden relative border-t-8 border-t-indigo-500 shadow-indigo-100/20">
            <div className="absolute top-0 right-0 p-8">
              <div className="text-[60px] font-black text-slate-200/50 dark:text-white/5 font-jakarta select-none">
                01
              </div>
            </div>

            <div className="relative z-10 space-y-8">
              <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                Top Performer
              </span>

              {trendingBlogs == null ? (
                <MinimalBlogSkeleton />
              ) : trendingBlogs.length ? (
                <div className="space-y-6">
                  <h2
                    className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight font-jakarta cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() =>
                      navigate(`/blog/${trendingBlogs[0].blog_id}`)
                    }
                  >
                    {trendingBlogs[0].title}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg line-clamp-3 font-medium leading-relaxed max-w-2xl">
                    {trendingBlogs[0].des}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="relative z-10 flex items-center justify-between pt-10 border-t border-slate-100 dark:border-white/5">
              {trendingBlogs?.length ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-800">
                    <img
                      src={trendingBlogs[0].author.personal_info.profile_img}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white font-jakarta">
                      {trendingBlogs[0].author.personal_info.fullname}
                    </p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                      @{trendingBlogs[0].author.personal_info.username}
                    </p>
                  </div>
                </div>
              ) : null}
              <button
                onClick={() => navigate(`/blog/${trendingBlogs?.[0]?.blog_id}`)}
                className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl"
              >
                <i className="fi fi-rr-arrow-right text-lg"></i>
              </button>
            </div>
          </BentoCard>

          {/* Right Column Cards */}
          <div className="md:col-span-12 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8">
            {/* Topics Card */}
            <BentoCard className="border-l-8 border-l-indigo-600 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                 <i className="fi fi-rr-tags text-[100px] -rotate-12"></i>
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 opacity-60 mb-6">
                Trending Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/search/${tag}`)}
                    className="px-3 py-2 bg-slate-50 dark:bg-white/5 hover:bg-indigo-600 text-slate-600 dark:text-slate-300 hover:text-white text-[11px] font-bold rounded-xl transition-all border border-slate-100 dark:border-white/5 shadow-sm"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </BentoCard>

            {/* Top Contributors Card */}
            <BentoCard className="dark:bg-indigo-500/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-8">
                Elite Scholars
              </h3>
              <div className="space-y-6">
                {topContributors.slice(0, 3).map((user, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 group cursor-pointer"
                    onClick={() =>
                      navigate(`/user/${user.personal_info.username}`)
                    }
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5">
                      <img
                        src={user.personal_info.profile_img}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-jakarta truncate group-hover:text-indigo-500 transition-colors">
                        {user.personal_info.fullname}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          Rep: {user.account_info.total_reads}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Rising List */}
          <BentoCard className="md:col-span-12 lg:col-span-12">
            <div className="flex items-center justify-between mb-10 border-b border-slate-100 dark:border-white/5 pb-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                Rising Knowledge
              </h3>
              <button className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest hover:underline">
                View Global Index
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {trendingBlogs?.slice(1, 10).map((blog, i) => (
                <div
                  key={i}
                  className="hover:translate-x-2 transition-transform duration-300"
                >
                  <MinimalBlogPost blog={blog} index={i + 1} />
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default TrendingPage;
