import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { getGroupStats } from "../../services/group.service";

// Premium Custom Select Component using Framer Motion
const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative min-w-[160px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-xl text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 hover:bg-slate-100 dark:hover:bg-slate-850 focus:outline-none focus:border-indigo-500 transition-colors duration-200 cursor-pointer shadow-sm min-h-[36px]"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption.icon && <i className={`fi ${selectedOption.icon} text-slate-400 text-sm shrink-0`}></i>}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <i className={`fi fi-rr-angle-small-down text-slate-400 text-sm transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}></i>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 bg-white dark:bg-[#18181b] border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-xl py-1.5 z-50 max-h-60 overflow-y-auto w-48"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between gap-2 transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-bold"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && (
                      <i className={`fi ${opt.icon} ${isSelected ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"} text-sm shrink-0`} />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <i className="fi fi-rr-check text-indigo-500 dark:text-indigo-400 text-[10px] shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const timeRanges = [
  { value: "7d", label: "7 ngày qua", icon: "fi-rr-calendar-day" },
  { value: "30d", label: "30 ngày qua", icon: "fi-rr-calendar" },
  { value: "3m", label: "3 tháng qua", icon: "fi-rr-calendar-lines" },
  { value: "6m", label: "6 tháng qua", icon: "fi-rr-calendar-lines" },
  { value: "12m", label: "12 tháng qua", icon: "fi-rr-calendar-clock" },
  { value: "custom", label: "Tùy chọn ngày...", icon: "fi-rr-edit" }
];

