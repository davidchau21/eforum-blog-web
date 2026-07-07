import { useState, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import useConversation from "../../zustand/useConversation"; // Import useConversation để lấy tin nhắn
import { UserContext } from "../../App"; // Import UserContext để gọi lightbox
import useGetConversations from "../../hook/useGetConversations";
import { uploadImage } from "../../common/aws";

const SOCIAL_ICONS = {
  facebook: { icon: "fi-brands-facebook", color: "text-[#1877F2]" },
  instagram: { icon: "fi-brands-instagram", color: "text-[#E4405F]" },
  twitter: { icon: "fi-brands-twitter", color: "text-[#1DA1F2]" },
  github: { icon: "fi-brands-github", color: "text-black" },
  youtube: { icon: "fi-brands-youtube", color: "text-[#FF0000]" },
};

// ─── ChatHeader ────────────────────────────────────────────────────────────────
export const ChatHeader = ({
  conversation,
  isOnline,
  showInfo,
  onToggleInfo,
  onAddMemberClick,
}) => {
  const { userAuth } = useContext(UserContext);

  const handleCallNotImplemented = () => {
    toast.error("Tính năng cuộc gọi thoại đang được phát triển!", {
      icon: "📞",
      style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
    });
  };

  const handleVideoNotImplemented = () => {
    toast.error("Tính năng cuộc gọi video đang được phát triển!", {
      icon: "📹",
      style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
    });
  };

  const isOwner = conversation.creator === userAuth?._id;
  const canInvite =
    conversation.isGroup &&
    (isOwner || conversation.membersCanInvite !== false);

  return (
    <div className="h-[68px] bg-white/90 backdrop-blur-xl border-b border-grey px-5 flex items-center justify-between flex-shrink-0">
      {/* Left: avatar + name */}
      <div className="flex items-center gap-3.5 min-w-0">
        {conversation.isGroup ? (
          <div onClick={onToggleInfo} className="relative shrink-0 cursor-pointer group/header-avatar">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-grey group-hover/header-avatar:ring-purple/30 transition-all duration-200">
              <img
                src={
                  conversation.personal_info.profile_img ||
                  "https://cdn-icons-png.flaticon.com/512/166/166258.png"
                }
                className="w-full h-full object-cover"
                alt={conversation.personal_info.fullname}
              />
            </div>
          </div>
        ) : (
          <Link
            to={`/user/${conversation.personal_info.username}`}
            className="relative shrink-0"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-grey hover:ring-purple/30 transition-all duration-200">
              <img
                src={conversation.personal_info.profile_img}
                className="w-full h-full object-cover"
                alt={conversation.personal_info.fullname}
              />
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60"></span>
              </span>
            )}
          </Link>
        )}

        <div className="flex flex-col min-w-0">
          {conversation.isGroup ? (
            <span onClick={onToggleInfo} className="text-[14px] text-black font-bold leading-tight truncate cursor-pointer hover:text-purple transition-all duration-200">
              {conversation.personal_info.fullname}
            </span>
          ) : (
            <Link
              to={`/user/${conversation.personal_info.username}`}
              className="text-[14px] text-black font-bold hover:text-purple transition-colors duration-200 leading-tight truncate"
            >
              {conversation.personal_info.fullname}
            </Link>
          )}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-[11px] font-medium flex items-center gap-1 ${
                conversation.isGroup
                  ? "text-dark-grey"
                  : isOnline
                    ? "text-emerald-500"
                    : "text-dark-grey"
              }`}
            >
              {isOnline && !conversation.isGroup && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              )}
              {conversation.isGroup
                ? "Nhóm chat"
                : isOnline
                  ? "Active now"
                  : "Offline"}
            </span>
            {!conversation.isGroup && (
              <>
                <span className="text-dark-grey/30 text-[11px]">·</span>
                <span className="text-dark-grey/60 text-[11px] truncate">
                  @{conversation.personal_info.username}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {!conversation.isGroup && (
          <>
            <button
              onClick={handleCallNotImplemented}
              title="Voice call"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-dark-grey hover:bg-grey hover:text-black transition-all duration-200"
            >
              <i className="fi fi-rr-phone-call text-[14px]"></i>
            </button>
            <button
              onClick={handleVideoNotImplemented}
              title="Video call"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-dark-grey hover:bg-grey hover:text-black transition-all duration-200"
            >
              <i className="fi fi-rr-video-camera text-[14px]"></i>
            </button>
          </>
        )}
        {canInvite && (
          <button
            onClick={onAddMemberClick}
            title="Thêm thành viên"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-dark-grey hover:bg-grey hover:text-black transition-all duration-200"
          >
            <i className="fi fi-rr-user-add text-[14px]"></i>
          </button>
        )}
        <button
          onClick={onToggleInfo}
          title={conversation.isGroup ? "Thông tin nhóm" : "Thông tin cá nhân"}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
            showInfo
              ? "bg-purple/10 text-purple border border-purple/20"
              : "text-dark-grey hover:bg-grey hover:text-black"
          }`}
        >
          <i className="fi fi-rr-info text-[14px]"></i>
        </button>
      </div>
    </div>
  );
};

