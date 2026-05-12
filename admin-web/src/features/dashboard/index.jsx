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
} from "lucide-react";
import { motion } from "framer-motion";
import reportApi from "../../api/reportApi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
    },
  },
};

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    accent: "bg-blue-500/5",
    hover: "group-hover:bg-blue-500/10",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    accent: "bg-emerald-500/5",
    hover: "group-hover:bg-emerald-500/10",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    accent: "bg-purple-500/5",
    hover: "group-hover:bg-purple-500/10",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    accent: "bg-rose-500/5",
    hover: "group-hover:bg-rose-500/10",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    accent: "bg-amber-500/5",
    hover: "group-hover:bg-amber-500/10",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
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
      xaxis: { categories: [] },
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
      xaxis: { categories: [] },
      legend: { position: "bottom" },
      grid: { borderColor: "#f1f5f9" },
    },
  });

  const [donutChart, setDonutChart] = useState({
    series: [0, 0, 0],
    options: {
      chart: { type: "donut", fontFamily: "Exo 2, sans-serif" },
      labels: ["Lượt thích", "Lượt chia sẻ", "Lượt bình luận"],
      colors: ["#3b82f6", "#f59e0b", "#8b5cf6"],
      legend: { position: "bottom" },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              total: { show: true, label: "Tổng tương tác", color: "#64748b" },
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

    // Initial fetch
    handleDateChange();
  }, []);

  const handleDateChange = () => {
    if (!startDate || !endDate) return;
    setIsFiltering(true);
    
    Promise.all([
      reportApi.userChartByDate(startDate, endDate),
      reportApi.blogStatisticsByDate(startDate, endDate),
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
      
      setTimeout(() => setIsFiltering(false), 500); // Visual feedback
    }).catch(() => setIsFiltering(false));
  };

  const statCards = [
    { label: "Tổng người dùng", value: totalUser, icon: User2Icon, color: "blue", trend: "+12%" },
    { label: "Tổng bài viết", value: totalBlog, icon: FileIcon, color: "emerald", trend: "+5%" },
    { label: "Tổng bình luận", value: totalComment, icon: MessageCircleIcon, color: "purple", trend: "+18%" },
    { label: "Lượt thích", value: totalLike, icon: ThumbsUp, color: "rose", trend: "+24%" },
    { label: "Lượt chia sẻ", value: totalShare, icon: Share2, color: "amber", trend: "+8%" },
    { label: "Lượt đọc", value: totalRead, icon: BookOpen, color: "indigo", trend: "+15%" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 space-y-8 bg-slate-50 min-h-full font-exo-2"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Bảng điều khiển</h1>
          <p className="text-slate-500 mt-1">Chào mừng trở lại! Đây là thống kê hệ thống của bạn.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <CalendarIcon size={18} className="text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-600"
            />
          </div>
          <span className="text-slate-400 text-sm font-bold">to</span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <CalendarIcon size={18} className="text-slate-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-600"
            />
          </div>

          <button
            onClick={handleDateChange}
            disabled={isFiltering}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            {isFiltering ? (
              <Activity size={18} className="animate-spin" />
            ) : (
              <Activity size={18} />
            )}
            {isFiltering ? "Đang lọc..." : "Lọc dữ liệu"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => {
            const colors = colorMap[card.color];
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full ${colors.accent} ${colors.hover} transition-colors duration-500`} />
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-4 rounded-2xl ${colors.bg} ${colors.text}`}>
                      <card.icon size={28} />
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 text-sm font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                      <TrendingUp size={14} /> {card.trend}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-sm">{card.label}</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-1">{card.value.toLocaleString()}</h3>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Phân bổ tương tác</h3>
            <Activity size={20} className="text-slate-400" />
          </div>
          <div className="relative min-h-[250px]">
            <Chart options={donutChart.options} series={donutChart.series} type="donut" width="100%" height="250" />
          </div>
          <div className="space-y-4 mt-6">
            {[
              { label: "Lượt thích", value: totalLike, color: "bg-blue-500" },
              { label: "Chia sẻ", value: totalShare, color: "bg-emerald-500" },
              { label: "Bình luận", value: totalComment, color: "bg-purple-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-500 font-medium">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-700">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Tăng trưởng hệ thống</h3>
          </div>
          <div className="min-h-[350px]">
            <Chart options={growthChart.options} series={growthChart.series} type="area" height="350" />
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Tương tác theo thời gian</h3>
          </div>
          <div className="min-h-[350px]">
            <Chart options={interactionChart.options} series={interactionChart.series} type="bar" height="350" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
