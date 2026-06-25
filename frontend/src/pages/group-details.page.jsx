import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ThemeContext, UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// Extracted Subcomponents
import { GroupSidebar } from "../components/groups/group-sidebar.component";
import { GroupDiscussionTab } from "../components/groups/group-discussion-tab.component";
import { GroupDocumentsTab } from "../components/groups/group-documents-tab.component";
import { GroupMembersTab } from "../components/groups/group-members-tab.component";
import { GroupSettingsTab } from "../components/groups/group-settings-tab.component";
import { GroupAboutTab } from "../components/groups/group-about-tab.component";
import { GroupUploadDocModal } from "../components/groups/group-upload-doc-modal.component";
import { GroupInviteModal } from "../components/groups/group-invite-modal.component";
import { GroupMemberModal } from "../components/groups/group-member-modal.component";
import groupBannerDefault from "../imgs/group-banner-default.png";
import { GroupDetailsSkeleton } from "../components/skeleton.component";

// Group API services
import {
  getGroupDetails,
  updateGroupSettings,
  getGroupBlogs,
  getGroupMembers,
  joinGroup,
  leaveGroup,
  approveRequest,
  removeMember,
  changeMemberRole,
  getGroupDocuments,
  uploadGroupDocument,
  triggerDownload,
  deleteGroup,
  toggleMuteGroupNotifications,
  getPendingBlogs,
  approveBlog,
  rejectBlog,
} from "../services/group.service";

const GroupDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useContext(ThemeContext);
  const { userAuth } = useContext(UserContext);

  // Core component states
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("discussion"); // discussion, documents, members, settings, about
  const [blogs, setBlogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingBlogs, setPendingBlogs] = useState([]);

  // Modals / Panels
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMemberForModal, setSelectedMemberForModal] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [docForm, setDocForm] = useState({ title: "", description: "" });
  const [selectedFile, setSelectedFile] = useState(null);

  // Search & Filter state for Members Tab
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("all"); // all, admin, member

  // Permissions state
  const [settings, setSettings] = useState({
    memberPostApprovalRequired: false,
    memberUploadApprovalRequired: false,
    moderatorCanKick: true,
    moderatorCanApprove: true,
    moderatorCanDeletePost: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [isDisabledError, setIsDisabledError] = useState(false);
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

  const myRole = group?.myMembership?.role || "MEMBER";
  const isOwner = myRole === "OWNER";
  const isDeputy = myRole === "DEPUTY";
  const isMod = myRole === "MODERATOR";
  const isOwnerOrDeputy = isOwner || isDeputy;
  const isAdminOrMod = isOwner || isDeputy || isMod;
  const isJoined = group?.myMembership?.status === "JOINED";
  const showLockScreen = group?.isPrivate && !isJoined;

  // Filter members list based on search and filters
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
      return (
        m.role === "OWNER" || m.role === "DEPUTY" || m.role === "MODERATOR"
      );
    }
    if (memberFilter === "member") {
      return m.role === "MEMBER";
    }
    return true;
  });

  const adminMembers = filteredMembers.filter(
    (m) => m.role === "OWNER" || m.role === "DEPUTY" || m.role === "MODERATOR",
  );
  const regularMembers = filteredMembers.filter((m) => m.role === "MEMBER");
  const managementTeam = (members || []).filter(
    (m) => m.role === "OWNER" || m.role === "DEPUTY" || m.role === "MODERATOR",
  );

  const handleApiError = (err, defaultMessage) => {
    console.error(err);
    const status = err.response?.status;
    const errMsg = err.response?.data?.error || "";
    if (
      status === 401 ||
      status === 403 ||
      errMsg.toLowerCase().includes("token") ||
      errMsg.toLowerCase().includes("session")
    ) {
      toast.error(
        userAuth?.language === "vi"
          ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          : "Session expired. Please sign in again."
      );
      navigate("/signin");
      return true;
    }
    if (defaultMessage) {
      toast.error(errMsg || defaultMessage);
    }
    return false;
  };

  const fetchGroupDetails = async () => {
    try {
      setIsDisabledError(false);
      const data = await getGroupDetails(id, userAuth.access_token);
      setGroup(data);
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
      const errMsg = err.response?.data?.error || "";
      if (errMsg.includes("vô hiệu hóa")) {
        setIsDisabledError(true);
      } else {
        handleApiError(err, "Không thể tải thông tin nhóm.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const data = await getGroupBlogs(id, userAuth.access_token);
      setBlogs(data.list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const data = await getGroupDocuments(id, userAuth.access_token);
      setDocuments(data.list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async () => {
    try {
      const data = await getGroupMembers(id, "JOINED", userAuth.access_token);
      setMembers(data.list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const data = await getGroupMembers(id, "PENDING", userAuth.access_token);
      setPendingRequests(data.list);
    } catch (err) {
      handleApiError(err);
    }
  };

  const fetchPendingBlogs = async () => {
    try {
      const data = await getPendingBlogs(id, userAuth.access_token);
      setPendingBlogs(data.list);
    } catch (err) {
      handleApiError(err);
    }
  };

  useEffect(() => {
    if (!userAuth.access_token) {
      toast.error(userAuth.language === "vi" ? "Vui lòng đăng nhập để truy cập nhóm học tập." : "Please log in to access the learning group.");
      navigate("/signin");
    }
  }, [userAuth.access_token, userAuth.language, navigate]);

  useEffect(() => {
    if (!userAuth.access_token || !id) return;
    setLoading(true);
    fetchGroupDetails();
    fetchBlogs();
    fetchDocuments();
    fetchMembers();
    fetchPendingRequests();
  }, [id, userAuth.access_token]);

  useEffect(() => {
    if (!userAuth.access_token) return;
    const tab = searchParams.get("tab");
    const sub = searchParams.get("sub");
    if (tab && ["discussion", "documents", "members", "settings", "about"].includes(tab)) setActiveTab(tab);
    if (sub && ["all", "admin", "member", "pending"].includes(sub)) setMemberFilter(sub);
  }, [searchParams, userAuth.access_token]);

  useEffect(() => {
    if (!userAuth.access_token) return;
    if (id && isAdminOrMod) fetchPendingBlogs();
    else setPendingBlogs([]);
  }, [id, isAdminOrMod, userAuth.access_token]);

  const handleApproveBlog = async (blogId) => {
    try {
      const data = await approveBlog(id, blogId, userAuth.access_token);
      toast.success(data.message || "Đã duyệt bài viết.");
      fetchBlogs();
      fetchPendingBlogs();
    } catch (err) {
      handleApiError(err, "Lỗi khi duyệt bài viết.");
    }
  };

  const handleRejectBlog = async (blogId) => {
    try {
      const data = await rejectBlog(id, blogId, userAuth.access_token);
      toast.success(data.message || "Đã từ chối bài viết.");
      fetchPendingBlogs();
    } catch (err) {
      handleApiError(err, "Lỗi khi từ chối bài viết.");
    }
  };

  const handleToggleJoin = async () => {
    if (!userAuth.access_token) {
      toast.error(userAuth.language === "vi" ? "Vui lòng đăng nhập để tham gia nhóm." : "Please log in to join the group.");
      return navigate("/signin");
    }

    try {
      if (group.myMembership) {
        const data = await leaveGroup(id, userAuth.access_token);
        toast.success(data.message || "Rời nhóm thành công.");
      } else {
        const data = await joinGroup(id, userAuth.access_token);
        toast.success(data.message || "Gửi yêu cầu tham gia thành công.");
      }
      fetchGroupDetails();
      fetchMembers();
      fetchPendingRequests();
    } catch (err) {
      handleApiError(err, "Lỗi khi thao tác.");
    }
  };

  const handleApproveRequest = async (userId) => {
    try {
      const data = await approveRequest(id, userId, userAuth.access_token);
      toast.success(data.message || "Phê duyệt thành viên thành công.");
      fetchGroupDetails();
      fetchMembers();
      fetchPendingRequests();
    } catch (err) {
      handleApiError(err, "Lỗi khi phê duyệt.");
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      const data = await removeMember(id, userId, userAuth.access_token);
      toast.success(data.message || "Từ chối yêu cầu gia nhập thành công.");
      fetchPendingRequests();
    } catch (err) {
      handleApiError(err, "Lỗi khi từ chối.");
    }
  };

  const handleKickMember = async (userId) => {
    try {
      const data = await removeMember(id, userId, userAuth.access_token);
      toast.success(data.message || "Đã xóa thành viên khỏi nhóm.");
      fetchGroupDetails();
      fetchMembers();
    } catch (err) {
      handleApiError(err, "Lỗi khi xóa thành viên.");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const data = await changeMemberRole(
        id,
        userId,
        newRole,
        userAuth.access_token,
      );
      toast.success(data.message || "Cập nhật vai trò thành công.");
      fetchGroupDetails();
      fetchMembers();
    } catch (err) {
      handleApiError(err, "Lỗi khi cập nhật vai trò.");
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
      setSettingsMessage("Cập nhật cài đặt nhóm thành công!");
      toast.success("Cập nhật cài đặt nhóm thành công!");
    } catch (err) {
      const isAuthErr = handleApiError(err, "Lỗi khi cập nhật cài đặt.");
      if (!isAuthErr) {
        const errMsg = err.response?.data?.error || "Lỗi khi cập nhật cài đặt.";
        setSettingsMessage(errMsg);
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const data = await deleteGroup(id, userAuth.access_token);
      toast.success(data.message || "Xóa nhóm thành công.");
      navigate("/groups");
    } catch (err) {
      handleApiError(err, "Lỗi khi xóa nhóm.");
    }
  };

  const handleToggleMute = async () => {
    if (!userAuth.access_token) {
      toast.error(userAuth.language === "vi" ? "Vui lòng đăng nhập để thực hiện hành động này." : "Please log in to perform this action.");
      return navigate("/signin");
    }

    try {
      const data = await toggleMuteGroupNotifications(
        id,
        userAuth.access_token,
      );
      toast.success(data.message || "Đã cập nhật cài đặt thông báo.");

      setGroup((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          myMembership: prev.myMembership
            ? {
                ...prev.myMembership,
                muteNotifications: data.muteNotifications,
              }
            : null,
        };
      });
    } catch (err) {
      handleApiError(err, "Lỗi khi thao tác.");
    }
  };

  const handleMemberClick = (member) => {
    setSelectedMemberForModal(member);
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docForm.title.trim() || !selectedFile) {
      return toast.error("Vui lòng nhập tiêu đề và chọn file tài liệu.");
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", docForm.title);
    formData.append("description", docForm.description);
    formData.append("group", id);

    let loadingToast = toast.loading("Đang tải tài liệu lên...");
    try {
      await uploadGroupDocument(formData, userAuth.access_token);
      toast.dismiss(loadingToast);
      toast.success("Tải tài liệu lên thành công!");
      setIsDocModalOpen(false);
      setDocForm({ title: "", description: "" });
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      toast.dismiss(loadingToast);
      handleApiError(err, "Lỗi khi tải tài liệu lên.");
    }
  };

  const handleDownloadFile = async (doc) => {
    if (!doc.file_url) {
      return toast.error("Đường dẫn tải tài liệu không tồn tại.");
    }

    window.open(doc.file_url, "_blank");

    try {
      await triggerDownload(doc._id);
      setDocuments((prevDocs) =>
        prevDocs.map((d) =>
          d._id === doc._id ? { ...d, downloads: (d.downloads || 0) + 1 } : d,
        ),
      );
    } catch (err) {
      console.error("Lỗi khi ghi nhận lượt tải về:", err);
    }
  };

  if (!userAuth.access_token) {
    return null;
  }

  if (loading) {
    return <GroupDetailsSkeleton />;
  }

  if (isDisabledError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090B] transition-colors duration-500 px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] p-8 text-center shadow-2xl relative overflow-hidden font-jakarta">
          {/* Subtle colored glow overlay in background */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl mx-auto mb-6 border border-amber-500/20">
            <i className="fi fi-rr-ban"></i>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3">
            Nhóm học tập tạm thời bị vô hiệu hóa
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
            Cộng đồng học tập này đã tạm thời bị vô hiệu hóa bởi ban quản trị
            nhóm. Hiện tại thành viên thường không thể truy cập tài liệu hay nội
            dung thảo luận.
          </p>
          <button
            onClick={() => navigate("/groups")}
            className="w-full py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-98 shadow-lg shadow-slate-950/15 dark:shadow-white/10 cursor-pointer"
          >
            Quay lại danh sách nhóm
          </button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090B] transition-colors duration-500">
        <p className="text-slate-500 dark:text-slate-400 font-bold">
          Không tìm thấy nhóm học tập.
        </p>
      </div>
    );
  }

  return (
    <AnimationWrapper>
      <section
        className={`min-h-screen pb-20 ${
          theme === "light" ? "bg-[#F8FAFC]" : "bg-[#09090B]"
        } transition-colors duration-500 font-inter`}
      >
        {group.isDisabled && (
          <div className="w-full bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-500/20 py-3.5 px-5 flex items-center justify-center gap-3 text-amber-600 dark:text-amber-400 font-jakarta text-xs font-bold transition-all">
            <i className="fi fi-rr-exclamation text-sm shrink-0"></i>
            <span>
              Nhóm này đang bị vô hiệu hóa tạm thời. Chỉ có trưởng/phó nhóm mới
              nhìn thấy và quản lý cài đặt nhóm này.
            </span>
          </div>
        )}
        {/* Cover & Banner Section */}
        <div className="relative w-full h-[320px] md:h-[400px] overflow-hidden bg-slate-200 dark:bg-zinc-800">
          <img
            src={group.banner || groupBannerDefault}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = groupBannerDefault;
            }}
            className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all"
            alt="Group Banner"
            onClick={() => setLightboxImage(group.banner || groupBannerDefault)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

          {/* Group details floating overlay banner (Glassmorphism) */}
          <div className="absolute bottom-6 left-[5vw] right-[5vw] p-6 backdrop-blur-xl bg-black/55 dark:bg-[#111113]/70 border border-white/10 rounded-[32px] flex flex-col md:flex-row md:items-end justify-between gap-6 text-white shadow-2xl">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              {/* Group avatar with premium glow rings */}
              <div
                className={`w-20 h-20 md:w-28 md:h-28 rounded-3xl border-2 ${
                  isJoined
                    ? isOwner
                      ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                      : isDeputy
                        ? "border-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.5)]"
                        : isMod
                          ? "border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                          : "border-slate-300 shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                    : "border-white/20 shadow-2xl"
                } overflow-hidden bg-slate-300 shrink-0 cursor-pointer hover:scale-105 active:scale-98 transition-all`}
                onClick={() =>
                  setLightboxImage(
                    group.avatar ||
                      `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(group.name || "Group")}&backgroundColor=b3c5fc`,
                  )
                }
              >
                <img
                  src={
                    group.avatar ||
                    `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(group.name || "Group")}&backgroundColor=b3c5fc`
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(group.name || "Group")}&backgroundColor=b3c5fc`;
                  }}
                  className="w-full h-full object-cover"
                  alt="Group Avatar"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      group.isPrivate
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    <i
                      className={`fi ${
                        group.isPrivate ? "fi-rr-lock" : "fi-rr-globe"
                      } text-[10px]`}
                    ></i>
                    {group.isPrivate ? "Riêng tư" : "Công khai"}
                  </span>
                  {isJoined && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isOwner
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : isDeputy
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : isMod
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-white/10 text-slate-350 border border-white/10"
                      }`}
                    >
                      {isOwner
                        ? "Trưởng nhóm"
                        : isDeputy
                          ? "Phó nhóm"
                          : isMod
                            ? "Kiểm duyệt viên"
                            : "Thành viên"}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-black tracking-tight font-jakarta leading-tight">
                  {group.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-350">
                  <span>
                    Trực thuộc:{" "}
                    <span className="text-white">
                      @{group.creator?.personal_info?.username || "Không rõ"}
                    </span>
                  </span>
                  <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                  <span>{group.totalMembers} Thành viên</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="shrink-0 flex justify-center w-full md:w-auto">
              <button
                onClick={handleToggleJoin}
                className={`w-full md:w-auto py-3 px-8 rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                  group.myMembership?.status === "JOINED"
                    ? "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                    : group.myMembership?.status === "PENDING"
                      ? "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-450 hover:text-rose-300"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
                }`}
              >
                {group.myMembership?.status === "JOINED"
                  ? "Rời nhóm"
                  : group.myMembership?.status === "PENDING"
                    ? "Hủy yêu cầu"
                    : "Tham gia nhóm"}
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="max-w-[1400px] mx-auto mt-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Workspace (Left Column) */}
          <div className="lg:col-span-9 space-y-6">
            {/* Tabs Navigation with Animated Indicator */}
            <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[24px] p-1.5 flex gap-1 shadow-sm relative overflow-hidden">
              {[
                {
                  id: "discussion",
                  label: "Thảo luận",
                  icon: "fi-rr-comments",
                },
                { id: "documents", label: "Tài liệu", icon: "fi-rr-document" },
                { id: "members", label: "Thành viên", icon: "fi-rr-users" },
                ...(isOwnerOrDeputy
                  ? [
                      {
                        id: "settings",
                        label: "Cài đặt",
                        icon: "fi-rr-settings",
                      },
                    ]
                  : []),
                { id: "about", label: "Giới thiệu", icon: "fi-rr-info" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchParams({ tab: tab.id });
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black relative flex items-center justify-center gap-2 transition-all duration-300 z-10 ${
                      isActive
                        ? "text-white dark:text-slate-950"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeGroupTabIndicator"
                        className="absolute inset-0 bg-slate-950 dark:bg-white rounded-xl -z-10 shadow-md"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <i className={`fi ${tab.icon} text-sm`}></i>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[400px]">
              {/* Tab 1: Discussion (Blogs) */}
              {activeTab === "discussion" && (
                <GroupDiscussionTab
                  group={group}
                  showLockScreen={showLockScreen}
                  handleToggleJoin={handleToggleJoin}
                  isJoined={isJoined}
                  settings={settings}
                  id={id}
                  blogs={blogs}
                  navigate={navigate}
                  isAdminOrMod={isAdminOrMod}
                  pendingBlogs={pendingBlogs}
                  handleApproveBlog={handleApproveBlog}
                  handleRejectBlog={handleRejectBlog}
                  onAuthorClick={(author) => {
                    const member = (members || []).find(
                      (m) => m.user?._id === author._id,
                    );
                    setSelectedMemberForModal(
                      member || { role: "MEMBER", user: author },
                    );
                  }}
                  members={members}
                />
              )}

              {/* Tab 2: Documents (Bento Box cards) */}
              {activeTab === "documents" && (
                <GroupDocumentsTab
                  group={group}
                  showLockScreen={showLockScreen}
                  handleToggleJoin={handleToggleJoin}
                  isJoined={isJoined}
                  settings={settings}
                  documents={documents}
                  setIsDocModalOpen={setIsDocModalOpen}
                  handleDownloadFile={handleDownloadFile}
                />
              )}

              {/* Tab 3: Members & Roles Management */}
              {activeTab === "members" && (
                <GroupMembersTab
                  group={group}
                  showLockScreen={showLockScreen}
                  handleToggleJoin={handleToggleJoin}
                  isAdminOrMod={isAdminOrMod}
                  pendingRequests={pendingRequests}
                  myRole={myRole}
                  settings={settings}
                  handleRejectRequest={handleRejectRequest}
                  handleApproveRequest={handleApproveRequest}
                  memberSearch={memberSearch}
                  setMemberSearch={setMemberSearch}
                  memberFilter={memberFilter}
                  setMemberFilter={(filterVal) => {
                    setMemberFilter(filterVal);
                    setSearchParams((prev) => {
                      const newParams = new URLSearchParams(prev);
                      newParams.set("sub", filterVal);
                      return newParams;
                    });
                  }}
                  adminMembers={adminMembers}
                  regularMembers={regularMembers}
                  filteredMembers={filteredMembers}
                  userAuth={userAuth}
                  handleKickMember={handleKickMember}
                  handleChangeRole={handleChangeRole}
                  onMemberClick={handleMemberClick}
                />
              )}

              {/* Tab 4: Settings */}
              {activeTab === "settings" && (
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
              )}

              {/* Tab 5: About (Description & rules) */}
              {activeTab === "about" && <GroupAboutTab group={group} />}
            </div>
          </div>

          {/* About / Info Section (Right Column - sticky overview widget) */}
          <GroupSidebar
            group={group}
            blogs={blogs}
            documents={documents}
            managementTeam={managementTeam}
            isJoined={isJoined}
            onInviteClick={() => setIsInviteModalOpen(true)}
            handleToggleMute={handleToggleMute}
            onMemberClick={handleMemberClick}
          />
        </div>

        {/* Upload Document Modal */}
        <GroupUploadDocModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          docForm={docForm}
          setDocForm={setDocForm}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          handleUploadDocument={handleUploadDocument}
          theme={theme}
        />

        {/* Invite Member Modal */}
        <GroupInviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          groupId={id}
          token={userAuth.access_token}
          theme={theme}
          onSuccess={() => {
            fetchGroupDetails();
            // Optional: refresh members list if current tab is members
            if (activeTab === "members") {
              fetchMembers();
            }
          }}
        />

        {/* Member Details & Activity Modal */}
        <GroupMemberModal
          isOpen={!!selectedMemberForModal}
          onClose={() => setSelectedMemberForModal(null)}
          member={selectedMemberForModal}
          groupId={id}
          token={userAuth.access_token}
          theme={theme}
        />

        {/* Lightbox Image Viewer */}
        <AnimatePresence>
          {lightboxImage && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightboxImage(null)}
                className="absolute inset-0 bg-black/85 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 210 }}
                className="relative z-10 max-w-[90vw] max-h-[85vh] select-none"
              >
                <img
                  src={lightboxImage}
                  className="max-w-[90vw] max-h-[80vh] rounded-2xl border border-white/10 shadow-2xl object-contain"
                  alt="Lightbox Preview"
                />
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="absolute -top-12 right-0 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center cursor-pointer transition-all border border-white/15"
                >
                  <i className="fi fi-rr-cross-small text-lg"></i>
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>
    </AnimationWrapper>
  );
};

export default GroupDetailsPage;
