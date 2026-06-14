import { useRef, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Search,
  MessageSquare,
  Edit3,
  ChevronDown,
  Star,
} from "lucide-react";
import logoIcon from "../imgs/logo.png";
import logoDark from "../imgs/logo-dark.png";
import logoLight from "../imgs/logo-light.png";
import { ThemeContext, UserContext } from "../App";

const VIDEO_URL =
  "https://tuyrmtetzkeollioqxoi.supabase.co/storage/v1/object/public/edublog/Video%20Project.webm";

const FAQ_DATA = {
  vi: [
    {
      q: "EForum là gì?",
      a: "EForum là nền tảng trao đổi và lưu trữ tài nguyên học tập thế hệ mới, cho phép học sinh, giáo viên và các học giả tự do chia sẻ bài viết nghiên cứu, giáo án giảng dạy, cũng như các file slide/PDF hữu ích."
    },
    {
      q: "Tôi có thể tải lên những loại tài liệu nào?",
      a: "Bạn có thể tải lên các tệp tài nguyên dạng PDF, PPT, PPTX (PowerPoint Slide), và DOC, DOCX (Word Document) với giới hạn kích thước tối đa là 15MB cho mỗi tệp."
    },
    {
      q: "EForum có miễn phí không?",
      a: "EForum hoàn toàn miễn phí cho tất cả mọi người. Bạn có thể tự do tìm kiếm tài liệu học thuật hoặc đọc các blog bài viết chia sẻ tri thức mà không tốn bất kỳ chi phí nào."
    },
    {
      q: "Làm sao để lưu lại các bài viết yêu thích?",
      a: "Khi đăng nhập, bạn sẽ thấy biểu tượng Bookmark ở góc mỗi bài viết. Bạn có thể lưu bài viết đó vào thư mục mặc định hoặc tạo các Bộ sưu tập (Collections) tùy biến của riêng mình."
    },
    {
      q: "Tôi có thể xóa tài liệu đã đăng không?",
      a: "Có, bạn hoàn toàn có thể xóa các tài liệu mình đã đăng từ Dashboard cá nhân tại mục 'Tài liệu của tôi' hoặc trực tiếp từ Modal chi tiết tài liệu đó."
    }
  ],
  en: [
    {
      q: "What is EForum?",
      a: "EForum is a next-generation academic sharing and storage platform, enabling students, teachers, and scholars to share research articles, lecture slides, teaching plans, and useful PDF resources."
    },
    {
      q: "What types of documents can I upload?",
      a: "You can upload resource documents in PDF, PPT, PPTX (PowerPoint Slide), and DOC, DOCX (Word Document) formats, with a maximum file size limit of 15MB per file."
    },
    {
      q: "Is EForum free to use?",
      a: "Yes, EForum is completely free for everyone. You can search for academic resources or read knowledge-sharing blog posts without any charges."
    },
    {
      q: "How can I bookmark my favorite posts?",
      a: "Once signed in, you will see a Bookmark icon on each post. You can save posts into your default list or create your own custom Collections."
    },
    {
      q: "Can I delete my uploaded documents?",
      a: "Yes, you can easily delete any documents you have uploaded from your personal Dashboard under 'My Documents' or directly within the document details modal."
    }
  ]
};

const TESTIMONIALS_DATA = {
  vi: [
    {
      role: "Doanh nghiệp",
      name: "Nguyễn Minh Đức",
      title: "L&D Director, VinTech Group",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=DucVinTech&backgroundColor=bde0fe",
      quote: "EForum đã trở thành cầu nối vô giá giúp chúng tôi tiếp cận nguồn tài liệu nghiên cứu chất lượng cao và phát hiện các nhân tài học thuật xuất sắc trực tiếp từ giảng đường.",
      rating: 5
    },
    {
      role: "Tác giả / Nhà nghiên cứu",
      name: "GS. TS. Lê Hoài Nam",
      title: "Giảng viên CNTT, Đại học Bách Khoa",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=ProfNam&backgroundColor=d8f3dc",
      quote: "Trình soạn thảo Markdown chuyên sâu và cộng đồng phản biện tích cực tại EForum giúp các bài viết học thuật của tôi nhận được nhiều đóng góp giá trị trước khi công bố.",
      rating: 5
    },
    {
      role: "Học sinh & Sinh viên",
      name: "Trần Thị Mỹ Linh",
      title: "Sinh viên năm 3, Đại học Quốc Gia",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=LinhStudent&backgroundColor=ffc8dd",
      quote: "Tìm kiếm slide bài giảng, đề ôn tập PDF và thảo luận trực tiếp với tác giả chưa bao giờ dễ dàng đến thế. Nhờ EForum, điểm số học tập của mình đã cải thiện vượt bậc!",
      rating: 5
    }
  ],
  en: [
    {
      role: "Enterprise Partner",
      name: "Devon Nguyen",
      title: "L&D Director, VinTech Group",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=DucVinTech&backgroundColor=bde0fe",
      quote: "EForum has become an invaluable bridge for us to access high-quality research papers and identify outstanding academic talents directly from universities.",
      rating: 5
    },
    {
      role: "Author & Researcher",
      name: "Prof. Dr. Adrian Le",
      title: "IT Professor, University of Science",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=ProfNam&backgroundColor=d8f3dc",
      quote: "The rich Markdown editor and highly active peer feedback loop on EForum have helped my academic preprints receive valuable suggestions before official publication.",
      rating: 5
    },
    {
      role: "Student / Learner",
      name: "Elena Tran",
      title: "Junior Student, National University",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=LinhStudent&backgroundColor=ffc8dd",
      quote: "Finding lecture slides, exam prep files, and discussing directly with educators has never been so seamless. EForum has truly transformed my study routine and grades!",
      rating: 5
    }
  ]
};

const LandingPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const { theme } = useContext(ThemeContext);
  const { userAuth } = useContext(UserContext);
  const { access_token, profile_img, username, language } = userAuth;
  const [openFAQIndex, setOpenFAQIndex] = useState(null);

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

      {/* ── Partners Section (Academic Sponsors / Trusted By) ────────────────── */}
      <section className="py-16 px-6 md:px-12 max-w-[1400px] mx-auto border-b border-slate-200 dark:border-white/10 text-center">
        <p className="font-mono text-slate-400 dark:text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] mb-10">
          {language === "en" ? "Trusted by Leading Institutions & Platforms" : "Đồng hành cùng các đơn vị giáo dục & nền tảng học tập hàng đầu"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16 lg:gap-24 opacity-60 dark:opacity-40 hover:opacity-100 dark:hover:opacity-80 transition-all duration-300">
          {/* Partner 1: Google */}
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-all duration-300 hover:text-[#4285F4] dark:hover:text-[#4285F4] hover:scale-105 group cursor-pointer" title="Google Education">
            <svg role="img" viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
            <span className="font-jakarta font-black text-lg tracking-tighter">Google</span>
          </div>

          {/* Partner 2: Microsoft */}
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-all duration-300 hover:text-[#F25022] dark:hover:text-[#F25022] hover:scale-105 group cursor-pointer" title="Microsoft Education">
            <svg role="img" viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h11.4v11.4H0zm12.6 0H24v11.4H12.6zM0 12.6h11.4V24H0zm12.6 0H24V24H12.6z"/>
            </svg>
            <span className="font-jakarta font-black text-lg tracking-tighter">Microsoft</span>
          </div>

          {/* Partner 3: Coursera */}
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-all duration-300 hover:text-[#0056D2] dark:hover:text-[#0056D2] hover:scale-105 group cursor-pointer" title="Coursera">
            <svg role="img" viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.374 23.977c-4.183-.21-8.006-2.626-9.959-6.347-2.097-3.858-1.871-8.864.732-12.454C4.748 1.338 9.497-.698 14.281.23c4.583.857 8.351 4.494 9.358 8.911 1.122 4.344-.423 9.173-3.925 12.04-2.289 1.953-5.295 2.956-8.34 2.797zm7.705-8.05a588.737 588.737 0 0 0-3.171-1.887c-.903 1.483-2.885 2.248-4.57 1.665-2.024-.639-3.394-2.987-2.488-5.134.801-2.009 2.79-2.707 4.357-2.464a4.19 4.19 0 0 1 2.623 1.669c1.077-.631 2.128-1.218 3.173-1.855-2.03-3.118-6.151-4.294-9.656-2.754-3.13 1.423-4.89 4.68-4.388 7.919.54 3.598 3.73 6.486 7.716 6.404a7.664 7.664 0 0 0 6.404-3.563z"/>
            </svg>
            <span className="font-jakarta font-black text-lg tracking-tighter">Coursera</span>
          </div>

          {/* Partner 4: edX */}
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-all duration-300 hover:text-[#002B49] dark:hover:text-[#002B49] hover:scale-105 group cursor-pointer" title="edX">
            <svg role="img" viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.359 10.416c.053.162.079.334.079.516a3.154 3.154 0 0 1-.011.231h-3c.065-.236.152-.451.262-.644.109-.193.239-.359.39-.497.15-.138.318-.246.503-.321.184-.075.383-.113.595-.113.209 0 .392.036.549.108.156.071.288.169.394.292.107.123.186.266.239.428zm5.444-.4a1.206 1.206 0 0 0-.436-.305 1.48 1.48 0 0 0-.58-.108c-.284 0-.547.063-.79.19a1.952 1.952 0 0 0-.631.528 2.61 2.61 0 0 0-.421.808 3.305 3.305 0 0 0-.154 1.029c0 .233.033.446.1.641s.16.362.28.5c.12.138.263.246.431.323.168.077.354.116.56.116.287 0 .553-.067.798-.203.244-.135.458-.32.639-.554a2.71 2.71 0 0 0 .426-.826c.102-.316.154-.658.154-1.024 0-.236-.033-.448-.098-.636a1.405 1.405 0 0 0-.278-.479zM24 7.468l-2.398 11.276H10.727l.625-2.852H0L2.227 5.256h13.577l-.462 2.212H24zM7.362 11.045a2.51 2.51 0 0 0-.169-.954 2.069 2.069 0 0 0-.457-.7 1.951 1.951 0 0 0-.669-.434 2.22 2.22 0 0 0-.809-.148 2.73 2.73 0 0 0-1.162.246 2.628 2.628 0 0 0-.911.695c-.253.3-.451.659-.593 1.077a4.346 4.346 0 0 0-.212 1.393c0 .373.059.703.177.99a2.01 2.01 0 0 0 1.198 1.172c.273.101.564.151.872.151.321 0 .616-.039.885-.115a2.55 2.55 0 0 0 .708-.318c.204-.135.372-.295.505-.48a1.84 1.84 0 0 0 .287-.595h-.938a1.279 1.279 0 0 1-.508.513c-.222.126-.517.19-.883.19-.168 0-.333-.028-.497-.085a1.202 1.202 0 0 1-.444-.274 1.41 1.41 0 0 1-.321-.49 1.913 1.913 0 0 1-.123-.726c0-.048.001-.094.003-.138.002-.044.004-.09.008-.138h3.986c.01-.051.019-.114.026-.187l.02-.226a6.153 6.153 0 0 0 .021-.419zm5.036 3.392L14.04 6.71h-.898l-.682 3.217h-.082a1.406 1.406 0 0 0-.228-.454 1.56 1.56 0 0 0-.375-.354 1.786 1.786 0 0 0-.487-.228 1.93 1.93 0 0 0-.567-.082 2.506 2.506 0 0 0-1.45.456 2.892 2.892 0 0 0-.575.534c-.173.208-.32.442-.444.7a3.925 3.925 0 0 0-.285.841c-.066.303-.1.62-.1.952 0 .342.053.652.159.929.106.277.25.513.434.708.183.195.395.345.639.449.243.105.503.157.78.157.352 0 .681-.076.985-.228.304-.152.557-.36.759-.623h.082l-.159.754h.852zm6.116-1.39l3.578-4.125H20.09l-2.184 2.704h-.108l-1.155-2.704h-2.025l1.736 3.928-3.748 4.44h1.976l2.406-2.852h.162l1.3 2.852h1.988l-1.924-4.243z"/>
            </svg>
            <span className="font-jakarta font-black text-lg tracking-tighter">edX</span>
          </div>

          {/* Partner 5: Khan Academy */}
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-all duration-300 hover:text-[#048A81] dark:hover:text-[#048A81] hover:scale-105 group cursor-pointer" title="Khan Academy">
            <svg role="img" viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.724 4.973L13.418.328a3.214 3.214 0 0 0-2.828 0L2.276 4.973A3.05 3.05 0 0 0 .862 7.371v9.256a3.05 3.05 0 0 0 1.414 2.4l8.306 4.645a3.214 3.214 0 0 0 2.828 0l8.314-4.645a3.05 3.05 0 0 0 1.414-2.4V7.373a3.05 3.05 0 0 0-1.414-2.4zM12 4.921a2.571 2.571 0 1 1 .001 5.143A2.571 2.571 0 0 1 12 4.92zm3.094 13.627a9.119 9.119 0 0 1-3.103.549 8.972 8.972 0 0 1-3.076-.55 8.493 8.493 0 0 1-5.486-7.987v-.857c4.646.017 8.074 3.823 8.074 8.51v.198h.926v-.197c0-4.688 3.445-8.51 8.056-8.51.026.29.043.582.086.856a8.502 8.502 0 0 1-5.477 7.988z"/>
            </svg>
            <span className="font-jakarta font-black text-sm uppercase tracking-wider">Khan Academy</span>
          </div>

          {/* Partner 6: Udemy */}
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-all duration-300 hover:text-[#A435F0] dark:hover:text-[#A435F0] hover:scale-105 group cursor-pointer" title="Udemy">
            <svg role="img" viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L5.81 3.573v3.574l6.189-3.574 6.191 3.574V3.573zM5.81 10.148v8.144c0 1.85.589 3.243 1.741 4.234S10.177 24 11.973 24s3.269-.482 4.448-1.474c1.179-.991 1.768-2.439 1.768-4.314v-8.064h-3.242v7.85c0 2.036-1.509 3.055-2.948 3.055-1.428 0-2.947-.991-2.947-3.027v-7.878z"/>
            </svg>
            <span className="font-jakarta font-black text-lg tracking-tighter">Udemy</span>
          </div>

          {/* Partner 7: Duolingo */}
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-all duration-300 hover:text-[#58CC02] dark:hover:text-[#58CC02] hover:scale-105 group cursor-pointer" title="Duolingo">
            <svg role="img" viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.484 18.213c1.142 1.033 2.657 1.662 4.316 1.662l.294-.001c1.985-.038 3.749-.976 4.905-2.422v1.98c0 2.522-2.043 4.568-4.567 4.568H4.569C2.045 23.998.002 21.954.002 19.43v-1.92c1.181 1.443 2.976 2.365 4.985 2.365l.35-.001c1.61-.027 3.076-.646 4.191-1.648.555.764 1.456 1.26 2.473 1.26 1.023 0 1.928-.502 2.483-1.273zm-5.349-.996c-.989 1.022-2.375 1.658-3.909 1.658h-.239c-2.229 0-4.146-1.343-4.987-3.262v-7.16c.281-.64.68-1.216 1.169-1.699-.035-.731.132-1.469.511-2.128.256-.44.867-.504 1.21-.124l.766.851c.007-.003.014-.003.021-.005-.098-.78.037-1.587.419-2.308.24-.45.757-.53 1.114-.164 0 0 3.939 3.979 4.035 4.084 1.542 1.348 4.066 1.287 5.686-.18.002-.003.007-.005.009-.007.042-.042 3.855-3.9 3.855-3.9.3361-.3451.8619-.3101 1.113.164.385.724.518 1.535.417 2.32.002.001.003.001.004.002l.007.002c.001 0 .002 0 .003.001l.776-.86c.342-.38.954-.316 1.207.124.387.673.553 1.427.509 2.173.496.501.897 1.099 1.169 1.762v6.941c-.816 1.978-2.761 3.373-5.032 3.373H18.8c-1.547 0-2.945-.648-3.936-1.686a.8386.8386 0 0 0-.009-.067c.313-.017.528-.162.688-.33.152-.16.299-.397.299-.776 0 0-.022-.312-.024-.324.693.767 1.696 1.249 2.811 1.249 2.092 0 3.787-1.696 3.787-3.787v-2.243c0-2.092-1.697-3.787-3.787-3.787-2.093 0-3.787 1.695-3.787 3.787v2.243c0 .266.027.526.079.776-.712-.784-1.744-1.278-2.842-1.278-1.239 0-2.339.523-3.064 1.355.063-.274.097-.56.097-.853v-2.243c0-2.092-1.697-3.787-3.788-3.787-2.09 0-3.787 1.695-3.787 3.787v2.243c0 2.093 1.697 3.787 3.787 3.787 1.151 0 2.182-.513 2.876-1.322-.008.035-.039.395-.039.395 0 .378.147.616.298.775.16.168.374.312.688.331a.7783.7783 0 0 0-.012.097zm.997.073c.729.131 1.733.305 1.792.305h.157c.059 0 1.789-.303 1.789-.303-.327.705-1.041 1.194-1.869 1.194-.829 0-1.543-.49-1.869-1.196zm-.971-1.379c.246-1.313 1.462-2.259 2.918-2.259 1.324 0 2.521.97 2.763 2.259v.105c0 .082-.029.115-.103.106l-2.658.473h-.157l-2.66-.476c-.075.01-.103-.023-.103-.105Zm8.023-6.392c.255-.14.549-.22.861-.22.992 0 1.798.804 1.798 1.798v1.919c0 .991-.804 1.797-1.798 1.797-.991 0-1.797-.803-1.797-1.797v-1.542c.034.003.068.005.103.005.64 0 1.16-.518 1.16-1.156 0-.312-.125-.596-.327-.804zM5.162 9.461c.227-.104.48-.162.746-.162.991 0 1.798.804 1.798 1.798v1.919c0 .991-.804 1.797-1.798 1.797-.991 0-1.797-.803-1.797-1.797v-1.571c.089.022.182.034.278.034.641 0 1.16-.518 1.16-1.156 0-.342-.149-.65-.387-.862ZM.002 6.554V4.568C.002 2.044 2.045 0 4.569 0h14.865c2.522 0 4.565 2.044 4.565 4.568v2.041a5.1847 5.1847 0 0 0-.164-.197 4.8592 4.8592 0 0 0-.646-2.284c-.433-.754-1.315-1.037-2.07-.786a4.785 4.785 0 0 0-.327-.774h-.001c-.287-.54-.758-.835-1.248-.908-.493-.073-1.033.072-1.464.515l-3.82 3.864c-1.226 1.11-3.127 1.199-4.313.205-.103-.109-4.025-4.071-4.025-4.071-.427-.438-.966-.584-1.46-.51-.489.073-.961.367-1.248.907v.002c-.133.25-.241.508-.327.771-.753-.252-1.635.029-2.071.782 0 0-.001.001-.001.002-.4.694-.613 1.459-.645 2.23-.057.065-.113.13-.167.197z"/>
            </svg>
            <span className="font-jakarta font-black text-lg tracking-tighter">Duolingo</span>
          </div>
        </div>
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

      {/* ── Testimonials/Reviews Section ────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-slate-200 dark:border-white/10">
        <div className="mb-16 md:mb-20">
          <div className="flex items-center gap-4 mb-4">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
              {language === "en" ? "Testimonials" : "Đánh giá từ cộng đồng"}
            </span>
          </div>
          <h2 className="font-jakarta font-black text-4xl md:text-6xl text-slate-900 dark:text-white uppercase tracking-tighter mb-6 max-w-3xl leading-[1.1]">
            {language === "en"
              ? "Driving Education, Empowering Success."
              : "Định hình tương lai học tập."}
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            {language === "en"
              ? "Discover how businesses, authors, and students achieve their breakthroughs with EForum's ecosystem."
              : "Khám phá cách các doanh nghiệp, tác giả và học sinh sinh viên đạt được bước tiến vượt bậc nhờ hệ sinh thái EForum."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(TESTIMONIALS_DATA[language] || TESTIMONIALS_DATA.vi).map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-[#09090B] border border-slate-200 dark:border-white/10 p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/50 dark:hover:border-indigo-500/40 transition-colors duration-300"
            >
              {/* Subtle decorative background pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div>
                {/* Tag & Rating */}
                <div className="flex justify-between items-center mb-8">
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest font-mono bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                    {item.role}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill="currentColor"
                        className="text-amber-500 dark:text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                {/* Quote Content */}
                <p className="text-base md:text-[1.05rem] text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed mb-8 relative z-10">
                  "{item.quote}"
                </p>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 group-hover:border-indigo-500 transition-colors shrink-0">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-full h-full object-cover bg-slate-100 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <h4 className="font-jakarta font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                    {item.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
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

      {/* ── FAQ Section (Academic Editorial Accordion) ────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-slate-200 dark:border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left info column */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <h2 className="font-jakarta font-black text-4xl md:text-5xl text-slate-900 dark:text-white uppercase tracking-tighter mb-6 leading-[1.1]">
              FAQ
            </h2>
            <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
              {language === "en"
                ? "Have questions about how EForum works? Here are the answers to the most common queries we receive."
                : "Bạn có câu hỏi về cách hoạt động của EForum? Dưới đây là giải đáp cho các câu hỏi thường gặp nhất."}
            </p>
          </div>

          {/* Right accordion column */}
          <div className="lg:col-span-7 flex flex-col border-t border-slate-200 dark:border-white/10">
            {(FAQ_DATA[language] || FAQ_DATA.vi).map((item, idx) => {
              const isOpen = openFAQIndex === idx;
              return (
                <div
                  key={idx}
                  className="border-b border-slate-200 dark:border-white/10"
                >
                  <button
                    onClick={() => setOpenFAQIndex(isOpen ? null : idx)}
                    className="w-full py-6 flex justify-between items-center text-left group hover:text-indigo-600 transition-colors duration-250 cursor-pointer"
                  >
                    <span className="font-jakarta font-extrabold text-lg md:text-xl text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-400 group-hover:text-indigo-500 shrink-0 ml-4"
                    >
                      <ChevronDown size={22} />
                    </motion.div>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0 }}
                    className="overflow-hidden"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p className="pb-6 text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                      {item.a}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