// ─── UserInfoPanel ─────────────────────────────────────────────────────────────
export const UserInfoPanel = ({
  conversation,
  isOnline,
  onClose,
  onAddMemberClick,
}) => {
  const [activeTab, setActiveTab] = useState("about"); // "about" hoặc "media"
  const [mediaTab, setMediaTab] = useState("images"); // "images", "files", "links"

  const [allMedia, setAllMedia] = useState([]); // Chứa toàn bộ media lấy từ API riêng
  const [loadingMedia, setLoadingMedia] = useState(false);

  const [groupInfo, setGroupInfo] = useState(null); // Lưu thông tin chi tiết của nhóm chat
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showDisbandConfirm, setShowDisbandConfirm] = useState(false);
  const [disbanding, setDisbanding] = useState(false);

  // States quản trị nhóm (dành cho Trưởng nhóm)
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(null); // Lưu user muốn xoá
  const [removingMember, setRemovingMember] = useState(false);
  const [showChangeCreatorConfirm, setShowChangeCreatorConfirm] =
    useState(null); // Lưu user muốn chuyển quyền
  const [changingCreator, setChangingCreator] = useState(false);
  const [togglingInvite, setTogglingInvite] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { userAuth } = useContext(UserContext);
  const { setFullScreenImage } = useContext(UserContext); // Dùng lightbox của app để xem ảnh to
  const { setSelectedConversation } = useConversation(); // Để clear cuộc trò chuyện khi rời nhóm

  const handleUpdateGroupSuccess = (groupName, groupAvatar, groupDescription) => {
    setGroupInfo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        groupName,
        groupAvatar,
        groupDescription: groupDescription ?? prev.groupDescription,
      };
    });
    setSelectedConversation({
      ...conversation,
      personal_info: {
        ...conversation.personal_info,
        fullname: groupName,
        profile_img: groupAvatar || conversation.personal_info.profile_img,
      },
    });
  };

  const hasSocialLinks =
    !conversation.isGroup &&
    conversation.social_links &&
    Object.values(conversation.social_links).some(Boolean);

  // Fetch toàn bộ media từ API mới của backend khi chuyển sang tab Media hoặc thay đổi cuộc hội thoại
  useEffect(() => {
    if (activeTab !== "media" || !conversation?._id || !userAuth?.access_token)
      return;

    const fetchAllMedia = async () => {
      setLoadingMedia(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/message/media/${conversation._id}`,
          {
            headers: {
              Authorization: `Bearer ${userAuth.access_token}`,
            },
          },
        );
        setAllMedia(data || []);
      } catch (error) {
        console.error("Lỗi khi tải tệp đa phương tiện:", error);
        toast.error("Không thể tải toàn bộ tệp đa phương tiện");
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchAllMedia();
  }, [activeTab, conversation?._id, userAuth?.access_token]);

  // Fetch chi tiết nhóm (danh sách thành viên) khi mở tab About của Group Chat
  useEffect(() => {
    if (
      activeTab !== "about" ||
      !conversation?.isGroup ||
      !conversation?._id ||
      !userAuth?.access_token
    )
      return;

    const fetchGroupInfo = async () => {
      setLoadingGroup(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/message/group/info/${conversation._id}`,
          {
            headers: {
              Authorization: `Bearer ${userAuth.access_token}`,
            },
          },
        );
        setGroupInfo(data || null); // Dùng data thay vì data.data vì BaseController không wrap
      } catch (error) {
        console.error("Lỗi khi tải thông tin nhóm:", error);
        toast.error("Không thể tải danh sách thành viên");
      } finally {
        setLoadingGroup(false);
      }
    };

    fetchGroupInfo();
  }, [
    activeTab,
    conversation?._id,
    conversation?.isGroup,
    userAuth?.access_token,
  ]);

  // Lắng nghe sự kiện thành viên được thêm thành công từ bên ngoài (e.g. ChatHeader) để cập nhật danh sách tại chỗ
  useEffect(() => {
    const handleGroupMembersUpdated = (e) => {
      const newMembers = e.detail;
      setGroupInfo((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: [...prev.participants, ...newMembers],
        };
      });
    };
    window.addEventListener("group-members-updated", handleGroupMembersUpdated);
    return () =>
      window.removeEventListener(
        "group-members-updated",
        handleGroupMembersUpdated,
      );
  }, []);

  const handleLeaveGroup = async () => {
    setLeaving(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/message/group/leave/${conversation._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        },
      );
      toast.success("Đã rời khỏi nhóm chat", {
        style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
      });
      // Phát Custom Event để Conversations sidebar tự động xoá cuộc trò chuyện nhóm này khỏi danh sách
      window.dispatchEvent(
        new CustomEvent("leave-group-success", { detail: conversation._id }),
      );
      setSelectedConversation(null); // Đóng khung chat hiện tại
      onClose(); // Đóng thanh panel thông tin
    } catch (error) {
      console.error("Lỗi khi rời nhóm:", error);
      toast.error("Không thể rời khỏi nhóm chat");
    } finally {
      setLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  const handleDisbandGroup = async () => {
    setDisbanding(true);
    const loadingToast = toast.loading("Đang giải tán nhóm...");
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/message/group/disband/${conversation._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        },
      );
      toast.success("Đã giải tán nhóm chat thành công", { id: loadingToast });
      window.dispatchEvent(
        new CustomEvent("leave-group-success", { detail: conversation._id }),
      );
      setSelectedConversation(null);
      onClose();
    } catch (error) {
      console.error("Lỗi khi giải tán nhóm:", error);
      const msg = error.response?.data?.error || "Không thể giải tán nhóm";
      toast.error(msg, { id: loadingToast });
    } finally {
      setDisbanding(false);
      setShowDisbandConfirm(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setRemovingMember(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/message/group/remove-member/${conversation._id}`,
        { memberId },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        },
      );
      toast.success("Đã xóa thành viên ra khỏi nhóm", {
        style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
      });
      setGroupInfo((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p._id !== memberId),
      }));
    } catch (error) {
      console.error("Lỗi khi xóa thành viên:", error);
      const msg = error.response?.data?.error || "Không thể xóa thành viên";
      toast.error(msg);
    } finally {
      setRemovingMember(false);
      setShowRemoveMemberConfirm(null);
    }
  };

  const handleChangeCreator = async (newCreatorId) => {
    setChangingCreator(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/message/group/change-creator/${conversation._id}`,
        { newCreatorId },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        },
      );
      toast.success("Đã chuyển quyền trưởng nhóm thành công", {
        style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
      });
      setGroupInfo((prev) => ({
        ...prev,
        creator: newCreatorId,
      }));
    } catch (error) {
      console.error("Lỗi khi chuyển quyền trưởng nhóm:", error);
      const msg =
        error.response?.data?.error || "Không thể chuyển quyền trưởng nhóm";
      toast.error(msg);
    } finally {
      setChangingCreator(false);
      setShowChangeCreatorConfirm(null);
    }
  };

  const handleToggleInvitePermission = async () => {
    if (!groupInfo) return;
    setTogglingInvite(true);
    const newValue = !groupInfo.membersCanInvite;
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/message/group/toggle-invite/${conversation._id}`,
        { membersCanInvite: newValue },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        },
      );
      toast.success(
        newValue ? "Cho phép mọi thành viên mời" : "Đã tắt tính năng tự ý mời",
        {
          style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
        },
      );
      setGroupInfo((prev) => ({
        ...prev,
        membersCanInvite: newValue,
      }));
    } catch (error) {
      console.error("Lỗi khi cập nhật quyền mời:", error);
      toast.error("Không thể cập nhật quyền mời");
    } finally {
      setTogglingInvite(false);
    }
  };

  // Phân loại tệp đa phương tiện từ toàn bộ lịch sử (allMedia) thay vì tin nhắn phân trang
  const mediaItems = allMedia.filter(
    (m) => m.type?.startsWith("image") || m.type?.startsWith("video"),
  );

  const fileItems = allMedia.filter((m) => m.type?.startsWith("application"));

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const linkItems = allMedia
    .filter((m) => m.type === "text" && urlRegex.test(m.message))
    .map((m) => {
      const urls = m.message.match(urlRegex) || [];
      return { ...m, urls };
    })
    .flatMap((m) => m.urls);

  return (
    <>
      <div className="w-full md:w-[288px] absolute md:static inset-y-0 right-0 bg-white border-l border-grey z-20 flex flex-col overflow-hidden shadow-xl md:shadow-none">
        {/* Panel header */}
        <div className="h-[68px] px-5 border-b border-grey flex items-center justify-between flex-shrink-0">
          <h3 className="text-[13px] font-bold text-black tracking-wide">
            {conversation.isGroup ? "Group Info" : "User Info"}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-grey hover:bg-grey hover:text-black transition-all"
          >
            <i className="fi fi-rr-cross text-[10px]"></i>
          </button>
        </div>

        {/* User/Group Basic Info */}
        <div className="p-5 pb-3 flex flex-col items-center text-center flex-shrink-0 gap-0 border-b border-grey bg-grey/5">
          {/* Avatar */}
          <div className="relative mb-2.5">
            <div className="w-[64px] h-[64px] rounded-full p-[2px] bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white flex items-center justify-center">
                <img
                  src={
                    conversation.personal_info.profile_img ||
                    "https://cdn-icons-png.flaticon.com/512/166/166258.png"
                  }
                  className="w-full h-full object-cover"
                  alt={conversation.personal_info.fullname}
                />
              </div>
            </div>
            {isOnline && !conversation.isGroup && (
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60"></span>
              </span>
            )}
          </div>

          {/* Name */}
          <div className="flex items-center gap-1.5 max-w-full px-2">
            <h4 className="text-[14px] font-bold text-black leading-snug capitalize truncate">
              {conversation.personal_info.fullname}
            </h4>
            {conversation.isGroup && groupInfo?.creator === userAuth._id && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                title="Chỉnh sửa thông tin nhóm"
                className="w-5 h-5 rounded-md hover:bg-grey flex items-center justify-center text-dark-grey hover:text-black transition-all active:scale-95 flex-shrink-0"
              >
                <i className="fi fi-rr-edit text-[10px]"></i>
              </button>
            )}
          </div>
          {!conversation.isGroup && (
            <p className="text-[11px] text-dark-grey mt-0.5">
              @{conversation.personal_info.username}
            </p>
          )}
        </div>

        {/* Tabs Selector */}
        <div className="flex border-b border-grey bg-grey/30 p-1 mx-4 my-3 rounded-xl flex-shrink-0">
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
              activeTab === "about"
                ? "bg-white text-black shadow-sm"
                : "text-dark-grey hover:text-black"
            }`}
          >
            {conversation.isGroup ? "Thành viên" : "Thông tin"}
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
              activeTab === "media"
                ? "bg-white text-black shadow-sm"
                : "text-dark-grey hover:text-black"
            }`}
          >
            Tệp & Liên kết
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide flex flex-col">
          {activeTab === "about" ? (
            <div className="flex flex-col gap-4 flex-1">
              {/* Active state badge (Direct Chat only) */}
              {isOnline && !conversation.isGroup && (
                <div className="flex justify-center">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-emerald-500/15">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Active now
                  </span>
                </div>
              )}

              {/* Bio / Description */}
              <div className="w-full text-left">
                <h5 className="text-[10px] font-bold text-dark-grey uppercase tracking-widest mb-1.5">
                  {conversation.isGroup ? "Mô tả nhóm" : "About"}
                </h5>
                <p className="text-[12px] text-black leading-relaxed italic whitespace-pre-wrap">
                  {conversation.isGroup ? (
                    <span className="not-italic text-dark-grey">
                      {groupInfo?.groupDescription || "Chưa có mô tả nhóm."}
                    </span>
                  ) : (
                    conversation.personal_info.bio || (
                      <span className="text-dark-grey not-italic">
                        No bio yet.
                      </span>
                    )
                  )}
                </p>
              </div>

              {/* Hướng rẽ nhánh hiển thị: 1-1 thì hiện Social Links, Nhóm thì hiện Danh sách thành viên */}
              {!conversation.isGroup ? (
                /* CHAT 1-1: SOCIAL LINKS */
                hasSocialLinks && (
                  <div className="w-full text-left pt-2 border-t border-grey">
                    <h5 className="text-[10px] font-bold text-dark-grey uppercase tracking-widest mb-2.5">
                      Social
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(conversation.social_links).map(
                        ([platform, link]) => {
                          if (!link) return null;
                          const meta = SOCIAL_ICONS[platform] ?? {
                            icon: "fi-rr-globe",
                            color: "text-dark-grey",
                          };
                          return (
                            <a
                              key={platform}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={platform}
                              className="w-8 h-8 rounded-lg bg-grey hover:bg-grey/60 flex items-center justify-center transition-all hover:scale-110"
                            >
                              <i
                                className={`fi ${meta.icon} ${meta.color} text-[14px]`}
                              ></i>
                            </a>
                          );
                        },
                      )}
                    </div>
                  </div>
                )
              ) : (
                /* CHAT NHÓM: DANH SÁCH THÀNH VIÊN */
                <div className="w-full text-left pt-2 border-t border-grey flex-1 flex flex-col min-h-0">
                  {/* Trưởng nhóm: Nút toggle cho phép thành viên khác mời hay không */}
                  {groupInfo && groupInfo.creator === userAuth._id && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-grey/30 mb-3 flex-shrink-0">
                      <span className="text-[11.5px] font-semibold text-black">
                        Thành viên khác có thể mời
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleInvitePermission}
                        disabled={togglingInvite}
                        className={`w-9 h-5 rounded-full p-0.5 transition-all duration-200 flex items-center ${
                          groupInfo.membersCanInvite
                            ? "bg-purple justify-end"
                            : "bg-dark-grey/30 justify-start"
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-sm"></span>
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-2.5 flex-shrink-0">
                    <h5 className="text-[10px] font-bold text-dark-grey uppercase tracking-widest">
                      Thành viên nhóm ({groupInfo?.participants?.length || 0})
                    </h5>
                    {groupInfo &&
                    (groupInfo.creator === userAuth._id ||
                      groupInfo.membersCanInvite !== false) ? (
                      <button
                        onClick={onAddMemberClick}
                        className="text-[10px] font-bold text-purple bg-purple/10 border border-purple/15 hover:bg-purple/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <i className="fi fi-rr-plus text-[9px]"></i>
                        Thêm
                      </button>
                    ) : (
                      <span className="text-[9px] text-dark-grey italic">
                        Quyền mời bị khóa
                      </span>
                    )}
                  </div>
                  {loadingGroup ? (
                    <div className="flex flex-col gap-2.5 animate-pulse py-2">
                      <div className="h-8 bg-grey rounded-xl w-full"></div>
                      <div className="h-8 bg-grey rounded-xl w-full"></div>
                      <div className="h-8 bg-grey rounded-xl w-full"></div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto max-h-[300px] flex flex-col gap-2 pr-1 scrollbar-hide">
                      {groupInfo?.participants?.map((member) => {
                        const isMemberOwner = groupInfo.creator === member._id;
                        const isSelf = member._id === userAuth._id;
                        const isOwner = groupInfo.creator === userAuth._id;

                        return (
                          <div
                            key={member._id}
                            className="flex items-center gap-2.5 p-1.5 rounded-xl group/member hover:bg-grey/30 transition-all"
                          >
                            <Link
                              to={`/user/${member.personal_info.username}`}
                              className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-grey bg-grey"
                            >
                              <img
                                src={member.personal_info.profile_img}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            </Link>
                            <div className="flex flex-col min-w-0 flex-1">
                              <Link
                                to={`/user/${member.personal_info.username}`}
                                className="text-[11.5px] font-bold text-black truncate hover:text-purple transition-all leading-tight"
                              >
                                {member.personal_info.fullname}
                              </Link>
                              <span className="text-[9px] text-dark-grey leading-none mt-0.5">
                                @{member.personal_info.username}
                              </span>
                            </div>

                            {/* Roles and Actions */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {isMemberOwner && (
                                <span className="text-[8px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <i className="fi fi-ss-crown text-[8px] text-amber-500"></i>
                                  Trưởng nhóm
                                </span>
                              )}

                              {isOwner && !isSelf && (
                                <div className="hidden group-hover/member:flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      setShowChangeCreatorConfirm(member)
                                    }
                                    title="Chuyển quyền trưởng nhóm"
                                    className="w-5.5 h-5.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-600 border border-amber-500/15 flex items-center justify-center transition-all active:scale-95"
                                  >
                                    <i className="fi fi-rr-crown text-[10px]"></i>
                                  </button>
                                  <button
                                    onClick={() =>
                                      setShowRemoveMemberConfirm(member)
                                    }
                                    title="Xóa thành viên"
                                    className="w-5.5 h-5.5 rounded-lg bg-red/10 hover:bg-red/20 text-red border border-red/15 flex items-center justify-center transition-all active:scale-95"
                                  >
                                    <i className="fi fi-rr-trash text-[10px]"></i>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* View Profile CTA hoặc nút Rời/Giải tán nhóm chat ở cuối */}
              <div className="w-full pt-4 mt-auto border-t border-grey flex-shrink-0">
                {!conversation.isGroup ? (
                  <Link
                    to={`/user/${conversation.personal_info.username}`}
                    className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-500/20 hover:-translate-y-0.5"
                  >
                    <i className="fi fi-rr-user text-[12px]"></i>
                    View Profile
                  </Link>
                ) : (groupInfo?.creator === userAuth?._id || conversation.creator === userAuth?._id) ? (
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setShowDisbandConfirm(true)}
                      className="w-full py-2.5 bg-red text-white hover:bg-red/90 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-red/10 active:scale-98"
                    >
                      <i className="fi fi-rr-trash text-[12px]"></i>
                      Giải tán nhóm
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLeaveConfirm(true)}
                      className="w-full py-2.5 bg-red/10 border border-red/15 hover:bg-red/20 text-red rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
                    >
                      <i className="fi fi-rr-exit text-[12px]"></i>
                      Rời nhóm chat
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLeaveConfirm(true)}
                    className="w-full py-2.5 bg-red/10 border border-red/15 hover:bg-red/20 text-red rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <i className="fi fi-rr-exit text-[12px]"></i>
                    Rời nhóm chat
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* TAB ĐA PHƯƠNG TIỆN (MEDIA) */
            <div className="flex flex-col h-full min-h-0 flex-1">
              {/* Sub-tabs selector */}
              <div className="flex gap-1.5 border-b border-grey pb-2.5 mb-3 flex-shrink-0">
                <button
                  onClick={() => setMediaTab("images")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    mediaTab === "images"
                      ? "bg-purple/10 text-purple border border-purple/20"
                      : "text-dark-grey hover:bg-grey"
                  }`}
                >
                  Ảnh ({mediaItems.length})
                </button>
                <button
                  onClick={() => setMediaTab("files")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    mediaTab === "files"
                      ? "bg-purple/10 text-purple border border-purple/20"
                      : "text-dark-grey hover:bg-grey"
                  }`}
                >
                  Tệp ({fileItems.length})
                </button>
                <button
                  onClick={() => setMediaTab("links")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    mediaTab === "links"
                      ? "bg-purple/10 text-purple border border-purple/20"
                      : "text-dark-grey hover:bg-grey"
                  }`}
                >
                  Link ({linkItems.length})
                </button>
              </div>

              {/* Sub-tab Contents */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {loadingMedia ? (
                  /* Skeleton loading cho media */
                  <div className="flex flex-col gap-3 py-4 animate-pulse">
                    {mediaTab === "images" ? (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="aspect-square bg-grey rounded-xl"></div>
                        <div className="aspect-square bg-grey rounded-xl"></div>
                        <div className="aspect-square bg-grey rounded-xl"></div>
                      </div>
                    ) : (
                      <>
                        <div className="h-10 bg-grey rounded-xl w-full"></div>
                        <div className="h-10 bg-grey rounded-xl w-full"></div>
                        <div className="h-10 bg-grey rounded-xl w-full"></div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {mediaTab === "images" &&
                      (mediaItems.length === 0 ? (
                        <p className="text-[11px] text-dark-grey/60 text-center py-6">
                          Không có hình ảnh/video nào.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {mediaItems.map((m) => (
                            <div
                              key={m._id}
                              onClick={() => {
                                if (m.type?.startsWith("image")) {
                                  setFullScreenImage(m.message);
                                } else {
                                  window.open(m.message, "_blank");
                                }
                              }}
                              className="aspect-square rounded-xl overflow-hidden border border-grey bg-grey group relative block cursor-zoom-in"
                            >
                              {m.type?.startsWith("image") ? (
                                <img
                                  src={m.message}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white gap-1">
                                  <i className="fi fi-rr-video-camera text-[18px]"></i>
                                  <span className="text-[8px] font-bold">
                                    VIDEO
                                  </span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <i className="fi fi-rr-eye text-white text-[12px]"></i>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}

                    {mediaTab === "files" &&
                      (fileItems.length === 0 ? (
                        <p className="text-[11px] text-dark-grey/60 text-center py-6">
                          Không có tệp tin nào được chia sẻ.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {fileItems.map((m) => (
                            <div
                              key={m._id}
                              className="flex items-center justify-between p-2.5 bg-grey/50 hover:bg-grey border border-grey rounded-xl group transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                                  <i className="fi fi-rr-file-pdf text-[14px]"></i>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[11px] font-semibold text-black truncate max-w-[130px]">
                                    {m.fileName || "Tệp tin"}
                                  </span>
                                  <span className="text-[9px] text-dark-grey">
                                    PDF Document
                                  </span>
                                </div>
                              </div>
                              <a
                                href={m.message}
                                download
                                className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-dark-grey hover:text-black border border-grey shadow-sm opacity-80 hover:opacity-100 transition-opacity"
                              >
                                <i className="fi fi-rr-download text-[11px]"></i>
                              </a>
                            </div>
                          ))}
                        </div>
                      ))}

                    {mediaTab === "links" &&
                      (linkItems.length === 0 ? (
                        <p className="text-[11px] text-dark-grey/60 text-center py-6">
                          Không có liên kết nào.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {linkItems.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2.5 bg-grey/50 hover:bg-grey border border-grey rounded-xl transition-all group min-w-0 overflow-hidden"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                                  <i className="fi fi-rr-link text-[13px]"></i>
                                </div>
                                <span className="text-[11px] text-blue-600 font-semibold truncate hover:underline flex-1">
                                  {link}
                                </span>
                              </div>
                              <i className="fi fi-rr-arrow-up-right text-[10px] text-dark-grey/60 group-hover:text-black ml-1 flex-shrink-0"></i>
                            </a>
                          ))}
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Portal Modal Xác nhận rời nhóm chat */}
      {showLeaveConfirm &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#09090b] w-full max-w-sm rounded-2xl border border-grey p-6 shadow-2xl animate-scaleUp">
              <div className="flex items-center gap-3 text-red mb-3">
                <div className="w-10 h-10 rounded-full bg-red/10 flex items-center justify-center">
                  <i className="fi fi-rr-exit text-lg"></i>
                </div>
                <h3 className="text-[16px] font-bold text-black dark:text-white">
                  Rời khỏi nhóm?
                </h3>
              </div>

              {(groupInfo?.creator === userAuth?._id || conversation.creator === userAuth?._id) && 
              ((groupInfo?.participants?.length || conversation.participants?.length || 0) > 1) ? (
                <p className="text-[13px] text-dark-grey leading-relaxed mb-6">
                  Bạn đang là <strong className="text-black dark:text-white">Trưởng nhóm</strong>. Bạn <strong className="text-red">bắt buộc phải chuyển quyền trưởng nhóm</strong> cho một thành viên khác trước khi rời khỏi nhóm. Hoặc bạn có thể chọn tính năng **Giải tán nhóm** để xóa hoàn toàn nhóm chat này.
                </p>
              ) : (
                <p className="text-[13px] text-dark-grey leading-relaxed mb-6">
                  Bạn có chắc muốn rời khỏi nhóm chat{" "}
                  <strong className="text-black dark:text-white">
                    "{conversation.personal_info.fullname}"
                  </strong>
                  ? Bạn sẽ không thể xem lại lịch sử tin nhắn hoặc nhận thêm tin
                  nhắn mới từ nhóm này nữa.
                </p>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  disabled={leaving}
                  className="px-4 py-2 text-[12px] font-bold text-dark-grey hover:bg-grey rounded-xl transition-all"
                >
                  {((groupInfo?.creator === userAuth?._id || conversation.creator === userAuth?._id) && 
                   ((groupInfo?.participants?.length || conversation.participants?.length || 0) > 1)) ? "Đóng" : "Hủy"}
                </button>
                {!((groupInfo?.creator === userAuth?._id || conversation.creator === userAuth?._id) && 
                  ((groupInfo?.participants?.length || conversation.participants?.length || 0) > 1)) && (
                  <button
                    onClick={handleLeaveGroup}
                    disabled={leaving}
                    className="px-4 py-2 text-[12px] font-bold text-white bg-red hover:opacity-90 rounded-xl shadow-md shadow-red/20 transition-all flex items-center gap-1.5"
                  >
                    {leaving ? (
                      <>
                        <i className="fi fi-rr-spinner animate-spin"></i>
                        Đang rời nhóm...
                      </>
                    ) : (
                      "Xác nhận rời"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Portal Modal Xác nhận giải tán nhóm chat */}
      {showDisbandConfirm &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#09090b] w-full max-w-sm rounded-2xl border border-grey p-6 shadow-2xl animate-scaleUp">
              <div className="flex items-center gap-3 text-red mb-3">
                <div className="w-10 h-10 rounded-full bg-red/10 flex items-center justify-center">
                  <i className="fi fi-rr-trash text-lg"></i>
                </div>
                <h3 className="text-[16px] font-bold text-black dark:text-white">
                  Giải tán nhóm?
                </h3>
              </div>

              <p className="text-[13px] text-dark-grey leading-relaxed mb-6">
                Bạn có chắc chắn muốn giải tán nhóm chat{" "}
                <strong className="text-black dark:text-white">
                  "{conversation.personal_info.fullname}"
                </strong>
                ? Hành động này sẽ **xóa hoàn toàn nhóm chat và toàn bộ lịch sử tin nhắn** liên quan. Mọi thành viên sẽ bị đẩy khỏi nhóm ngay lập tức và không thể khôi phục lại!
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDisbandConfirm(false)}
                  disabled={disbanding}
                  className="px-4 py-2 text-[12px] font-bold text-dark-grey hover:bg-grey rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDisbandGroup}
                  disabled={disbanding}
                  className="px-4 py-2 text-[12px] font-bold text-white bg-red hover:opacity-90 rounded-xl shadow-md shadow-red/20 transition-all flex items-center gap-1.5"
                >
                  {disbanding ? (
                    <>
                      <i className="fi fi-rr-spinner animate-spin"></i>
                      Đang giải tán...
                    </>
                  ) : (
                    "Xác nhận giải tán"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Portal Modal Xác nhận xóa thành viên */}
      {showRemoveMemberConfirm &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#09090b] w-full max-w-sm rounded-2xl border border-grey p-6 shadow-2xl animate-scaleUp">
              <div className="flex items-center gap-3 text-red mb-3">
                <div className="w-10 h-10 rounded-full bg-red/10 flex items-center justify-center">
                  <i className="fi fi-rr-user-remove text-lg"></i>
                </div>
                <h3 className="text-[16px] font-bold text-black dark:text-white">
                  Xóa thành viên?
                </h3>
              </div>

              <p className="text-[13px] text-dark-grey leading-relaxed mb-6">
                Bạn có chắc chắn muốn xóa thành viên{" "}
                <strong className="text-black dark:text-white">
                  "{showRemoveMemberConfirm.personal_info.fullname}"
                </strong>{" "}
                khỏi nhóm chat này?
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowRemoveMemberConfirm(null)}
                  disabled={removingMember}
                  className="px-4 py-2 text-[12px] font-bold text-dark-grey hover:bg-grey rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={() =>
                    handleRemoveMember(showRemoveMemberConfirm._id)
                  }
                  disabled={removingMember}
                  className="px-4 py-2 text-[12px] font-bold text-white bg-red hover:opacity-90 rounded-xl shadow-md shadow-red/20 transition-all flex items-center gap-1.5"
                >
                  {removingMember ? (
                    <>
                      <i className="fi fi-rr-spinner animate-spin"></i>
                      Đang xóa...
                    </>
                  ) : (
                    "Xác nhận xóa"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Portal Modal Xác nhận chuyển quyền Trưởng nhóm */}
      {showChangeCreatorConfirm &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#09090b] w-full max-w-sm rounded-2xl border border-grey p-6 shadow-2xl animate-scaleUp">
              <div className="flex items-center gap-3 text-amber-600 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <i className="fi fi-rr-crown text-lg"></i>
                </div>
                <h3 className="text-[16px] font-bold text-black dark:text-white">
                  Chuyển Trưởng nhóm?
                </h3>
              </div>

              <p className="text-[13px] text-dark-grey leading-relaxed mb-6">
                Bạn có chắc chắn muốn chuyển quyền Trưởng nhóm cho{" "}
                <strong className="text-black dark:text-white">
                  "{showChangeCreatorConfirm.personal_info.fullname}"
                </strong>
                ? Hành động này không thể hoàn tác, bạn sẽ trở thành thành viên
                thường.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowChangeCreatorConfirm(null)}
                  disabled={changingCreator}
                  className="px-4 py-2 text-[12px] font-bold text-dark-grey hover:bg-grey rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={() =>
                    handleChangeCreator(showChangeCreatorConfirm._id)
                  }
                  disabled={changingCreator}
                  className="px-4 py-2 text-[12px] font-bold text-white bg-amber-600 hover:opacity-90 rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  {changingCreator ? (
                    <>
                      <i className="fi fi-rr-spinner animate-spin"></i>
                      Đang chuyển...
                    </>
                  ) : (
                    "Xác nhận chuyển"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal Sửa thông tin nhóm */}
      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        conversation={conversation}
        groupInfo={groupInfo}
        userAuth={userAuth}
        onUpdateSuccess={handleUpdateGroupSuccess}
      />
    </>
  );
};

// ─── NoChatSelected ────────────────────────────────────────────────────────────
export const NoChatSelected = () => (
  <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center relative overflow-hidden">
    {/* Decorative blobs */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
    </div>

    <div className="max-w-[260px] flex flex-col items-center relative z-10">
      {/* Icon container */}
      <div className="w-20 h-20 rounded-2xl bg-purple/8 border border-purple/15 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/5">
        <i className="fi fi-rr-messages text-[32px] text-purple"></i>
      </div>

      <h3 className="text-[18px] font-bold text-black mb-2 tracking-tight">
        Your Messages
      </h3>
      <p className="text-dark-grey text-[12px] mb-7 leading-relaxed">
        Pick a conversation from the sidebar to start chatting.
      </p>

      {/* Feature pills */}
      <div className="flex flex-col gap-2 w-full">
        {[
          {
            icon: "fi-rr-shield-check",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-500",
            label: "Safe & Secure",
            sub: "End-to-end encrypted",
          },
          {
            icon: "fi-rr-bolt",
            iconBg: "bg-purple/10",
            iconColor: "text-purple",
            label: "Real-time",
            sub: "Instant message delivery",
          },
        ].map(({ icon, iconBg, iconColor, label, sub }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-3 bg-grey/50 border border-grey rounded-xl text-left"
          >
            <div
              className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}
            >
              <i className={`fi ${icon} ${iconColor} text-[14px]`}></i>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-black">{label}</p>
              <p className="text-[10px] text-dark-grey mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── AddMembersModal ───────────────────────────────────────────────────────────
export const AddMembersModal = ({
  isOpen,
  onClose,
  conversationId,
  existingParticipants,
  onAddSuccess,
  userAuth,
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const { conversations } = useGetConversations();

  if (!isOpen) return null;

  // Lọc ra các liên hệ 1-1 có sẵn từ danh sách sidebar
  const contacts = (conversations || []).filter(
    (c) => !c.isGroup && c.personal_info,
  );

  // Lọc bỏ những thành viên đã có trong nhóm
  const existingIds = (existingParticipants || []).map((p) => p._id);
  const eligibleContacts = contacts.filter((c) => !existingIds.includes(c._id));

  // Tìm kiếm liên hệ trong danh sách
  const filteredContacts = eligibleContacts.filter(
    (c) =>
      c.personal_info.fullname
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      c.personal_info.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/message/group/add-members/${conversationId}`,
        { participantIds: selectedUsers },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        },
      );
      toast.success("Đã thêm thành viên vào nhóm thành công", {
        style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
      });

      // Lấy chi tiết các user được add để append vào state của parent
      const addedMembersDetails = eligibleContacts
        .filter((c) => selectedUsers.includes(c._id))
        .map((c) => ({
          _id: c._id,
          personal_info: {
            fullname: c.personal_info.fullname,
            username: c.personal_info.username,
            profile_img: c.personal_info.profile_img,
          },
        }));

      onAddSuccess(addedMembersDetails);
      setSelectedUsers([]);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || "Không thể thêm thành viên";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#09090b] w-full max-w-sm rounded-2xl border border-grey shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-grey flex items-center justify-between flex-shrink-0">
          <h3 className="text-[14px] font-bold text-black dark:text-white flex items-center gap-2">
            <i className="fi fi-rr-user-add text-purple text-[13px]"></i>
            Thêm thành viên mới
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-grey hover:bg-grey transition-all"
          >
            <i className="fi fi-rr-cross text-[10px]"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-5 flex-1 overflow-y-auto space-y-4 scrollbar-hide">
            {/* Tìm kiếm */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bạn bè..."
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-grey text-[12px] bg-grey/20 focus:outline-none focus:border-purple/30 text-black placeholder:text-dark-grey/50"
              />
              <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-dark-grey"></i>
            </div>

            {/* List */}
            <div className="flex-1 min-h-[150px] max-h-[220px] overflow-y-auto border border-grey/85 rounded-xl p-1 bg-grey/5 flex flex-col gap-1">
              {filteredContacts.length === 0 ? (
                <p className="text-[11px] text-dark-grey/60 text-center py-6">
                  Không còn bạn bè nào để thêm.
                </p>
              ) : (
                filteredContacts.map((contact) => {
                  const isChecked = selectedUsers.includes(contact._id);
                  return (
                    <div
                      key={contact._id}
                      onClick={() => handleUserToggle(contact._id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        isChecked
                          ? "bg-purple/5 border border-purple/10"
                          : "hover:bg-grey/30 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={contact.personal_info.profile_img}
                          className="w-7 h-7 rounded-full object-cover border border-grey bg-grey"
                          alt=""
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11.5px] font-bold text-black truncate leading-tight">
                            {contact.personal_info.fullname}
                          </span>
                          <span className="text-[9px] text-dark-grey leading-none mt-0.5">
                            @{contact.personal_info.username}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          isChecked
                            ? "bg-purple border-purple text-white"
                            : "border-dark-grey/30 bg-white"
                        }`}
                      >
                        {isChecked && (
                          <i className="fi fi-rr-check text-[8px]"></i>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-grey bg-grey/5 flex justify-end gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-dark-grey hover:bg-grey"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || selectedUsers.length === 0}
              className="px-4 py-2 rounded-xl text-[11px] font-bold text-white bg-purple hover:opacity-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-purple/15"
            >
              {loading ? "Đang thêm..." : "Xác nhận thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── EditGroupModal ────────────────────────────────────────────────────────────
const EditGroupModal = ({ isOpen, onClose, conversation, groupInfo, userAuth, onUpdateSuccess }) => {
  const [groupName, setGroupName] = useState(conversation.personal_info.fullname);
  const [groupAvatar, setGroupAvatar] = useState(conversation.personal_info.profile_img || "");
  const [groupDescription, setGroupDescription] = useState(groupInfo?.groupDescription || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGroupName(conversation.personal_info.fullname);
      setGroupAvatar(conversation.personal_info.profile_img || "");
      setGroupDescription(groupInfo?.groupDescription || "");
    }
  }, [isOpen, conversation, groupInfo]);

  if (!isOpen) return null;

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const loadingToast = toast.loading("Đang tải ảnh lên...");
    try {
      const url = await uploadImage(file);
      setGroupAvatar(url);
      toast.success("Tải ảnh lên thành công", { id: loadingToast });
    } catch (err) {
      toast.error("Không thể tải ảnh lên", { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      return toast.error("Tên nhóm không được để trống");
    }
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/message/group/update/${conversation._id}`,
        { groupName, groupAvatar, groupDescription },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      );
      toast.success("Đã cập nhật thông tin nhóm thành công", {
        style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
      });
      onUpdateSuccess(groupName, groupAvatar, groupDescription);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || "Không thể cập nhật thông tin nhóm";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-2xl w-full max-w-sm rounded-3xl border border-grey/80 dark:border-grey/10 shadow-2xl overflow-hidden flex flex-col p-6 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-grey/60 dark:border-grey/10 mb-5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple/10 flex items-center justify-center text-purple">
              <i className="fi fi-rr-edit text-[11px]"></i>
            </div>
            <h3 className="text-[12.5px] font-bold text-black dark:text-white tracking-tight">
              Sửa thông tin nhóm
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-dark-grey/70 hover:bg-grey/80 dark:hover:bg-grey/10 transition-all hover:text-black"
          >
            <i className="fi fi-rr-cross text-[9px]"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload Container */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group/avatar cursor-pointer">
              <input
                id="group-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading || loading}
                className="hidden"
              />
              <label htmlFor="group-avatar-upload" className="cursor-pointer block relative">
                {/* Outer ring */}
                <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/10">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-grey/30 flex items-center justify-center relative bg-white">
                    <img
                      src={groupAvatar || "https://cdn-icons-png.flaticon.com/512/166/166258.png"}
                      className={`w-full h-full object-cover transition-all ${
                        uploading ? "opacity-20 blur-[1px]" : "group-hover/avatar:opacity-85"
                      }`}
                      alt="Group Avatar"
                    />
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fi fi-rr-spinner animate-spin text-purple text-xl"></i>
                      </div>
                    )}
                  </div>
                </div>
                {/* Camera Badge Bottom Right */}
                {!uploading && (
                  <div className="absolute bottom-0 right-0 w-6.5 h-6.5 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md transition-all active:scale-90">
                    <i className="fi fi-rr-camera text-[10px]"></i>
                  </div>
                )}
              </label>
            </div>
            <span className="text-[10px] font-bold text-dark-grey/60 uppercase tracking-widest mt-1">
              Ảnh đại diện nhóm
            </span>
          </div>

          {/* Tên nhóm */}
          <div className="flex flex-col gap-2">
            <label className="text-[10.5px] font-bold text-dark-grey/80 dark:text-white/60 uppercase tracking-widest pl-1">
              Tên nhóm
            </label>
            <div className="relative">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Tên nhóm mới..."
                className="w-full pl-9.5 pr-4 py-2.5 rounded-xl border border-grey/85 focus:border-purple/50 focus:ring-4 focus:ring-purple/5 text-[12px] bg-grey/10 focus:bg-white text-black font-medium transition-all"
              />
              <i className="fi fi-rr-users absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-dark-grey/50"></i>
            </div>
          </div>

          {/* Mô tả nhóm */}
          <div className="flex flex-col gap-2">
            <label className="text-[10.5px] font-bold text-dark-grey/80 dark:text-white/60 uppercase tracking-widest pl-1">
              Mô tả nhóm
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Nhập mô tả cho nhóm..."
              rows={3}
              maxLength={200}
              className="w-full px-3.5 py-2.5 rounded-xl border border-grey/85 focus:border-purple/50 focus:ring-4 focus:ring-purple/5 text-[12px] bg-grey/10 focus:bg-white text-black font-medium transition-all resize-none"
            />
            <span className="text-[9px] text-dark-grey/50 text-right">{groupDescription.length}/200</span>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-grey/60 dark:border-grey/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploading}
              className="px-4 py-2.5 rounded-xl text-[11px] font-bold text-dark-grey hover:bg-grey/85 dark:hover:bg-grey/15 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || uploading || !groupName.trim()}
              className="px-5 py-2.5 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-indigo-500/10 active:scale-95 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <i className="fi fi-rr-spinner animate-spin"></i>
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

