import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import {
  User2Icon,
  FileIcon,
  MessageCircleIcon,
  CalendarIcon,
  ThumbsUp,
  Share2,
  BookOpen,
  TrendingUp,
  Activity,
  Wifi,
  Database,
  Cpu,
  Zap,
  PenTool,
  CheckSquare,
  Users,
  Shield,
  Download,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import reportApi from "../../api/reportApi";
import blogApi from "../../api/blogApi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const colorMap = {
  blue: {
    bg: "from-blue-500/10 to-indigo-500/5",
    border: "hover:border-blue-200/60",
    text: "text-blue-600",
    iconBg: "bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20",
    accent: "bg-blue-500/5",
    hover: "group-hover:bg-blue-500/10",
  },
  emerald: {
    bg: "from-emerald-500/10 to-teal-500/5",
    border: "hover:border-emerald-200/60",
    text: "text-emerald-600",
    iconBg: "bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20",
    accent: "bg-emerald-500/5",
    hover: "group-hover:bg-emerald-500/10",
  },
  purple: {
    bg: "from-purple-500/10 to-violet-500/5",
    border: "hover:border-purple-200/60",
    text: "text-purple-600",
    iconBg: "bg-gradient-to-tr from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/20",
    accent: "bg-purple-500/5",
    hover: "group-hover:bg-purple-500/10",
  },
  rose: {
    bg: "from-rose-500/10 to-pink-500/5",
    border: "hover:border-rose-200/60",
    text: "text-rose-600",
    iconBg: "bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20",
    accent: "bg-rose-500/5",
    hover: "group-hover:bg-rose-500/10",
  },
  amber: {
    bg: "from-amber-500/10 to-orange-500/5",
    border: "hover:border-amber-200/60",
    text: "text-amber-600",
    iconBg: "bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20",
    accent: "bg-amber-500/5",
    hover: "group-hover:bg-amber-500/10",
  },
  indigo: {
    bg: "from-indigo-500/10 to-blue-500/5",
    border: "hover:border-indigo-200/60",
    text: "text-indigo-600",
    iconBg: "bg-gradient-to-tr from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20",
    accent: "bg-indigo-500/5",
    hover: "group-hover:bg-indigo-500/10",
  },
};

