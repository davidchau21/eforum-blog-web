import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ThemeContext, UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// Import components
import { GroupDashboardTab } from "../components/groups/group-dashboard-tab.component";
import { GroupSettingsTab } from "../components/groups/group-settings-tab.component";
import { GroupDetailsSkeleton } from "../components/skeleton.component";
import { GroupMemberCard } from "../components/groups/group-member-card.component";
import { GroupConfirmModal } from "../components/groups/group-confirm-modal.component";

// Import API services
import {
  getGroupDetails,
  getGroupMembers,
  removeMember,
  changeMemberRole,
  getPendingBlogs,
  approveBlog,
  rejectBlog,
  updateGroupSettings,
  deleteGroup,
  approveRequest,
} from "../services/group.service";

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

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 hover:bg-slate-100 dark:hover:bg-slate-850 focus:outline-none focus:border-indigo-500 transition-colors duration-200 cursor-pointer shadow-sm min-h-[36px]"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption.icon && (
            <i
              className={`fi ${selectedOption.icon} text-slate-400 text-sm shrink-0`}
            ></i>
          )}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <i
          className={`fi fi-rr-angle-small-down text-slate-400 text-sm transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        ></i>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#18181b] border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-xl py-1.5 z-50 max-h-60 overflow-y-auto"
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
                      <i
                        className={`fi ${opt.icon} ${isSelected ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"} text-sm shrink-0`}
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <i className="fi fi-rr-check text-indigo-500 dark:text-indigo-400 text-[10px] shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Select configuration options
const roleOptions = [
  { value: "all", label: "Tất cả vai trò", icon: "fi-rr-users-alt" },
  { value: "admin", label: "Ban quản trị", icon: "fi-sr-crown" },
  { value: "member", label: "Thành viên thường", icon: "fi-rr-user" },
];

const dateOptions = [
  { value: "all", label: "Tất cả thời gian", icon: "fi-rr-calendar-clock" },
  { value: "today", label: "Hôm nay", icon: "fi-rr-calendar-day" },
  { value: "week", label: "7 ngày qua", icon: "fi-rr-calendar-lines" },
  { value: "month", label: "30 ngày qua", icon: "fi-rr-calendar" },
  { value: "custom", label: "Tùy chọn ngày...", icon: "fi-rr-edit" },
];

const sortOptions = [
  {
    value: "join-desc",
    label: "Gia nhập: Mới nhất",
    icon: "fi-rr-sort-amount-down",
  },
  {
    value: "join-asc",
    label: "Gia nhập: Cũ nhất",
    icon: "fi-rr-sort-amount-up",
  },
  { value: "name-asc", label: "Tên: A - Z", icon: "fi-rr-sort-alpha-down" },
  { value: "name-desc", label: "Tên: Z - A", icon: "fi-rr-sort-alpha-up" },
];

const GroupAdminPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useContext(ThemeContext);
  const { userAuth } = useContext(UserContext);

  // Active section inside Admin panel (dashboard, members, blogs, settings)
  const [activeSection, setActiveSection] = useState("dashboard");

  // Group Details States
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminOrMod, setIsAdminOrMod] = useState(false);
  const [myRole, setMyRole] = useState("MEMBER");

  // Member Management States
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("all"); // all, admin, member
  const [memberSubTab, setMemberSubTab] = useState("active"); // active, pending
  const [memberSort, setMemberSort] = useState("join-desc"); // join-desc, join-asc, name-asc, name-desc
  const [memberDateRange, setMemberDateRange] = useState("all"); // all, today, week, month, custom
  const [memberStartDate, setMemberStartDate] = useState("");
  const [memberEndDate, setMemberEndDate] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
  });

  const openConfirmModal = ({ title, message, onConfirm, type }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
    });
  };

  // Pending Blogs States
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);

  // Group Settings States
  const [settings, setSettings] = useState({
    memberPostApprovalRequired: false,
    memberUploadApprovalRequired: false,
    moderatorCanKick: true,
    moderatorCanApprove: true,
    moderatorCanDeletePost: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [groupEditForm, setGroupEditForm] = useState({
    name: "",
    description: "",
    avatar: "",
    banner: "",
    isPrivate: false,
    rules: [],
    isDisabled: false,
  });
  const [settingsCategory, setSettingsCategory] = useState("basic"); // basic, moderation, moderator_perms

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const data = await getGroupDetails(id, userAuth.access_token);
      setGroup(data);

      // Permissions check
      const role = data.myMembership?.role || "MEMBER";
      const status = data.myMembership?.status || "";
      const isJoined = status === "JOINED";
      const adminOrMod =
        isJoined &&
        (role === "OWNER" || role === "DEPUTY" || role === "MODERATOR");

      setMyRole(role);
      setIsAdminOrMod(adminOrMod);

      if (!adminOrMod) {
        toast.error("Bạn không có quyền truy cập trang quản trị nhóm này.");
        return navigate(`/group/${id}`);
      }

      if (data.settings) {
        setSettings(data.settings);
      }
      setGroupEditForm({
        name: data.name || "",
        description: data.description || "",
        avatar: data.avatar || "",
        banner: data.banner || "",
        isPrivate: data.isPrivate || false,
        rules: data.rules || [],
        isDisabled: data.isDisabled || false,
      });
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải thông tin nhóm.");
      navigate(`/group/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembersList = async () => {
    try {
      const activeData = await getGroupMembers(
        id,
        "JOINED",
        userAuth.access_token,
      );
      setMembers(activeData.list || []);

      const pendingData = await getGroupMembers(
        id,
        "PENDING",
        userAuth.access_token,
      );
      setPendingRequests(pendingData.list || []);
    } catch (err) {
      console.error("Failed to load members:", err);
    }
  };

  const fetchPendingPostsList = async () => {
    try {
      setLoadingBlogs(true);
      const data = await getPendingBlogs(id, userAuth.access_token);
      setPendingBlogs(data.list || []);
    } catch (err) {
      console.error("Failed to load pending blogs:", err);
    } finally {
      setLoadingBlogs(false);
    }
  };

  useEffect(() => {
    if (!userAuth.access_token) {
      toast.error("Vui lòng đăng nhập để truy cập quản trị nhóm.");
      navigate("/signin");
      return;
    }
    fetchGroupDetails();
  }, [id, userAuth.access_token]);

  useEffect(() => {
    if (isAdminOrMod) {
      fetchMembersList();
      fetchPendingPostsList();
    }
  }, [isAdminOrMod]);

  useEffect(() => {
    const sec = searchParams.get("sec");
    if (sec && ["dashboard", "members", "blogs", "settings"].includes(sec)) {
      setActiveSection(sec);
    }
  }, [searchParams]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSearchParams({ sec: section });
  };

  // --- ACTIONS ---
  const handleApproveRequest = async (userId) => {
    try {
      await approveRequest(id, userId, userAuth.access_token);
      toast.success("Phê duyệt thành viên thành công.");
      fetchMembersList();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi phê duyệt.");
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await removeMember(id, userId, userAuth.access_token);
      toast.success("Từ chối yêu cầu gia nhập thành công.");
      fetchMembersList();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi từ chối.");
    }
  };

  const handleKickMember = async (userId) => {
    if (
      !window.confirm("Bạn có chắc chắn muốn mời thành viên này ra khỏi nhóm?")
    )
      return;
    try {
      await removeMember(id, userId, userAuth.access_token);
      toast.success("Đã xóa thành viên khỏi nhóm.");
      fetchMembersList();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi xóa thành viên.");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await changeMemberRole(id, userId, newRole, userAuth.access_token);
      toast.success("Cập nhật vai trò thành công.");
      fetchMembersList();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi cập nhật vai trò.");
    }
  };

  const handleApproveBlog = async (blogId) => {
    try {
      await approveBlog(id, blogId, userAuth.access_token);
      toast.success("Đã duyệt bài viết.");
      fetchPendingPostsList();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi duyệt bài viết.");
    }
  };

  const handleRejectBlog = async (blogId) => {
    if (!window.confirm("Bạn có chắc muốn từ chối và xóa bài thảo luận này?"))
      return;
    try {
      await rejectBlog(id, blogId, userAuth.access_token);
      toast.success("Đã từ chối bài viết.");
      fetchPendingPostsList();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi từ chối bài viết.");
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsMessage("");
    try {
      const payload = {
        ...settings,
        ...groupEditForm,
      };
      const data = await updateGroupSettings(
        id,
        payload,
        userAuth.access_token,
      );
      setSettings(data.settings);
      if (data.group) {
        setGroup(data.group);
      }
      toast.success("Cập nhật cài đặt nhóm thành công!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Lỗi khi cập nhật cài đặt.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (
      !window.confirm(
        "CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn nhóm và tất cả dữ liệu liên quan bao gồm bài đăng, tài liệu. Bạn có chắc chắn muốn tiếp tục?",
      )
    )
      return;
    try {
      await deleteGroup(id, userAuth.access_token);
      toast.success("Xóa nhóm học tập thành công.");
      navigate("/groups");
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi xóa nhóm.");
    }
  };

  // Filter members list based on search, role filters, and join dates
  const filteredMembers = (members || []).filter((m) => {
    const nameMatch =
      (m.user?.personal_info?.fullname || "")
        .toLowerCase()
        .includes(memberSearch.toLowerCase()) ||
      (m.user?.personal_info?.username || "")
        .toLowerCase()
        .includes(memberSearch.toLowerCase());

    if (!nameMatch) return false;

    if (memberFilter === "admin") {
      if (
        !(m.role === "OWNER" || m.role === "DEPUTY" || m.role === "MODERATOR")
      )
        return false;
    } else if (memberFilter === "member") {
      if (m.role !== "MEMBER") return false;
    }

    // Date range filtering
    if (memberDateRange !== "all" && m.createdAt) {
      const joinDate = new Date(m.createdAt);
      const now = new Date();

      if (memberDateRange === "today") {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (joinDate < todayStart) return false;
      } else if (memberDateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (joinDate < weekAgo) return false;
      } else if (memberDateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);
        if (joinDate < monthAgo) return false;
      } else if (memberDateRange === "custom") {
        if (memberStartDate) {
          const start = new Date(memberStartDate);
          start.setHours(0, 0, 0, 0);
          if (joinDate < start) return false;
        }
        if (memberEndDate) {
          const end = new Date(memberEndDate);
          end.setHours(23, 59, 59, 999);
          if (joinDate > end) return false;
        }
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center bg-[#F8FAFC] dark:bg-[#09090B]">
        <GroupDetailsSkeleton />
      </div>
    );
  }

  if (!group || !isAdminOrMod) {
    return null;
  }

  // Define sidebar menu options
  const menuOptions = [
    { id: "dashboard", label: "Dashboard", icon: "fi-rr-chart-pie" },
    {
      id: "members",
      label: "Quản Lý Thành Viên",
      icon: "fi-rr-users",
      badge: pendingRequests.length,
    },
    {
      id: "blogs",
      label: "Quản Lý Bài Viết",
      icon: "fi-rr-document-signed",
      badge: pendingBlogs.length,
    },
    { id: "settings", label: "Cài Đặt Nhóm", icon: "fi-rr-settings" },
  ];

  return (
    <AnimationWrapper>
      <div
        className={`min-h-screen pt-14 pb-12 flex flex-col md:flex-row ${theme === "light" ? "bg-[#F8FAFC]" : "bg-[#09090B]"} font-inter`}
      >
        {/* Left Side Navigation Menu */}
        <aside className="w-full md:w-72 shrink-0 bg-white dark:bg-[#111113] border-r border-b md:border-b-0 border-slate-200/60 dark:border-white/5 flex flex-col p-6 space-y-8">
          {/* Mini Group Profile Card */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 p-4 rounded-2xl">
            <img
              src={
                group.avatar ||
                `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(group.name)}`
              }
              alt="Avatar"
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-white/5"
            />
            <div className="min-w-0">
              <h3 className="text-xs font-black text-slate-800 dark:text-white truncate font-jakarta">
                {group.name}
              </h3>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {myRole === "OWNER"
                  ? "Trưởng nhóm"
                  : myRole === "DEPUTY"
                    ? "Phó nhóm"
                    : "Kiểm duyệt"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1">
              Phân hệ quản lý
            </span>
            {menuOptions.map((opt) => {
              const isActive = activeSection === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSectionChange(opt.id)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-colors duration-200 flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fi ${opt.icon} text-sm`}></i>
                    <span>{opt.label}</span>
                  </div>
                  {opt.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black leading-none ${
                        isActive
                          ? "bg-rose-500 text-white"
                          : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="h-[1px] bg-slate-200/60 dark:bg-white/5 my-4"></div>

            {/* Back to Group */}
            <a
              href={`/group/${id}`}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/5 transition-all flex items-center gap-3"
            >
              <i className="fi fi-rr-arrow-left text-sm"></i>
              <span>Quay lại Nhóm</span>
            </a>
          </nav>
        </aside>

        {/* Main Panel Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-[1120px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="min-h-[500px]"
            >
              {/* SECTION 1: DASHBOARD */}
              {activeSection === "dashboard" && (
                <GroupDashboardTab groupId={id} token={userAuth.access_token} />
              )}

              {/* SECTION 2: MEMBER MANAGEMENT */}
              {activeSection === "members" &&
                (() => {
                  const sortedMembers = [...filteredMembers].sort((a, b) => {
                    if (memberSort === "join-desc") {
                      return (
                        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                      );
                    }
                    if (memberSort === "join-asc") {
                      return (
                        new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                      );
                    }
                    if (memberSort === "name-asc") {
                      const nameA = (
                        a.user?.personal_info?.fullname || ""
                      ).toLowerCase();
                      const nameB = (
                        b.user?.personal_info?.fullname || ""
                      ).toLowerCase();
                      return nameA.localeCompare(nameB, "vi", {
                        sensitivity: "base",
                      });
                    }
                    if (memberSort === "name-desc") {
                      const nameA = (
                        a.user?.personal_info?.fullname || ""
                      ).toLowerCase();
                      const nameB = (
                        b.user?.personal_info?.fullname || ""
                      ).toLowerCase();
                      return nameB.localeCompare(nameA, "vi", {
                        sensitivity: "base",
                      });
                    }
                    return 0;
                  });

                  const adminMembers = sortedMembers.filter(
                    (m) =>
                      m.role === "OWNER" ||
                      m.role === "DEPUTY" ||
                      m.role === "MODERATOR",
                  );
                  const regularMembers = sortedMembers.filter(
                    (m) => m.role === "MEMBER",
                  );
                  const canManageMembers =
                    myRole === "OWNER" ||
                    myRole === "DEPUTY" ||
                    (myRole === "MODERATOR" && settings?.moderatorCanKick);

                  return (
                    <div className="space-y-6">
                      {/* Section Title */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-black text-slate-900 dark:text-white font-jakarta">
                            Quản lý Thành viên
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Phê duyệt yêu cầu tham gia, điều chỉnh vai trò và
                            thăng cấp thành viên
                          </p>
                        </div>

                        {/* Sub-tabs Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl shrink-0 self-start sm:self-auto border border-slate-200/40 dark:border-white/5">
                          <button
                            onClick={() => setMemberSubTab("active")}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-colors duration-200 cursor-pointer ${
                              memberSubTab === "active"
                                ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                            }`}
                          >
                            Thành viên ({members.length})
                          </button>
                          <button
                            onClick={() => setMemberSubTab("pending")}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-colors duration-200 cursor-pointer flex items-center gap-2 ${
                              memberSubTab === "pending"
                                ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                            }`}
                          >
                            Yêu cầu tham gia
                            {pendingRequests.length > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black leading-none bg-rose-500 text-white animate-pulse">
                                {pendingRequests.length}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Sub-tab A: Pending requests */}
                      {memberSubTab === "pending" && (
                        <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] p-6 shadow-sm space-y-4">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white font-jakarta flex items-center gap-2">
                            <i className="fi fi-rr-user-time text-base text-indigo-500"></i>
                            Yêu cầu chờ duyệt ({pendingRequests.length})
                          </h3>
                          <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[550px] overflow-y-auto pr-2">
                            {pendingRequests.length > 0 ? (
                              pendingRequests.map((reqUser) => {
                                const userDetails =
                                  reqUser.user?.personal_info || {};
                                return (
                                  <div
                                    key={reqUser.user?._id}
                                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                  >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                      <img
                                        src={userDetails.profile_img}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-white/5 shrink-0"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(userDetails.fullname || "User")}`;
                                        }}
                                      />
                                      <div className="min-w-0">
                                        <div className="text-xs font-black text-slate-800 dark:text-white truncate">
                                          {userDetails.fullname ||
                                            "Người dùng ẩn danh"}
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                          @{userDetails.username || "username"}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={() =>
                                          handleRejectRequest(reqUser.user?._id)
                                        }
                                        className="px-3.5 py-2 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                      >
                                        Từ chối
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleApproveRequest(
                                            reqUser.user?._id,
                                          )
                                        }
                                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                                      >
                                        Duyệt nhận
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                                Không có yêu cầu nào đang chờ xử lý.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sub-tab B: Active members list (Split into Admin and Regular in tables) */}
                      {memberSubTab === "active" && (
                        <div className="space-y-8">
                          {/* Search, Filters, Sorting and Date Range Toolbelt */}
                          <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] p-5 shadow-sm space-y-4 font-inter">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-center">
                              {/* Search Box */}
                              <div className="relative col-span-1 md:col-span-4">
                                <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                <input
                                  type="text"
                                  placeholder="Tìm theo tên hoặc username..."
                                  value={memberSearch}
                                  onChange={(e) =>
                                    setMemberSearch(e.target.value)
                                  }
                                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-xl text-xs font-bold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors duration-200"
                                />
                              </div>

                              {/* Role Filter */}
                              <div className="col-span-1 md:col-span-2">
                                <CustomSelect
                                  value={memberFilter}
                                  onChange={setMemberFilter}
                                  options={roleOptions}
                                />
                              </div>

                              {/* Date Filter Preset */}
                              <div className="col-span-1 md:col-span-3">
                                <CustomSelect
                                  value={memberDateRange}
                                  onChange={setMemberDateRange}
                                  options={dateOptions}
                                />
                              </div>

                              {/* Sort Options */}
                              <div className="col-span-1 md:col-span-3">
                                <CustomSelect
                                  value={memberSort}
                                  onChange={setMemberSort}
                                  options={sortOptions}
                                />
                              </div>
                            </div>

                            {/* Custom Date Inputs (Conditionally Rendered) */}
                            {memberDateRange === "custom" && (
                              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-200">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                                    Từ:
                                  </span>
                                  <input
                                    type="date"
                                    value={memberStartDate}
                                    onChange={(e) =>
                                      setMemberStartDate(e.target.value)
                                    }
                                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-lg text-xs font-bold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                                    Đến:
                                  </span>
                                  <input
                                    type="date"
                                    value={memberEndDate}
                                    onChange={(e) =>
                                      setMemberEndDate(e.target.value)
                                    }
                                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-lg text-xs font-bold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    setMemberStartDate("");
                                    setMemberEndDate("");
                                  }}
                                  className="px-3 py-1.5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-[10px] font-black uppercase transition-colors duration-200 cursor-pointer"
                                >
                                  Xóa ngày
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Section 1: Management Team Table */}
                          {adminMembers.length > 0 && (
                            <div className="space-y-3">
                              <h3 className="text-xs font-black text-indigo-500 uppercase tracking-wider px-2 flex items-center gap-2 font-jakarta">
                                <i className="fi fi-sr-crown text-[10px]"></i>
                                Ban quản trị ({adminMembers.length})
                              </h3>
                              <div className="w-full overflow-x-auto lg:overflow-visible bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[24px] shadow-sm pb-12">
                                <table className="w-full min-w-[700px] border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
                                  <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-150 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-jakarta">
                                    <tr>
                                      <th scope="col" className="px-6 py-3.5">
                                        Thành viên
                                      </th>
                                      <th scope="col" className="px-6 py-3.5">
                                        Email
                                      </th>
                                      <th scope="col" className="px-6 py-3.5">
                                        Vai trò
                                      </th>
                                      <th scope="col" className="px-6 py-3.5">
                                        Ngày tham gia
                                      </th>
                                      {canManageMembers && (
                                        <th
                                          scope="col"
                                          className="px-6 py-3.5 text-right pr-8"
                                        >
                                          Thao tác
                                        </th>
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium font-inter">
                                    {adminMembers.map((m) => (
                                      <GroupMemberCard
                                        key={m.user?._id}
                                        member={m}
                                        myRole={myRole}
                                        userAuth={userAuth}
                                        settings={settings}
                                        handleKickMember={handleKickMember}
                                        handleChangeRole={handleChangeRole}
                                        openConfirmModal={openConfirmModal}
                                        canManage={canManageMembers}
                                        onMemberClick={null}
                                      />
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Section 2: Regular Members Table */}
                          <div className="space-y-3 pt-4">
                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 flex items-center gap-2 font-jakarta">
                              <i className="fi fi-rr-users text-[10px]"></i>
                              Thành viên thường ({regularMembers.length})
                            </h3>
                            {regularMembers.length > 0 ? (
                              <div className="w-full overflow-x-auto lg:overflow-visible bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[24px] shadow-sm pb-12">
                                <table className="w-full min-w-[700px] border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
                                  <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-150 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-jakarta">
                                    <tr>
                                      <th scope="col" className="px-6 py-3.5">
                                        Thành viên
                                      </th>
                                      <th scope="col" className="px-6 py-3.5">
                                        Email
                                      </th>
                                      <th scope="col" className="px-6 py-3.5">
                                        Vai trò
                                      </th>
                                      <th scope="col" className="px-6 py-3.5">
                                        Ngày tham gia
                                      </th>
                                      {canManageMembers && (
                                        <th
                                          scope="col"
                                          className="px-6 py-3.5 text-right pr-8"
                                        >
                                          Thao tác
                                        </th>
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium font-inter">
                                    {regularMembers.map((m) => (
                                      <GroupMemberCard
                                        key={m.user?._id}
                                        member={m}
                                        myRole={myRole}
                                        userAuth={userAuth}
                                        settings={settings}
                                        handleKickMember={handleKickMember}
                                        handleChangeRole={handleChangeRole}
                                        openConfirmModal={openConfirmModal}
                                        canManage={canManageMembers}
                                        onMemberClick={null}
                                      />
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[24px] p-8 text-center text-slate-400 text-xs">
                                Không có thành viên thường nào phù hợp bộ lọc.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              {/* SECTION 3: PENDING DISCUSSION POSTS */}
              {activeSection === "blogs" && (
                <div className="space-y-6">
                  {/* Section Title */}
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white font-jakarta">
                      Quản Lý Bài viết
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Kiểm duyệt các bài viết trước khi được đăng công khai lên
                      bản tin nhóm
                    </p>
                  </div>

                  {/* List */}
                  <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] p-6 shadow-sm space-y-4">
                    {loadingBlogs ? (
                      <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                        Đang tải danh sách bài viết...
                      </div>
                    ) : pendingBlogs.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {pendingBlogs.map((blog) => {
                          const authorDetails =
                            blog.author?.personal_info || {};
                          return (
                            <div
                              key={blog._id}
                              className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-6"
                            >
                              <div className="space-y-3 flex-1 min-w-0">
                                {/* Title and summary */}
                                <h3 className="text-sm font-black text-slate-800 dark:text-white font-jakarta leading-snug">
                                  {blog.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {blog.des ||
                                    "Bài viết không có mô tả chi tiết."}
                                </p>

                                {/* Author metadata */}
                                <div className="flex items-center gap-2.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                                  <img
                                    src={authorDetails.profile_img}
                                    alt="Author avatar"
                                    className="w-5 h-5 rounded-md object-cover"
                                  />
                                  <span>
                                    Đăng bởi @{authorDetails.username}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Yêu cầu lúc:{" "}
                                    {new Date(
                                      blog.createdAt || new Date(),
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2 shrink-0 self-end sm:self-start">
                                <button
                                  onClick={() => handleRejectBlog(blog._id)}
                                  className="px-4 py-2 border border-rose-500/25 hover:bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <i className="fi fi-rr-cross-small"></i>
                                  Từ chối
                                </button>
                                <button
                                  onClick={() => handleApproveBlog(blog._id)}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                                >
                                  <i className="fi fi-rr-check"></i>
                                  Phê duyệt
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mx-auto mb-3">
                          <i className="fi fi-rr-check"></i>
                        </div>
                        Tuyệt vời! Không có bài đăng nào đang chờ kiểm duyệt.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 4: GROUP SETTINGS */}
              {activeSection === "settings" && (
                <div className="space-y-6">
                  {/* Section Title */}
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white font-jakarta">
                      Cài Đặt Nhóm
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Cập nhật thông tin chung và cấu hình các quyền kiểm duyệt
                      nâng cao
                    </p>
                  </div>

                  {/* Group Settings Tab Subcomponent */}
                  <GroupSettingsTab
                    settingsCategory={settingsCategory}
                    setSettingsCategory={setSettingsCategory}
                    groupEditForm={groupEditForm}
                    setGroupEditForm={setGroupEditForm}
                    settings={settings}
                    setSettings={setSettings}
                    isSavingSettings={isSavingSettings}
                    settingsMessage={settingsMessage}
                    handleSaveSettings={handleSaveSettings}
                    handleDeleteGroup={handleDeleteGroup}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <GroupConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() =>
            setConfirmModal((prev) => ({ ...prev, isOpen: false }))
          }
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          }}
          type={confirmModal.type}
        />
      )}
    </AnimationWrapper>
  );
};

export default GroupAdminPage;
