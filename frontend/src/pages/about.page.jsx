import { useContext } from "react";
import { ThemeContext, UserContext } from "../App";
import { getTranslations } from "../../translations";
import AnimationWrapper from "../common/page-animation";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { twMerge } from "tailwind-merge";

const BentoCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={twMerge(
      "bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-xl transition-all duration-500 group",
      className
    )}
  >
    {children}
  </motion.div>
);

const AboutPage = () => {
  const { theme } = useContext(ThemeContext);
  const { userAuth } = useContext(UserContext);
  const translations = getTranslations(userAuth.language);
  const navigate = useNavigate();

  return (
    <AnimationWrapper>
      <section
        className={`min-h-screen py-20 px-[5vw] md:px-[10vw] ${theme === "light" ? "bg-[#F8FAFC]" : "bg-[#09090B]"} transition-colors duration-500 font-inter`}
      >
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-16 text-center md:text-left">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full border border-indigo-100 dark:border-indigo-500/20 mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400">
              Our Identity
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none font-jakarta">
            Empowering Scholars.
          </h1>
        </div>

        {/* Bento Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-auto">
          {/* Hero: Mission */}
          <BentoCard className="md:col-span-12 lg:col-span-8 flex flex-col justify-center min-h-[350px] border-l-8 border-l-indigo-600 overflow-hidden relative">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 opacity-60">
                Our Mission
              </h3>
              <p className="text-3xl md:text-5xl font-bold leading-tight font-jakarta tracking-tight text-slate-900 dark:text-white">
                {translations.aboutUsDes ||
                  "Democratizing education by creating the world's most immersive academic community."}
              </p>
            </div>
          </BentoCard>

          {/* Stats */}
          <BentoCard className="md:col-span-6 lg:col-span-4 bg-slate-900 dark:bg-[#111113] text-white border-none flex flex-col justify-center items-center text-center">
            <div className="grid grid-cols-1 gap-10">
              <div className="space-y-1">
                <p className="text-5xl font-black text-emerald-400 font-jakarta tracking-tighter">
                  10K+
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Active Learners
                </p>
              </div>
              <div className="w-12 h-[1px] bg-white/10 mx-auto"></div>
              <div className="space-y-1">
                <p className="text-5xl font-black text-indigo-400 font-jakarta tracking-tighter">
                  500+
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Knowledge Tags
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Who We Are */}
          <BentoCard className="md:col-span-6 lg:col-span-5" delay={0.1}>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-8">
              The Community
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              EForum isn't just a blog. It's a living ecosystem where students,
              researchers, and experts converge to solve the problems of
              tomorrow.
            </p>
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
              <button className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-3 group">
                Explore Guidelines
                <i className="fi fi-rr-arrow-right group-hover:translate-x-2 transition-transform"></i>
              </button>
            </div>
          </BentoCard>

          {/* Values */}
          <BentoCard
            className="md:col-span-6 lg:col-span-7 border-l-8 border-l-emerald-500 flex flex-col justify-between overflow-hidden relative"
            delay={0.2}
          >
            <div className="absolute top-0 right-0 p-10 text-emerald-500/10">
              <i className="fi fi-rr-bulb text-[120px]"></i>
            </div>
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 opacity-60 mb-10">
                Core Principles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h4 className="font-black text-xl font-jakarta text-slate-900 dark:text-white">
                    Open Source
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Knowledge belongs to everyone. No paywalls, no barriers.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-xl font-jakarta text-slate-900 dark:text-white">Integrity</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Peer-reviewed thinking and rigorous factual standards.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-xl font-jakarta text-slate-900 dark:text-white">Velocity</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Fast-paced discussion for a fast-changing world.
                  </p>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Final CTA */}
          <BentoCard
            className="md:col-span-12 lg:col-span-12 flex flex-col md:flex-row items-center justify-between gap-12 border-l-8 border-l-indigo-600"
            delay={0.3}
          >
            <div className="max-w-2xl">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter font-jakarta leading-tight">
                Your knowledge is the catalyst.
              </h3>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                Become a contributor and join the ranks of the community's elite
                scholars.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button
                onClick={() => navigate("/signup")}
                className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase tracking-widest text-xs"
              >
                Start Writing
              </button>
              <button
                onClick={() => navigate("/chat")}
                className="px-10 py-5 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all uppercase tracking-widest text-xs"
              >
                Join Discussion
              </button>
            </div>
          </BentoCard>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default AboutPage;
