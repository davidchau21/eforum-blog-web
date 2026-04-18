/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  useInView,
} from "framer-motion";
import eduIcons from "../imgs/edu-icons.png";
import logoIcon from "../imgs/logo.png";
import logoDark from "../imgs/logo-dark.png";
import logoLight from "../imgs/logo-light.png";
import { ThemeContext, UserContext } from "../App";

const VIDEO_URL =
  "https://tuyrmtetzkeollioqxoi.supabase.co/storage/v1/object/public/edublog/Video%20Project.webm";

/* ─── Components ─────────────────────────────────────────────────── */

const RevealSection = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

const AnimatedCounter = ({ value, label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const target = parseInt(value.replace(/\D/g, ""));
      let start = 0;
      const duration = 2000;
      const stepTime = 16;
      const steps = duration / stepTime;
      const increment = target / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  const suffix = value.replace(/[0-9,]/g, "");

  return (
    <div
      ref={ref}
      className="text-center p-8 rounded-3xl bg-card-premium border border-subtle hover:border-emerald-500/30 transition-all duration-500 group glow-emerald-sm hover:glow-emerald-lg"
    >
      <p className="text-4xl md:text-6xl font-outfit font-black text-title group-hover:text-emerald-500 transition-colors">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="text-sm font-bold text-body uppercase tracking-widest mt-2">
        {label}
      </p>
    </div>
  );
};

const BentoCard = ({ title, desc, icon, color, className, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
    whileHover={{
      y: -8,
      scale: 1.01,
      transition: { duration: 0.2 },
    }}
    className={`bg-card-premium rounded-[2.5rem] p-10 flex flex-col justify-between group shadow-sm hover:shadow-2xl hover:border-emerald-500/30 transition-all hover:glow-emerald-lg ${className}`}
  >
    <div
      className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-3xl transition-transform group-hover:scale-110 group-hover:rotate-6`}
    >
      <i className={icon}></i>
    </div>
    <div>
      <h3 className="font-outfit font-black text-3xl text-title mb-4 uppercase tracking-tight">
        {title}
      </h3>
      <p className="text-body text-lg font-medium leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const FloatingDecoration = ({ x, y, size, delay, row, col }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{
      opacity: [0.1, 0.25, 0.1],
      y: [0, -40, 0],
      rotate: [0, 15, -15, 0],
    }}
    transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}
    className="absolute pointer-events-none grayscale opacity-20 select-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
  >
    <img
      src={eduIcons}
      alt=""
      className="w-full h-full object-contain"
      style={{
        clipPath:
          row === 0 && col === 0
            ? "inset(0 50% 50% 0)"
            : row === 0 && col === 1
              ? "inset(0 0 50% 50%)"
              : row === 1 && col === 0
                ? "inset(50% 50% 0 0)"
                : "inset(50% 0 0 50%)",
        transform: `scale(2.2) translate(${col ? "22%" : "-22%"}, ${row ? "22%" : "-22%"})`,
      }}
    />
  </motion.div>
);

/* ─── Main Landing Page ──────────────────────────────────────────── */

const LandingPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const { theme } = useContext(ThemeContext);
  const { userAuth } = useContext(UserContext);
  const { access_token, profile_img, username } = userAuth;

  const videoScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const videoRotate = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  return (
    <div
      ref={containerRef}
      className="bg-page-primary min-h-screen font-jakarta selection:bg-emerald-100 selection:text-emerald-600 overflow-x-hidden"
    >
      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-[100] h-20 glass-nav-premium flex items-center justify-between px-6 md:px-12">
        <Link
          to="/"
          className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95 px-2"
        >
          <img
            src={theme == "light" ? logoDark : logoLight}
            className="h-10 w-auto object-contain"
            alt="EFORUM Logo"
          />
          <span className="font-outfit font-black text-2xl tracking-tighter text-title uppercase">
            EFORUM
          </span>
        </Link>

        <div className="flex items-center gap-4 md:gap-8">
          {access_token ? (
            <>
              <Link
                to="/feed"
                className="hidden sm:block font-bold text-sm text-body hover:text-emerald-600 transition-colors uppercase tracking-widest"
              >
                Go to Feed
              </Link>
              <Link
                to={`/user/${username}`}
                className="flex items-center gap-2 group"
              >
                <img
                  src={profile_img}
                  className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-emerald-500 transition-all"
                  alt="Profile"
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="hidden sm:block font-bold text-sm text-body hover:text-emerald-600 transition-colors uppercase tracking-widest"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="h-11 px-8 bg-title text-page-primary rounded-full font-outfit font-bold text-sm flex items-center justify-center hover:bg-emerald-500 hover:emerald-glow transition-all"
              >
                GET STARTED
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Section (Always Animate on Load) ──────────────────── */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 pt-32">
        <motion.div
          style={{ y: heroY }}
          className="relative z-10 text-center max-w-5xl mx-auto mb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-emerald-subtle text-emerald-600 px-6 py-2 rounded-full text-xs font-black mb-10 tracking-[0.2em] uppercase border border-emerald-500/10"
          >
            🌟 Smart Discussions for Everyone
          </motion.div>

          <h1 className="font-outfit font-black text-6xl md:text-8xl lg:text-9xl leading-[1.05] tracking-tight text-title mb-10 text-balance uppercase">
            LEARN <span className="text-gradient-emerald">SMARTER</span>, <br />
            CONVERSE BETTER. 🚀
          </h1>

          <p className="text-body text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto mb-12">
            Khám phá, chia sẻ và kết nối tri thức cùng cộng đồng học thuật trẻ
            trung và năng động nhất tại EFORUM.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/feed"
              className="h-16 px-12 bg-emerald-500 text-white rounded-full font-outfit font-black text-xl flex items-center gap-3 emerald-glow hover:scale-105 transition-all"
            >
              {access_token ? "Go to Feed" : "Explore EFORUM"}
              <i className="fi fi-rr-arrow-right mt-1"></i>
            </Link>
            {access_token ? (
              <Link
                to="/dashboard/blogs"
                className="h-16 px-12 bg-page-secondary text-title border border-subtle rounded-full font-outfit font-bold text-lg hover:bg-grey/10 transition-all font-inter uppercase flex items-center justify-center"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() =>
                  window.scrollTo({
                    top: window.innerHeight * 0.9,
                    behavior: "smooth",
                  })
                }
                className="h-16 px-12 bg-page-secondary text-title border border-subtle rounded-full font-outfit font-bold text-lg hover:bg-grey/10 transition-all font-inter uppercase"
              >
                Learn More
              </button>
            )}
          </div>
        </motion.div>

        <div className="relative w-full max-w-6xl aspect-[16/9] mb-[-10vh] px-4">
          <motion.div
            style={{ scale: videoScale, rotate: videoRotate }}
            className="w-full h-full mask-squircle overflow-hidden shadow-2xl relative"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={VIDEO_URL} type="video/webm" />
            </video>
            <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 -left-4 md:-left-12 bg-card-premium p-5 rounded-3xl shadow-xl border border-subtle flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 text-xl font-bold">
              📚
            </div>
            <div>
              <p className="text-title font-black text-lg leading-tight uppercase">
                10k+
              </p>
              <p className="text-body text-xs font-bold uppercase tracking-wider">
                Posts
              </p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-10 -right-4 md:-right-12 bg-card-premium p-5 rounded-3xl shadow-xl border border-subtle flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 text-xl font-bold">
              ✨
            </div>
            <div>
              <p className="text-title font-black text-lg leading-tight uppercase">
                Trendy
              </p>
              <p className="text-body text-xs font-bold uppercase tracking-wider">
                Topics
              </p>
            </div>
          </motion.div>
        </div>

        <FloatingDecoration x={5} y={20} size={100} delay={0} row={0} col={0} />
        <FloatingDecoration x={90} y={15} size={80} delay={1} row={0} col={1} />
      </section>

      {/* ── Stats Section (Scroll Reveal) ────────────────────────────── */}
      <RevealSection className="bg-page-secondary py-40 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-20">
          <div className="flex-1">
            <h2 className="font-outfit font-black text-5xl md:text-7xl text-title tracking-tight leading-tight mb-8">
              TƯƠNG LAI CỦA <br />
              HỌC TẬP <span className="text-gradient-emerald italic">SỐ.</span>
            </h2>
            <p className="text-body text-xl font-medium leading-relaxed max-w-lg">
              Chúng tôi xây dựng một môi trường nơi kiến thức không chỉ là thông
              tin, mà là trải nghiệm và sự kết nối tại EFORUM.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 flex-1 w-full">
            {[
              { val: "15,000+", lab: "Thành viên" },
              { val: "500+", lab: "Chuyên gia" },
              { val: "20+", lab: "Môn học" },
              { val: "24/7", lab: "Hỗ trợ" },
            ].map((s, i) => (
              <AnimatedCounter key={i} value={s.val} label={s.lab} />
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── Bento Features Grid (Scroll Reveal) ──────────────────────── */}
      <RevealSection className="py-40 px-6 bg-page-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-outfit font-black text-5xl md:text-7xl text-title tracking-tight mb-6 uppercase">
              EFORUM ECOSYSTEM
            </h2>
            <p className="text-body text-xl font-medium">
              Tất cả những gì bạn cần để bứt phá tri thức.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BentoCard
              className="md:col-span-2"
              title="Smart Feed"
              desc="Thuật toán cá nhân hóa giúp bạn tìm thấy kiến thức phù hợp nhất với sở thích và mục tiêu học tập của mình."
              icon="fi fi-rr-apps"
              color="bg-emerald-100 text-emerald-600"
              delay={0.1}
            />
            <BentoCard
              title="Quick Search"
              desc="Tìm kiếm tài liệu và bài giảng chỉ trong nháy mắt."
              icon="fi fi-rr-search"
              color="bg-amber-100 text-amber-600"
              delay={0.2}
            />
            <BentoCard
              title="Live Chat"
              desc="Trao đổi trực tiếp với giảng viên và bạn học bất cứ lúc nào."
              icon="fi fi-rr-messages"
              color="bg-emerald-50 text-emerald-500"
              delay={0.3}
            />
            <BentoCard
              className="md:col-span-2"
              title="Modern Editor"
              desc="Trình soạn thảo văn bản mạnh mẽ, hỗ trợ đầy đủ các định dạng nội dung học thuật từ toán học đến mã code."
              icon="fi fi-rr-edit"
              color="bg-purple-100 text-purple-600"
              delay={0.4}
            />
          </div>
        </div>
      </RevealSection>

      {/* ── Modern CTA (Scroll Reveal) ───────────────────────────────── */}
      <RevealSection className="py-40 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto bg-[#0F172A] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden emerald-glow shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#10b98144,transparent)]" />

          <div className="relative z-10">
            <h2 className="font-outfit font-black text-5xl md:text-8xl text-white tracking-[0.1em] mb-12 uppercase cta-heading text-balance">
              BẮT ĐẦU <br />
              <span className="text-emerald-500 italic block mt-4">
                HÀNH TRÌNH
              </span>{" "}
              MỚI
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to={access_token ? "/feed" : "/signup"}
                className="h-20 px-12 bg-white text-black rounded-full font-outfit font-black text-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-2xl group uppercase tracking-widest active:scale-95 hover:glow-emerald-lg"
              >
                {access_token ? "Go to Feed" : "Join EFORUM"}{" "}
                <span className="ml-2 transition-transform group-hover:scale-125">
                  ✨
                </span>
              </Link>
              <Link
                to="/feed"
                className="text-white/60 hover:text-white font-bold text-lg border-b-2 border-white/40 hover:border-emerald-400 transition-all pb-1 tracking-widest uppercase active:scale-95"
              >
                Explore Hub
              </Link>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── Footer handled by App.jsx ────────────────────────────────── */}
    </div>
  );
};

export default LandingPage;
