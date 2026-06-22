import { useContext } from "react";
import { ThemeContext, UserContext } from "../App";
import { getTranslations } from "../../translations";
import AnimationWrapper from "../common/page-animation";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const { theme } = useContext(ThemeContext);
  const { userAuth } = useContext(UserContext);
  const language = userAuth?.language || "vi";
  const translations = getTranslations(language);
  const navigate = useNavigate();

  const isVi = language === "vi";

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <AnimationWrapper>
      <section
        className={`min-h-screen py-24 px-[6vw] md:px-[12vw] transition-colors duration-500 font-inter ${
          theme === "light"
            ? "bg-[#FCFCFC] text-slate-900"
            : "bg-[#09090B] text-slate-100"
        }`}
      >
        {/* Subtle grid background for high-end editorial look */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-12 mb-16">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 mb-4"
            >
              {isVi ? "CHÚNG TÔI LÀ EFORUM" : "WE ARE EFORUM"}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight font-jakarta mb-6 leading-tight"
            >
              {isVi
                ? "Nơi tri thức hội tụ và lan tỏa."
                : "Where knowledge converges and grows."}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-light max-w-3xl leading-relaxed"
            >
              {translations.aboutUsDes ||
                (isVi
                  ? "EForum được tạo ra nhằm xóa bỏ rào cản thông tin, cung cấp không gian học thuật mở và chất lượng cao cho cộng đồng học tập toàn cầu."
                  : "EForum was created to break information barriers, providing an open, high-quality academic space for the global learning community.")}
            </motion.p>
          </div>

          {/* Story Rows (Alternating Layout) */}
          <div className="space-y-24 mb-28">
            {/* Row 1 */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center"
            >
              <div className="md:col-span-7 space-y-6">
                <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-500 dark:text-indigo-400 uppercase">
                  {isVi ? "Tầm Nhìn" : "Our Vision"}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-jakarta">
                  {isVi
                    ? "Nền tảng tri thức mở hàng đầu"
                    : "The leading open knowledge platform"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-light">
                  {isVi
                    ? "Chúng tôi tin rằng giáo dục và tri thức nên được tiếp cận một cách tự do nhất. EForum nỗ lực xây dựng môi trường mở để bất kỳ ai cũng có thể chia sẻ tiếng nói chuyên môn, ý kiến nghiên cứu và những bài học bổ ích."
                    : "We believe education and knowledge should be accessed as freely as possible. EForum strives to build an open environment where anyone can share expert voices, research insights, and valuable lessons."}
                </p>
              </div>
              <div className="md:col-span-5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-center h-64">
                <span className="text-6xl font-black text-indigo-500/20 absolute -right-4 -bottom-4 font-jakarta">
                  10K
                </span>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 font-jakarta">
                  10,000+
                </p>
                <p className="text-xs tracking-wider uppercase text-slate-400 font-semibold">
                  {isVi
                    ? "Người dùng đồng hành cùng EForum"
                    : "Scholars sharing on EForum"}
                </p>
              </div>
            </motion.div>

            {/* Row 2 */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center"
            >
              <div className="md:col-span-5 order-last md:order-first bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-center h-64">
                <span className="text-6xl font-black text-emerald-500/20 absolute -right-4 -bottom-4 font-jakarta">
                  500
                </span>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 font-jakarta">
                  500+
                </p>
                <p className="text-xs tracking-wider uppercase text-slate-400 font-semibold">
                  {isVi
                    ? "Thẻ chủ đề được thảo luận sâu rộng"
                    : "Unique subject tags created"}
                </p>
              </div>
              <div className="md:col-span-7 space-y-6">
                <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-500 dark:text-emerald-400 uppercase">
                  {isVi ? "Cộng Đồng" : "Our Community"}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-jakarta">
                  {isVi
                    ? "Nơi đối thoại văn minh, sâu sắc"
                    : "A civilized and deep dialogue"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-light">
                  {isVi
                    ? "Tại đây, chất lượng bài viết và tư duy phản biện được đặt lên hàng đầu. Mỗi thành viên đóng góp đều giúp xây dựng nên một thư viện tài liệu học tập khổng lồ và đáng tin cậy."
                    : "Here, quality of posts and critical thinking are placed at the forefront. Every contributing member helps build a massive and trustworthy library of learning materials."}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate("/policy")}
                    className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400"
                  >
                    {isVi ? "Xem Quy Tắc Cộng Đồng" : "Explore Community Rules"}
                    <i className="fi fi-rr-arrow-right group-hover:translate-x-1.5 transition-transform"></i>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Core Pillars (Three Columns with Thin Borders) */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-16 mb-24">
            <div className="text-center md:text-left mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                {isVi ? "BA TRỤ CỘT HÀNH ĐỘNG" : "THREE CORE PILLARS"}
              </span>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-slate-200 dark:divide-slate-800"
            >
              {/* Pillar 1 */}
              <div className="space-y-4 md:px-6 first:pl-0 last:pr-0">
                <div className="text-indigo-600 dark:text-indigo-400 text-3xl font-light">
                  01
                </div>
                <h3 className="text-xl font-bold font-jakarta">
                  {isVi ? "Tự Do Tri Thức" : "Knowledge Freedom"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed font-light">
                  {isVi
                    ? "Chia sẻ không giới hạn và hoàn toàn mở, đưa tri thức đến mọi góc của đời sống học thuật."
                    : "Unlimited and completely open sharing, bringing knowledge to every corner of academic life."}
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="space-y-4 md:px-6">
                <div className="text-emerald-600 dark:text-emerald-400 text-3xl font-light">
                  02
                </div>
                <h3 className="text-xl font-bold font-jakarta">
                  {isVi ? "Liêm Chính Học Thuật" : "Academic Integrity"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed font-light">
                  {isVi
                    ? "Tôn trọng chất xám, nói không với tin giả, đạo văn và các nội dung kém văn minh."
                    : "Respect intelligence, say no to fake news, plagiarism, and uncivilized content."}
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="space-y-4 md:px-6">
                <div className="text-indigo-600 dark:text-indigo-400 text-3xl font-light">
                  03
                </div>
                <h3 className="text-xl font-bold font-jakarta">
                  {isVi ? "Không Ngừng Cải Tiến" : "Continuous Growth"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed font-light">
                  {isVi
                    ? "Tối ưu hóa công cụ viết và lưu trữ để giúp việc truyền tải thông tin đạt tốc độ cao nhất."
                    : "Optimizing writing and storage tools to enable the fastest possible distribution of insights."}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Interactive Invitation Banner */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="border border-slate-200 dark:border-slate-800 rounded-3xl p-10 md:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <h3 className="text-2xl md:text-3xl font-extrabold font-jakarta tracking-tight">
                {isVi
                  ? "Bạn đã sẵn sàng chia sẻ chưa?"
                  : "Ready to share your voice?"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-light leading-relaxed">
                {isVi
                  ? "Hãy đăng ký và đồng hành cùng hàng ngàn tác giả chất lượng khác trên EForum ngay hôm nay."
                  : "Sign up and join thousands of other high-quality writers on EForum today."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <button
                  onClick={() => navigate("/signup")}
                  className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white transition-all text-xs tracking-wider uppercase"
                >
                  {isVi ? "Bắt đầu ngay" : "Get Started"}
                </button>
                <button
                  onClick={() => navigate("/chat")}
                  className="px-8 py-3.5 border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white font-bold rounded-xl transition-all text-xs tracking-wider uppercase text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                >
                  {isVi ? "Trò chuyện" : "Join Discussion"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default AboutPage;
