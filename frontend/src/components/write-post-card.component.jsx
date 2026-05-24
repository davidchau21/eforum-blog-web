/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useContext, useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { getTranslations } from "../../translations";
import { motion, AnimatePresence } from "framer-motion";

const WritePostCard = ({ openModal }) => {
  const {
    userAuth: { access_token, profile_img, language },
  } = useContext(UserContext);
  const translations = getTranslations(language);

  // Dynamic cycling placeholders for academic community vibe
  const placeholders = useMemo(() => {
    return language === "vi"
      ? [
          "Bạn muốn chia sẻ kiến thức gì hôm nay?",
          "Hôm nay bạn học được điều gì mới?",
          "Đặt câu hỏi hoặc tạo thảo luận học tập...",
          "Chia sẻ tài liệu, phương pháp ôn thi bổ ích...",
        ]
      : [
          "What academic knowledge do you want to share today?",
          "What new thing did you learn today?",
          "Ask a question or start a learning discussion...",
          "Share study tips or useful academic resources...",
        ];
  }, [language]);

  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!access_token) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [placeholders, access_token]);

  if (!access_token) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white dark:bg-grey/30 border border-grey dark:border-zinc-800/80 rounded-3xl p-5 mb-8 shadow-sm hover:shadow-md transition-all group overflow-hidden relative cursor-pointer"
      onClick={openModal}
    >
      {/* Premium Background Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

      {/* Main Avatar & Input Row */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative group/avatar">
          <img
            src={profile_img}
            className="w-12 h-12 rounded-full object-cover flex-none ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all duration-300 shadow-sm"
            alt="User profile"
          />
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
        </div>

        <div className="flex-grow bg-grey/40 dark:bg-zinc-800/40 rounded-full h-12 px-6 text-dark-grey/80 dark:text-grey/60 text-sm font-medium hover:bg-grey/60 dark:hover:bg-zinc-800/60 transition-all text-left relative overflow-hidden flex items-center border border-grey/30 dark:border-zinc-800/30">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="absolute left-6 right-6 truncate pointer-events-none select-none"
            >
              {placeholders[currentIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-grey/60 dark:bg-zinc-800/60 my-4 relative z-10" />

      {/* Action Shortcuts with Colorful Accent Visuals */}
      <div className="flex items-center justify-between mt-1 px-1 relative z-10">
        <motion.div
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-transparent hover:bg-sky-500/5 dark:hover:bg-sky-500/10 hover:border-sky-500/10 dark:hover:border-sky-500/20 text-dark-grey dark:text-grey/80 text-xs font-bold transition-all cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center flex-none">
            <i className="fi fi-rr-picture text-sky-500 text-sm mt-0.5"></i>
          </div>
          <span>Photo</span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-transparent hover:bg-rose-500/5 dark:hover:bg-rose-500/10 hover:border-rose-500/10 dark:hover:border-rose-500/20 text-dark-grey dark:text-grey/80 text-xs font-bold transition-all cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center flex-none">
            <i className="fi fi-rr-play-alt text-rose-500 text-sm mt-0.5"></i>
          </div>
          <span>Video</span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-transparent hover:bg-amber-500/5 dark:hover:bg-amber-500/10 hover:border-amber-500/10 dark:hover:border-amber-500/20 text-dark-grey dark:text-grey/80 text-xs font-bold transition-all cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center flex-none">
            <i className="fi fi-rr-grin text-amber-500 text-sm mt-0.5"></i>
          </div>
          <span>Feeling</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WritePostCard;