const Dashboard = () => {
  const [totalUser, setTotalUser] = useState(0);
  const [totalBlog, setTotalBlog] = useState(0);
  const [totalComment, setTotalComment] = useState(0);
  const [totalLike, setTotalLike] = useState(0);
  const [totalShare, setTotalShare] = useState(0);
  const [totalRead, setTotalRead] = useState(0);

  const [topBlogs, setTopBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [activePreset, setActivePreset] = useState("7"); // "7", "30", "month", "all"
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [growthChart, setGrowthChart] = useState({
    series: [
      { name: "Người dùng mới", data: [] },
      { name: "Bài viết mới", data: [] },
    ],
    options: {
      chart: { type: "area", toolbar: { show: false }, fontFamily: "Exo 2, sans-serif" },
      colors: ["#3b82f6", "#10b981"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] },
      },
      xaxis: { categories: [], labels: { style: { colors: "#64748b" } } },
      yaxis: { labels: { style: { colors: "#64748b" } } },
      grid: { borderColor: "#f1f5f9" },
    },
  });

  const [interactionChart, setInteractionChart] = useState({
    series: [
      { name: "Lượt thích", data: [] },
      { name: "Lượt chia sẻ", data: [] },
      { name: "Lượt bình luận", data: [] },
    ],
    options: {
      chart: { type: "bar", stacked: true, toolbar: { show: false }, fontFamily: "Exo 2, sans-serif" },
      colors: ["#3b82f6", "#f59e0b", "#8b5cf6"],
      plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
      xaxis: { categories: [], labels: { style: { colors: "#64748b" } } },
      yaxis: { labels: { style: { colors: "#64748b" } } },
      legend: { position: "bottom", fontFamily: "Exo 2, sans-serif" },
      grid: { borderColor: "#f1f5f9" },
    },
  });

  const [donutChart, setDonutChart] = useState({
    series: [0, 0, 0],
    options: {
      chart: { type: "donut", fontFamily: "Exo 2, sans-serif" },
      labels: ["Lượt thích", "Lượt chia sẻ", "Lượt bình luận"],
      colors: ["#3b82f6", "#f59e0b", "#8b5cf6"],
      legend: { position: "bottom", fontFamily: "Exo 2, sans-serif" },
      plotOptions: {
        pie: {
          donut: {
            size: "75%",
            labels: {
              show: true,
              total: { show: true, label: "Tổng tương tác", color: "#64748b", fontSize: "14px" },
            },
          },
        },
      },
      dataLabels: { enabled: false },
    },
  });

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    reportApi.totalUser().then((res) => {
      if (res.ok && res.body) setTotalUser(res.body.totalUser || 0);
    });
    reportApi.totalBlog().then((res) => {
      if (res.ok && res.body) setTotalBlog(res.body.totalBlog || 0);
    });
    reportApi.totalComment().then((res) => {
      if (res.ok && res.body) setTotalComment(res.body.totalComment || 0);
    });

    reportApi.getStats().then((res) => {
      if (res.ok && res.body) {
        setTotalLike(res.body.totalLikes || 0);
        setTotalShare(res.body.totalShares || 0);
        setTotalRead(res.body.totalReads || 0);
      }
    });

    fetchTopBlogs();
    fetchFilteredData(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTopBlogs = () => {
    setLoadingBlogs(true);
    blogApi.getAllBlogs({ limit: 5 })
      .then((res) => {
        if (res.ok && res.body && res.body.list) {
          setTopBlogs(res.body.list);
        }
        setLoadingBlogs(false);
      })
      .catch(() => setLoadingBlogs(false));
  };

  const fetchFilteredData = (start, end) => {
    if (!start || !end) return;
    setIsFiltering(true);

    Promise.all([
      reportApi.userChartByDate(start, end),
      reportApi.blogStatisticsByDate(start, end),
      reportApi.weeklyInteractions(),
    ]).then(([userResponse, blogResponse, interactionResponse]) => {
      if (!userResponse.ok || !blogResponse.ok || !interactionResponse.ok) {
        setIsFiltering(false);
        return;
      }

      const userGrowth = userResponse.body?.growthData || [];
      const blogGrowth = blogResponse.body || [];
      const labels = userGrowth.map((entry) => entry.date);

      setGrowthChart((prev) => ({
        ...prev,
        series: [
          { name: "Người dùng mới", data: userGrowth.map((entry) => entry.userCount) },
          { name: "Bài viết mới", data: blogGrowth.map((entry) => entry.totalBlogs) },
        ],
        options: { ...prev.options, xaxis: { categories: labels } },
      }));

      const interactions = interactionResponse.body || [];
      const interactionLabels = interactions.map((entry) => entry.date);

      setInteractionChart((prev) => ({
        ...prev,
        series: [
          { name: "Lượt thích", data: interactions.map((entry) => entry.totalLikes) },
          { name: "Lượt chia sẻ", data: interactions.map((entry) => entry.totalShares) },
          { name: "Lượt bình luận", data: interactions.map((entry) => entry.totalComments) },
        ],
        options: { ...prev.options, xaxis: { categories: interactionLabels } },
      }));

      const totalL = interactions.reduce((a, b) => a + b.totalLikes, 0);
      const totalS = interactions.reduce((a, b) => a + b.totalShares, 0);
      const totalC = interactions.reduce((a, b) => a + b.totalComments, 0);

      setDonutChart((prev) => ({
        ...prev,
        series: [totalL, totalS, totalC],
      }));

      setTimeout(() => setIsFiltering(false), 300);
    }).catch(() => setIsFiltering(false));
  };

  const handleDateChange = () => {
    setActivePreset("");
    fetchFilteredData(startDate, endDate);
  };

  const handleQuickPreset = (preset) => {
    setActivePreset(preset);
    const end = new Date();
    let start = new Date();

    if (preset === "7") {
      start.setDate(end.getDate() - 6);
    } else if (preset === "30") {
      start.setDate(end.getDate() - 29);
    } else if (preset === "month") {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (preset === "all") {
      start = new Date(2025, 0, 1); // System reference start
    }

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    setStartDate(startStr);
    setEndDate(endStr);
    fetchFilteredData(startStr, endStr);
  };

  const handleExportCSV = () => {
    let csvContent = "\ufeff";
    csvContent += "BÁO CÁO THỐNG KÊ HỆ THỐNG - EDU BLOG\n";
    csvContent += `Thời gian báo cáo: Từ ${startDate} đến ${endDate}\n\n`;

    csvContent += "CHỈ SỐ TỔNG QUAN\n";
    csvContent += "Chỉ số,Số lượng\n";
    csvContent += `Tổng người dùng,${totalUser}\n`;
    csvContent += `Tổng bài viết,${totalBlog}\n`;
    csvContent += `Tổng bình luận,${totalComment}\n`;
    csvContent += `Tổng lượt đọc,${totalRead}\n`;
    csvContent += `Tổng lượt thích,${totalLike}\n`;
    csvContent += `Tổng lượt chia sẻ,${totalShare}\n\n`;

    csvContent += "DỮ LIỆU TĂNG TRƯỞNG THEO NGÀY\n";
    csvContent += "Ngày,Người dùng mới,Bài viết mới\n";
    
    const dates = growthChart.options.xaxis.categories || [];
    const newUsers = growthChart.series[0]?.data || [];
    const newBlogs = growthChart.series[1]?.data || [];
    
    dates.forEach((date, i) => {
      csvContent += `${date},${newUsers[i] || 0},${newBlogs[i] || 0}\n`;
    });
    
    csvContent += "\n";

    csvContent += "DANH SÁCH BÀI VIẾT MỚI NHẤT\n";
    csvContent += "ID Bài viết,Tiêu đề,Tác giả,Lượt thích,Lượt bình luận,Trạng thái\n";
    topBlogs.forEach((blog) => {
      const authorName = blog.author?.personal_info?.fullname || "Ẩn danh";
      const likes = blog.activity?.total_likes || 0;
      const comments = blog.activity?.total_comments || 0;
      const status = blog.isActive ? "Đang hoạt động" : "Bản nháp/Khóa";
      const titleEscaped = blog.title.replace(/"/g, '""');
      csvContent += `"${blog.blog_id}","${titleEscaped}","${authorName}",${likes},${comments},"${status}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao-cao-EduBlog-${startDate}-to-${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statCards = [
    { label: "Tổng người dùng", value: totalUser, icon: User2Icon, color: "blue", trend: "+12%" },
    { label: "Tổng bài viết", value: totalBlog, icon: FileIcon, color: "emerald", trend: "+5%" },
    { label: "Tổng bình luận", value: totalComment, icon: MessageCircleIcon, color: "purple", trend: "+18%" },
    { label: "Tổng lượt đọc", value: totalRead, icon: BookOpen, color: "indigo", trend: "+15%" },
    { label: "Lượt thích", value: totalLike, icon: ThumbsUp, color: "rose", trend: "+24%" },
    { label: "Lượt chia sẻ", value: totalShare, icon: Share2, color: "amber", trend: "+8%" },
  ];

  const quickActions = [
    { label: "Viết bài mới", path: "/blogs/create", icon: PenTool, color: "from-blue-500 to-indigo-500" },
    { label: "Duyệt bài viết", path: "/blogs", icon: CheckSquare, color: "from-emerald-500 to-teal-500" },
    { label: "Quản lý Staff", path: "/users", icon: Users, color: "from-purple-500 to-violet-500" },
    { label: "Nhật ký hệ thống", path: "/logs", icon: Activity, color: "from-amber-500 to-orange-500" },
    { label: "Cấu hình vai trò", path: "/roles", icon: Shield, color: "from-rose-500 to-pink-500" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 space-y-8 bg-slate-50 min-h-full font-exo-2 text-slate-800 dashboard-container"
    >
      {/* Dynamic styling for @media print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide layout header, sidebar, any other sibling components */
          header, 
          aside, 
          .no-print,
          button,
          .quick-actions-container,
          .system-health-card,
          .export-menu-container {
            display: none !important;
          }
          
          /* Reset main layout spacings */
          body, html, #root, .main-content {
            background: white !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            max-height: none !important;
            min-height: 0 !important;
          }
          
          /* printable container adjustments */
          .dashboard-container {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          
          /* Ensure Bento sections render perfectly for standard A4 portrait */
          .grid {
            display: grid !important;
          }
          .grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .xl\\:grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .xl\\:grid-cols-3 {
            grid-template-columns: 1fr !important;
          }
          .lg\\:grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
          .xl\\:col-span-2 {
            grid-column: span 2 / span 2 !important;
          }
          .xl\\:col-span-3 {
            grid-column: span 2 / span 2 !important;
          }
          
          .print-card {
            border: 1px solid #cbd5e1 !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            background: white !important;
            color: #0f172a !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 12px !important;
            height: auto !important;
            min-height: 0 !important;
          }
          
          /* Keep apexcharts rendering high-quality vectors */
          .apexcharts-canvas {
            background: transparent !important;
          }
        }
      `}} />

      {/* Printable Executive PDF Header */}
      <div className="hidden print:block w-full border-b-2 border-slate-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">EDU BLOG - HỆ THỐNG QUẢN TRỊ</h1>
            <p className="text-xs text-slate-500 font-bold mt-1">BÁO CÁO THỐNG KÊ CHI TIẾT HỆ THỐNG</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-700">Ngày lập báo cáo: {new Date().toLocaleDateString("vi-VN")}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase">Khoảng lọc: {startDate} đến {endDate}</p>
          </div>
        </div>
      </div>

      {/* Header Bento Box */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm print-card">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent print:text-slate-900">
            Bảng điều khiển quản trị
          </h1>
          <p className="text-slate-500 mt-1 font-medium no-print">
            Theo dõi sức khỏe hệ thống, tăng trưởng và tương tác bài viết của Edu Blog.
          </p>
          <p className="hidden print:block text-xs font-bold text-indigo-600 mt-1">
            Báo cáo trực quan dạng tài liệu được lập bởi Quản trị viên
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 no-print">
          {/* Quick Preset Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "7", label: "7 ngày" },
              { id: "30", label: "30 ngày" },
              { id: "month", label: "Tháng này" },
              { id: "all", label: "Tất cả" },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => handleQuickPreset(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activePreset === pill.id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Date Picker Custom Inputs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 px-2">
              <CalendarIcon size={14} className="text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset("");
                }}
                className="bg-transparent border-none focus:outline-none text-xs font-bold text-slate-600 cursor-pointer"
              />
            </div>
            <span className="text-slate-400 text-xs font-bold">đến</span>
            <div className="flex items-center gap-1.5 px-2">
              <CalendarIcon size={14} className="text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset("");
                }}
                className="bg-transparent border-none focus:outline-none text-xs font-bold text-slate-600 cursor-pointer"
              />
            </div>

            <button
              onClick={handleDateChange}
              disabled={isFiltering}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg transition-colors cursor-pointer"
              title="Lọc thủ công"
            >
              <RefreshCw size={14} className={isFiltering ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative export-menu-container">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Download size={14} />
              <span>Xuất báo cáo</span>
            </button>

            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setShowExportMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn định dạng báo cáo</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      handleExportCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group cursor-pointer"
                  >
                    <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <FileIcon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">Xuất file Excel / CSV</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tải xuống dữ liệu bảng tính thô</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      setTimeout(() => {
                        window.print();
                      }, 300);
                    }}
                    className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group cursor-pointer"
                  >
                    <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">Xuất báo cáo PDF</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Lưu báo cáo A4 trực quan</p>
                    </div>
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Row 1: Metrics Cards + Donut Chart (Bento Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Metric Cards Subgrid */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => {
            const colors = colorMap[card.color];
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.01 }}
                className={`group relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm ${colors.border} transition-all duration-300 flex flex-col justify-between h-[160px] print-card`}
              >
                {/* Glowing Background Overlay */}
                <div className={`absolute top-0 right-0 w-28 h-28 -mr-6 -mt-6 rounded-full bg-gradient-to-br ${colors.bg} opacity-50 blur-lg group-hover:opacity-80 transition-opacity duration-500 print:hidden`} />
                
                <div className="flex items-start justify-between z-10">
                  <div className={`p-3.5 rounded-2xl ${colors.iconBg} print:bg-slate-100 print:text-slate-800 print:shadow-none`}>
                    <card.icon size={22} />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm print:hidden">
                    <TrendingUp size={12} /> {card.trend}
                  </div>
                </div>

                <div className="z-10">
                  <p className="text-slate-400 font-semibold text-xs tracking-wider uppercase">{card.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                    {card.value.toLocaleString()}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Donut Chart Bento Box */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between print-card"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Tỷ lệ tương tác</h3>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl print:hidden">
                <Activity size={16} />
              </div>
            </div>
            <div className="relative min-h-[190px] flex items-center justify-center">
              <Chart options={donutChart.options} series={donutChart.series} type="donut" width="100%" height="190" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-50 text-center">
            {[
              { label: "Thích", value: totalLike, color: "text-blue-500 print:text-slate-800" },
              { label: "Chia sẻ", value: totalShare, color: "text-amber-500 print:text-slate-800" },
              { label: "Bình luận", value: totalComment, color: "text-purple-500 print:text-slate-800" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</p>
                <p className={`text-sm font-black ${item.color} mt-0.5`}>
                  {item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2: Recent Blogs & System Health + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Top & Recent Blogs (2 columns broad) */}
        <motion.div
          variants={itemVariants}
          className="xl:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between print-card"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950">Bài viết mới cập nhật</h3>
                <p className="text-slate-400 text-xs mt-0.5 no-print">Danh sách các bài đăng mới nhất trên hệ thống blog.</p>
              </div>
              <Link
                to="/blogs"
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl transition-all no-print"
              >
                <span>Xem tất cả</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>

            {loadingBlogs ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <RefreshCw size={24} className="animate-spin text-indigo-500" />
                <span className="text-xs text-slate-400 font-bold">Đang lấy danh sách...</span>
              </div>
            ) : topBlogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium text-sm">
                Không tìm thấy bài viết nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <th className="pb-3">Bài viết</th>
                      <th className="pb-3 hidden md:table-cell">Tác giả</th>
                      <th className="pb-3 text-center">Tương tác</th>
                      <th className="pb-3 text-center">Trạng thái</th>
                      <th className="pb-3 text-right no-print">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {topBlogs.map((blog) => (
                      <tr key={blog.blog_id} className="group/row hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pr-2 max-w-[240px]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 print:hidden">
                              {blog.banner ? (
                                <img src={blog.banner} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-black text-sm">
                                  B
                                </div>
                              )}
                            </div>
                            <div className="truncate">
                              <p className="font-extrabold text-sm text-slate-900 truncate group-hover/row:text-indigo-600 transition-colors" title={blog.title}>
                                {blog.title}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                {new Date(blog.publishedAt).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-100 print:hidden">
                              {blog.author?.personal_info?.profile_img ? (
                                <img
                                  src={blog.author.personal_info.profile_img}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[9px] font-bold text-slate-500">U</span>
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              {blog.author?.personal_info?.fullname || "Ẩn danh"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 text-center">
                          <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-1 font-bold" title="Lượt thích">
                              <ThumbsUp size={12} className="text-rose-400 print:text-slate-500" />
                              <span>{blog.activity?.total_likes || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 font-bold" title="Bình luận">
                              <MessageCircleIcon size={12} className="text-purple-400 print:text-slate-500" />
                              <span>{blog.activity?.total_comments || 0}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-center">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              blog.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {blog.isActive ? "Hoạt động" : "Khóa/Nháp"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right no-print">
                          <Link
                            to={`/blogs/${blog.blog_id}`}
                            className="inline-flex p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                            title="Chỉnh sửa bài viết"
                          >
                            <ExternalLink size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Quick Actions & System Health */}
        <div className="space-y-6 flex flex-col justify-between quick-actions-container no-print">
          {/* Quick Actions Bento Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex-1 quick-actions-card"
          >
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-500 fill-amber-100" />
              <span>Tác vụ quản trị nhanh</span>
            </h3>
            <div className="flex flex-col gap-2.5">
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  to={action.path}
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 group transition-all duration-300 hover:translate-x-1"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${action.color} text-white`}>
                      <action.icon size={15} />
                    </div>
                    <span className="text-xs font-black text-slate-700 group-hover:text-slate-900 transition-colors">
                      {action.label}
                    </span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* System Health Bento Card */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-tr from-slate-900 to-indigo-950 p-6 rounded-[2rem] text-white shadow-lg shadow-indigo-950/20 system-health-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-400">Trạng thái hệ thống</h3>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hoạt động</span>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Wifi size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-300">Khách online (Live)</span>
                </div>
                <span className="text-sm font-black text-white">42 người dùng</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Database size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-300">Kết nối Database</span>
                </div>
                <span className="text-xs font-black text-emerald-400">Ổn định (OK)</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-300">Thời gian phản hồi API</span>
                </div>
                <span className="text-xs font-black text-slate-200">124 ms</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Row 3: Growth Chart & Interactions Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Area Chart Box */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm print-card"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Tăng trưởng hệ thống</h3>
              <p className="text-xs text-slate-400 mt-0.5 no-print">Biểu đồ thể hiện bài viết mới và người dùng mới đăng ký.</p>
            </div>
          </div>
          <div className="min-h-[320px]">
            <Chart options={growthChart.options} series={growthChart.series} type="area" height="320" />
          </div>
        </motion.div>

        {/* Interaction Stacked Bar Chart Box */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm print-card"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Tương tác theo thời gian</h3>
              <p className="text-xs text-slate-400 mt-0.5 no-print">Thống kê chi tiết lượng Thích, Chia sẻ và Bình luận theo ngày.</p>
            </div>
          </div>
          <div className="min-h-[320px]">
            <Chart options={interactionChart.options} series={interactionChart.series} type="bar" height="320" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
