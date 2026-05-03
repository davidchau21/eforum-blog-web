import { useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Search,
  MessageSquare,
  Edit3,
} from "lucide-react";
import logoIcon from "../imgs/logo.png";
import logoDark from "../imgs/logo-dark.png";
import logoLight from "../imgs/logo-light.png";
import { ThemeContext, UserContext } from "../App";

const VIDEO_URL =
  "https://tuyrmtetzkeollioqxoi.supabase.co/storage/v1/object/public/edublog/Video%20Project.webm";

const LandingPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const { theme } = useContext(ThemeContext);
  const { userAuth } = useContext(UserContext);
  const { access_token, profile_img, username } = userAuth;

  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const videoY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-[#09090B] min-h-screen font-inter selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-100 overflow-hidden text-slate-900 dark:text-slate-50 transition-colors duration-500"
    >
      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-24 flex items-center justify-between px-6 md:px-12 bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
        <Link to="/" className="flex items-center gap-3 group px-2">
          <img
            src={theme === "light" ? logoDark : logoLight}
            className="h-8 w-auto object-contain"
            alt="EFORUM Logo"
          />
          <span className="font-jakarta font-black text-xl tracking-tighter uppercase">
            EFORUM
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {access_token ? (
            <>
              <Link
                to="/feed"
                className="hidden sm:block font-bold text-sm hover:text-indigo-600 transition-colors uppercase tracking-widest"
              >
                Go to Feed
              </Link>
              <Link
                to={`/user/${username}`}
                className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-all"
              >
                <img
                  src={profile_img}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="hidden sm:block font-bold text-xs hover:text-indigo-600 transition-colors uppercase tracking-widest"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-none font-jakarta font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2"
              >
                Get Started <ArrowUpRight size={14} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Section (Academic Editorial) ──────────────────── */}
      <section className="relative pt-40 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto min-h-screen flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Typography */}
          <motion.div
            style={{ y: heroY }}
            className="lg:col-span-7 flex flex-col justify-center z-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Vol. 1 — The New Standard
              </span>
            </div>

            <h1 className="font-jakarta font-black text-6xl md:text-[5.5rem] lg:text-[7rem] leading-[0.9] tracking-tighter mb-8 uppercase text-balance">
              Knowledge <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-400 italic font-medium pr-4">
                Amplified.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl font-medium leading-relaxed mb-12">
              Khám phá, chia sẻ và kết nối tri thức cùng cộng đồng học thuật
              chuyên nghiệp. Nơi ý tưởng trở thành hành động.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <Link
                to="/feed"
                className="px-8 py-4 bg-indigo-600 text-white font-jakarta font-bold text-sm uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900 transition-all flex items-center gap-3 shadow-lg shadow-indigo-500/20"
              >
                {access_token ? "Go to Feed" : "Explore Platform"}
                <ArrowUpRight size={18} />
              </Link>
              <div className="flex items-center gap-4 hidden sm:flex">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white dark:border-[#09090B] overflow-hidden"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=e2e8f0`}
                        className="w-full h-full object-cover"
                        alt="User avatar"
                      />
                    </div>
                  ))}
                </div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-tight">
                  Join 15K+ <br /> Scholars
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Video / Figure */}
          <motion.div
            style={{ y: videoY }}
            className="lg:col-span-5 relative mt-12 lg:mt-0"
          >
            <div className="p-2 border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-900 group">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                >
                  <source src={VIDEO_URL} type="video/webm" />
                </video>

                {/* Academic Labels */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-sm font-mono text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white border border-slate-200 dark:border-white/10">
                    Fig 1.0
                  </span>
                  <span className="px-2 py-1 bg-indigo-600/90 backdrop-blur-sm font-mono text-[10px] font-bold uppercase tracking-widest text-white border border-indigo-500">
                    Live Feed
                  </span>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-transparent">
                <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                  Interactive UI Demonstration
                </p>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Horizontal Marquee Metrics ────────────────────────────── */}
      <section className="border-y border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] py-8 overflow-hidden flex items-center">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          className="flex whitespace-nowrap gap-16 md:gap-32 px-8 w-max"
        >
          {[
            { v: "15,000+", l: "Active Members" },
            { v: "500+", l: "Knowledge Tags" },
            { v: "20+", l: "Academic Subjects" },
            { v: "24/7", l: "Community Support" },
            { v: "15,000+", l: "Active Members" },
            { v: "500+", l: "Knowledge Tags" },
            { v: "20+", l: "Academic Subjects" },
            { v: "24/7", l: "Community Support" },
          ].map((stat, i) => (
            <div key={i} className="flex items-baseline gap-4">
              <span className="font-jakarta font-black text-3xl md:text-4xl text-slate-900 dark:text-white">
                {stat.v}
              </span>
              <span className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
                {stat.l}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Editorial Features Grid ──────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="mb-16 md:mb-20">
          <h2 className="font-jakarta font-black text-4xl md:text-6xl text-slate-900 dark:text-white uppercase tracking-tighter mb-6 max-w-2xl leading-[1.1]">
            The Infrastructure of Intellect.
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl leading-relaxed">
            Tất cả những công cụ bạn cần để xuất bản, thảo luận và nghiên cứu
            sâu rộng. Được thiết kế cho tốc độ và sự rõ ràng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10">
          <div className="bg-white dark:bg-[#09090B] p-10 lg:p-16 flex flex-col justify-between group hover:bg-slate-50 dark:hover:bg-[#111113] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <BookOpen size={150} strokeWidth={0.5} />
            </div>
            <div className="mb-8 md:mb-12 relative z-10">
              <div className="font-mono text-indigo-500 text-sm font-bold tracking-widest mb-6">
                01.
              </div>
              <BookOpen
                size={32}
                strokeWidth={1.5}
                className="text-slate-900 dark:text-white mb-6 md:mb-8 group-hover:scale-110 transition-transform origin-left"
              />
              <h3 className="font-jakarta font-black text-2xl md:text-3xl uppercase tracking-tight mb-4">
                Smart Feed
              </h3>
              <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
                Thuật toán cá nhân hóa giúp bạn tìm thấy kiến thức phù hợp nhất
                với sở thích và mục tiêu học tập.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#09090B] p-10 lg:p-16 flex flex-col justify-between group hover:bg-slate-50 dark:hover:bg-[#111113] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <Search size={150} strokeWidth={0.5} />
            </div>
            <div className="mb-8 md:mb-12 relative z-10">
              <div className="font-mono text-indigo-500 text-sm font-bold tracking-widest mb-6">
                02.
              </div>
              <Search
                size={32}
                strokeWidth={1.5}
                className="text-slate-900 dark:text-white mb-6 md:mb-8 group-hover:scale-110 transition-transform origin-left"
              />
              <h3 className="font-jakarta font-black text-2xl md:text-3xl uppercase tracking-tight mb-4">
                Deep Search
              </h3>
              <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
                Hệ thống truy xuất tài liệu và bài giảng mạnh mẽ, lọc thông minh
                chính xác đến từng từ khóa.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#09090B] p-10 lg:p-16 flex flex-col justify-between group hover:bg-slate-50 dark:hover:bg-[#111113] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <MessageSquare size={150} strokeWidth={0.5} />
            </div>
            <div className="mb-8 md:mb-12 relative z-10">
              <div className="font-mono text-indigo-500 text-sm font-bold tracking-widest mb-6">
                03.
              </div>
              <MessageSquare
                size={32}
                strokeWidth={1.5}
                className="text-slate-900 dark:text-white mb-6 md:mb-8 group-hover:scale-110 transition-transform origin-left"
              />
              <h3 className="font-jakarta font-black text-2xl md:text-3xl uppercase tracking-tight mb-4">
                Live Discourse
              </h3>
              <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
                Trao đổi trực tiếp và thời gian thực với mạng lưới chuyên gia,
                giảng viên ưu tú toàn cầu.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#09090B] p-10 lg:p-16 flex flex-col justify-between group hover:bg-slate-50 dark:hover:bg-[#111113] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <Edit3 size={150} strokeWidth={0.5} />
            </div>
            <div className="mb-8 md:mb-12 relative z-10">
              <div className="font-mono text-indigo-500 text-sm font-bold tracking-widest mb-6">
                04.
              </div>
              <Edit3
                size={32}
                strokeWidth={1.5}
                className="text-slate-900 dark:text-white mb-6 md:mb-8 group-hover:scale-110 transition-transform origin-left"
              />
              <h3 className="font-jakarta font-black text-2xl md:text-3xl uppercase tracking-tight mb-4">
                Advanced Editor
              </h3>
              <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
                Trình soạn thảo khối chuẩn mực, hỗ trợ đa định dạng, markdown,
                toán học và mã lập trình.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brutalist CTA ───────────────────────────────── */}
      <section className="border-t border-slate-200 dark:border-white/10 bg-indigo-600 text-white">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row">
          <div className="flex-1 p-12 md:p-24 lg:border-r border-white/20 flex flex-col justify-center">
            <h2 className="font-jakarta font-black text-5xl md:text-7xl uppercase tracking-tighter leading-[0.9] mb-8">
              Publish. <br /> Debate. <br /> Evolve.
            </h2>
            <p className="text-indigo-100 text-xl font-medium max-w-md mb-12 leading-relaxed">
              Trở thành một phần của hệ sinh thái tri thức đẳng cấp nhất hiện
              nay.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={access_token ? "/feed" : "/signup"}
                className="px-8 py-4 bg-white text-indigo-900 font-jakarta font-bold text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-3"
              >
                {access_token ? "Enter Dashboard" : "Create Account"}{" "}
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          <div className="flex-1 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center grayscale mix-blend-multiply opacity-50 min-h-[300px] lg:min-h-full"></div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