export const GroupDashboardTab = ({ groupId, token }) => {
  const [range, setRange] = useState("7d"); // 7d, 30d, 3m, 6m, 12m, custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getGroupStats(groupId, range, token, startDate, endDate);
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Không thể tải số liệu thống kê.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId && token) {
      if (range !== "custom") {
        fetchStats();
      } else if (startDate && endDate) {
        fetchStats();
      }
    }
  }, [groupId, range, token, startDate, endDate]);

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    const date = new Date(dateObj);
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const getDateRangeText = () => {
    if (range === "custom") {
      if (startDate && endDate) {
        return `Khoảng ngày: ${formatDate(startDate)} đến ${formatDate(endDate)}`;
      }
      return "Vui lòng chọn khoảng ngày phía trên...";
    }

    const now = new Date();
    let days = 7;
    if (range === "30d") days = 30;
    else if (range === "3m") days = 90;
    else if (range === "6m") days = 180;
    else if (range === "12m") days = 365;

    const startDateObj = new Date();
    startDateObj.setDate(now.getDate() - days);

    const rangeTitle =
      range === "7d"
        ? "7 ngày qua"
        : range === "30d"
          ? "30 ngày qua"
          : range === "3m"
            ? "3 tháng qua"
            : range === "6m"
              ? "6 tháng qua"
              : "12 tháng qua";

    return `${rangeTitle} (${formatDate(startDateObj)} đến ${formatDate(now)})`;
  };

  const getPeriodLabel = () => {
    if (range === "custom") return "Khoảng ngày đã chọn";
    if (range === "7d") return "7 ngày gần đây";
    if (range === "30d") return "30 ngày gần đây";
    if (range === "3m") return "3 tháng gần đây";
    if (range === "6m") return "6 tháng gần đây";
    return "12 tháng gần đây";
  };

  const renderGrowthBadge = (val) => {
    const isPositive = val > 0;
    const isNegative = val < 0;

    if (isPositive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          +{val.toFixed(2)}%
          <i className="fi fi-rr-arrow-trend-up text-[10px]"></i>
        </span>
      );
    } else if (isNegative) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
          {val.toFixed(2)}%
          <i className="fi fi-rr-arrow-trend-down text-[10px]"></i>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          0.00%
        </span>
      );
    }
  };

  if (loading && !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 font-inter animate-in fade-in duration-300">
      {/* Dashboard Top Header */}
      <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-jakarta">
              Tổng quan Dashboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dữ liệu tổng hợp hoạt động quản trị của nhóm học tập
            </p>
          </div>

          {/* Unified Date Filter & Refresh Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <CustomSelect
              value={range}
              onChange={(val) => {
                setRange(val);
                if (val !== "custom") {
                  setStartDate("");
                  setEndDate("");
                }
              }}
              options={timeRanges}
            />

            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 active:scale-95 cursor-pointer shadow-sm min-h-[36px]"
            >
              <i className="fi fi-rr-refresh text-xs"></i>
              Làm mới
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker panel (Conditionally Rendered) */}
        {range === "custom" && (
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-150 dark:border-white/5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Từ ngày:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-lg text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Đến ngày:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-lg text-xs font-bold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="px-3 py-1.5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-[10px] font-black uppercase transition-colors duration-200 cursor-pointer"
            >
              Xóa ngày
            </button>
            <span className="text-[10px] text-slate-400 dark:text-slate-550 italic font-medium ml-2">
              Chọn đầy đủ 2 mốc để tự động cập nhật thống kê
            </span>
          </div>
        )}
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Members Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-black text-slate-900 dark:text-white font-jakarta">
              Thành viên
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-150/40 dark:border-white/5">
              Thành viên mới
            </span>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 flex items-center gap-1">
            <i className="fi fi-rr-calendar text-[10px] text-indigo-500"></i>
            {getDateRangeText()}
          </div>

          <div className="flex items-end gap-4 mt-6">
            <span className="text-5xl font-black text-slate-900 dark:text-white font-jakarta leading-none">
              {stats?.members?.total || 0}
            </span>
            <div className="mb-1">{renderGrowthBadge(stats?.members?.growth || 0)}</div>
          </div>

          {/* Sub Stats Footer Box */}
          <div className="mt-8 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex justify-around text-center">
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                Tham gia mới
              </div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                {stats?.members?.newCurrent || 0}
              </div>
            </div>
            <div className="w-[1px] bg-slate-200/60 dark:bg-white/5"></div>
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                Rời nhóm (ước tính)
              </div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                {stats?.members?.leftCount || 0}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Content Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-black text-slate-900 dark:text-white font-jakarta">
              Nội dung (Bài viết)
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-150/40 dark:border-white/5">
              Hoạt động đăng bài
            </span>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 flex items-center gap-1">
            <i className="fi fi-rr-calendar text-[10px] text-indigo-500"></i>
            {getDateRangeText()}
          </div>

          <div className="flex items-end gap-4 mt-6">
            <span className="text-5xl font-black text-slate-900 dark:text-white font-jakarta leading-none">
              {stats?.content?.total || 0}
            </span>
            <div className="mb-1">{renderGrowthBadge(stats?.content?.growth || 0)}</div>
          </div>

          {/* Sub Stats Footer Box (3 Items) */}
          <div className="mt-8 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex justify-between text-center">
            <div className="flex-1">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                Bài viết mới
              </div>
              <div className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                {stats?.content?.newCurrent || 0}
              </div>
            </div>
            <div className="w-[1px] bg-slate-200/60 dark:bg-white/5"></div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                Chờ duyệt
              </div>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {stats?.content?.pending || 0}
              </div>
            </div>
            <div className="w-[1px] bg-slate-200/60 dark:bg-white/5"></div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                Bị báo cáo
              </div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {stats?.content?.reported || 0}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Card 3: Engagement Metrics (Grid inside a card) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all relative"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-black text-slate-900 dark:text-white font-jakarta">
            Chỉ số tương tác
          </span>
          <span className="text-[10px] text-slate-450 dark:text-slate-400 font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-150/20 dark:border-white/5">
            {getPeriodLabel()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Sub item 1: Visits */}
          <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.01] transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
              <i className="fi fi-rr-eye"></i>
            </div>
            <div className="space-y-1 overflow-hidden">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">
                Lượt xem tài liệu & bài thảo luận
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-black text-slate-800 dark:text-white">
                  {stats?.engagement?.visits || 0}
                </span>
                {renderGrowthBadge(stats?.engagement?.visitsGrowth || 0)}
              </div>
            </div>
          </div>

          {/* Sub item 2: Likes */}
          <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.01] transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
              <i className="fi fi-rr-thumbs-up"></i>
            </div>
            <div className="space-y-1 overflow-hidden">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">
                Lượt thích bài viết
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-black text-slate-800 dark:text-white">
                  {stats?.engagement?.likes || 0}
                </span>
                {renderGrowthBadge(stats?.engagement?.likesGrowth || 0)}
              </div>
            </div>
          </div>

          {/* Sub item 3: Comments */}
          <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.01] transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl shrink-0">
              <i className="fi fi-rr-comment-alt"></i>
            </div>
            <div className="space-y-1 overflow-hidden">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">
                Số lượng bình luận mới
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-black text-slate-800 dark:text-white">
                  {stats?.engagement?.comments || 0}
                </span>
                {renderGrowthBadge(stats?.engagement?.commentsGrowth || 0)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Rankings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Top Active Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-jakarta">
                Người hoạt động nổi bật
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Các thành viên đóng góp nhiều bài đăng nhất nhóm
              </p>
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider bg-indigo-550/5 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/10">
              {getPeriodLabel()}
            </span>
          </div>

          <div className="space-y-3.5">
            {stats?.topMembers && stats.topMembers.length > 0 ? (
              stats.topMembers.map((member, idx) => {
                const colors = [
                  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300", // 1st
                  "bg-slate-200 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300", // 2nd
                  "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300", // 3rd
                  "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400", // 4th
                  "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400", // 5th
                ];

                const userDetails = member.user?.personal_info || {};

                return (
                  <div
                    key={member.user?._id || idx}
                    className="flex items-center justify-between gap-4 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Rank Indicator */}
                      <span
                        className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                          colors[idx] || colors[4]
                        }`}
                      >
                        {idx + 1}
                      </span>
                      {/* Avatar */}
                      <img
                        src={userDetails.profile_img}
                        alt="Avatar"
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-white/5"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
                            userDetails.fullname || "User",
                          )}`;
                        }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-800 dark:text-white truncate">
                          {userDetails.fullname || "Thành viên ẩn danh"}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-555 truncate">
                          @{userDetails.username || "username"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {member.postCount || 0} bài đăng
                      </span>
                      <div className="text-[9px] text-slate-400 dark:text-slate-555 font-bold">
                        {member.totalLikes || 0} thích
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                Chưa có dữ liệu thành viên đóng góp.
              </div>
            )}
          </div>
        </motion.div>

        {/* Column 2: Top Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-jakarta">
                Nội dung nổi bật
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Các bài đăng thảo luận nhận được nhiều tương tác nhất
              </p>
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider bg-indigo-550/5 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/10">
              {getPeriodLabel()}
            </span>
          </div>

          <div className="space-y-3.5">
            {stats?.topBlogs && stats.topBlogs.length > 0 ? (
              stats.topBlogs.map((blog, idx) => {
                const colors = [
                  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
                  "bg-slate-200 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300",
                  "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
                  "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400",
                  "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400",
                ];

                return (
                  <a
                    href={`/blog/${blog.blog_id}`}
                    key={blog._id || idx}
                    className="flex items-center justify-between gap-4 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all min-w-0"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Rank Indicator */}
                      <span
                        className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                          colors[idx] || colors[4]
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-800 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                          {blog.title}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-555 truncate">
                          Đăng bởi @{blog.author?.personal_info?.username || "username"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex gap-3 text-slate-400 dark:text-slate-500 font-bold text-[10px]">
                      <span className="flex items-center gap-1">
                        <i className="fi fi-rr-thumbs-up text-[9px]"></i>
                        {blog.activity?.total_likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fi fi-rr-eye text-[9px]"></i>
                        {blog.activity?.total_reads || 0}
                      </span>
                    </div>
                  </a>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                Chưa có dữ liệu bài đăng nổi bật.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* Dashboard Loading Skeleton */
const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-850 rounded-lg"></div>
          <div className="h-3.5 w-64 bg-slate-200 dark:bg-slate-850 rounded-lg"></div>
        </div>
        <div className="h-9 w-32 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-[28px]"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-[28px]"></div>
      </div>

      <div className="h-44 bg-slate-200 dark:bg-slate-800/60 rounded-[28px]"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-slate-200 dark:bg-slate-800/60 rounded-[28px]"></div>
        <div className="h-80 bg-slate-200 dark:bg-slate-800/60 rounded-[28px]"></div>
      </div>
    </div>
  );
};
