import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useGetConversations from "../../hook/useGetConversations";
import useConversation from "../../zustand/useConversation";

/* eslint-disable react/prop-types */
export const GroupMemberCard = ({
  member,
  myRole,
  userAuth,
  settings,
  handleKickMember,
  handleChangeRole,
  openConfirmModal,
  canManage,
  onMemberClick,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHoverCard, setShowHoverCard] = useState(false);
  const isSelf = member.user?.personal_info?.username === userAuth?.username;

  const navigate = useNavigate();
  const { conversations } = useGetConversations();
  const { setSelectedConversation } = useConversation();

  const handleStartChat = () => {
    if (!userAuth?.access_token) {
      return navigate("/signin");
    }
    const preloadedConv = (conversations || []).find(
      (c) => c._id === member.user?._id
    );
    setSelectedConversation(preloadedConv || member.user);
    navigate("/chat");
  };

  const getRoleDetails = (role) => {
    switch (role) {
      case "OWNER":
        return {
          label: "Trưởng nhóm",
          icon: "fi-sr-crown",
          badgeStyle:
            "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        };
      case "DEPUTY":
        return {
          label: "Phó nhóm",
          icon: "fi-sr-star",
          badgeStyle:
            "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
        };
      case "MODERATOR":
        return {
          label: "Kiểm duyệt",
          icon: "fi-sr-shield",
          badgeStyle:
            "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        };
      default:
        return {
          label: "Thành viên",
          icon: "fi-rr-user",
          badgeStyle:
            "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5",
        };
    }
  };

  const roleInfo = getRoleDetails(member.role);

  const getAvailableActions = () => {
    const actions = [];
    const targetId = member.user?._id;
    if (isSelf || !userAuth?.access_token) return actions;

    if (myRole === "OWNER") {
      actions.push({
        label: "Chuyển Trưởng nhóm",
        icon: "fi-rr-crown",
        onClick: () => {
          openConfirmModal({
            title: "CHUYỂN TRƯỞNG NHÓM",
            message: `Bạn có chắc chắn muốn chuyển quyền Trưởng nhóm cho ${member.user.personal_info.fullname}? Bạn sẽ được hạ xuống làm Phó nhóm.`,
            onConfirm: () => handleChangeRole(targetId, "OWNER"),
            type: "warning",
          });
        },
        className: "text-amber-600 dark:text-amber-400 hover:bg-amber-500/5",
      });

      if (member.role === "DEPUTY") {
        actions.push({
          label: "Gỡ Phó nhóm",
          icon: "fi-rr-user-delete",
          onClick: () => handleChangeRole(targetId, "MEMBER"),
          className:
            "text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/5",
        });
      } else {
        actions.push({
          label: "Bổ nhiệm Phó nhóm",
          icon: "fi-rr-user-add",
          onClick: () => handleChangeRole(targetId, "DEPUTY"),
          className:
            "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/5",
        });
      }

      if (member.role === "MODERATOR") {
        actions.push({
          label: "Gỡ Kiểm duyệt viên",
          icon: "fi-rr-shield",
          onClick: () => handleChangeRole(targetId, "MEMBER"),
          className:
            "text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/5",
        });
      } else if (member.role === "MEMBER") {
        actions.push({
          label: "Làm Kiểm duyệt viên",
          icon: "fi-rr-shield",
          onClick: () => handleChangeRole(targetId, "MODERATOR"),
          className:
            "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5",
        });
      }

      actions.push({
        label: "Xóa khỏi nhóm",
        icon: "fi-rr-trash",
        onClick: () => {
          openConfirmModal({
            title: "XÓA THÀNH VIÊN",
            message: `Bạn có chắc chắn muốn xóa thành viên ${member.user.personal_info.fullname} khỏi nhóm?`,
            onConfirm: () => handleKickMember(targetId),
            type: "danger",
          });
        },
        className: "text-rose-600 dark:text-rose-400 hover:bg-rose-500/5",
      });
    } else if (myRole === "DEPUTY") {
      if (member.role === "MODERATOR") {
        actions.push({
          label: "Gỡ Kiểm duyệt viên",
          icon: "fi-rr-shield",
          onClick: () => handleChangeRole(targetId, "MEMBER"),
          className:
            "text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/5",
        });
      } else if (member.role === "MEMBER") {
        actions.push({
          label: "Làm Kiểm duyệt viên",
          icon: "fi-rr-shield",
          onClick: () => handleChangeRole(targetId, "MODERATOR"),
          className:
            "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5",
        });
      }

      if (member.role === "MODERATOR" || member.role === "MEMBER") {
        actions.push({
          label: "Xóa khỏi nhóm",
          icon: "fi-rr-trash",
          onClick: () => {
            openConfirmModal({
              title: "XÓA THÀNH VIÊN",
              message: `Bạn có chắc chắn muốn xóa thành viên ${member.user.personal_info.fullname} khỏi nhóm?`,
              onConfirm: () => handleKickMember(targetId),
              type: "danger",
            });
          },
          className: "text-rose-600 dark:text-rose-400 hover:bg-rose-500/5",
        });
      }
    } else if (myRole === "MODERATOR" && settings?.moderatorCanKick) {
      if (member.role === "MEMBER") {
        actions.push({
          label: "Xóa khỏi nhóm",
          icon: "fi-rr-trash",
          onClick: () => {
            openConfirmModal({
              title: "XÓA THÀNH VIÊN",
              message: `Bạn có chắc chắn muốn xóa thành viên ${member.user.personal_info.fullname} khỏi nhóm?`,
              onConfirm: () => handleKickMember(targetId),
              type: "danger",
            });
          },
          className: "text-rose-600 dark:text-rose-400 hover:bg-rose-500/5",
        });
      }
    }

    return actions;
  };

  const actions = getAvailableActions();
  const showActionsButton = actions.length > 0;

  let memberAvatarRing = "border-slate-150 dark:border-zinc-800";
  if (member.role === "OWNER") {
    memberAvatarRing = "border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.2)]";
  } else if (member.role === "DEPUTY") {
    memberAvatarRing =
      "border-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.2)]";
  } else if (member.role === "MODERATOR") {
    memberAvatarRing =
      "border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.2)]";
  }

  const joinDate = member.createdAt
    ? new Date(member.createdAt).toLocaleDateString("vi-VN")
    : "Chưa rõ";

  return (
    <tr className={`border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors duration-200 ${showDropdown ? "relative z-30" : ""}`}>
      {/* 1. Member Profile */}
      <td
        className="px-6 py-4 relative"
        onMouseEnter={() => setShowHoverCard(true)}
        onMouseLeave={() => setShowHoverCard(false)}
      >
        <div
          onClick={(e) => {
            e.preventDefault();
            if (onMemberClick) onMemberClick(member);
          }}
          className="flex items-center gap-3 group/member cursor-pointer"
        >
          <div
            className={`w-9 h-9 rounded-lg border-[2px] ${memberAvatarRing} overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 transition-all duration-300 group-hover/member:scale-105`}
          >
            <img
              src={member.user?.personal_info?.profile_img}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-800 dark:text-slate-200 font-jakarta leading-none mb-1 truncate flex items-center gap-1.5 group-hover/member:text-indigo-600 dark:group-hover/member:text-indigo-400 transition-colors">
              {member.user?.personal_info?.fullname}
              {isSelf && (
                <span className="px-1 py-0.5 rounded text-[7px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-widest leading-none shrink-0">
                  Bạn
                </span>
              )}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none truncate">
              @{member.user?.personal_info?.username}
            </p>
          </div>
        </div>

        {/* Hover Card / Popover */}
        <AnimatePresence>
          {showHoverCard && member.user && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-6 bottom-full mb-3 z-50 w-72 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto font-inter text-left"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={member.user.personal_info.profile_img}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200/60 dark:border-white/5 bg-slate-100 dark:bg-zinc-800"
                  alt=""
                />
                <div className="min-w-0 flex-grow">
                  <h5 className="text-xs font-black text-slate-900 dark:text-white font-jakarta leading-snug truncate">
                    {member.user.personal_info.fullname}
                  </h5>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5 truncate">
                    @{member.user.personal_info.username}
                  </p>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider ${roleInfo.badgeStyle} leading-none mt-2`}
                  >
                    <i className={`fi ${roleInfo.icon} text-[7px]`}></i>
                    {roleInfo.label}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-3 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-100 dark:border-white/5 italic line-clamp-2">
                {member.user.personal_info.bio || "Không có giới thiệu tiểu sử."}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-white/5 text-center">
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white font-jakarta">
                    {member.user.account_info?.total_followers || 0}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Người theo dõi
                  </p>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white font-jakarta">
                    {member.user.account_info?.total_following || 0}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Đang theo dõi
                  </p>
                </div>
              </div>

              {/* Message button */}
              {!isSelf && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleStartChat();
                  }}
                  className="w-full mt-4 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/15 cursor-pointer"
                >
                  <i className="fi fi-rr-paper-plane text-[10px]"></i>
                  Nhắn tin ngay
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </td>

      {/* 2. Email */}
      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
        {member.user?.personal_info?.email || "Không công khai"}
      </td>

      {/* 3. Role Badge */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${roleInfo.badgeStyle} leading-none`}
        >
          <i className={`fi ${roleInfo.icon} text-[8px]`}></i>
          {roleInfo.label}
        </span>
      </td>

      {/* 4. Join Date */}
      <td className="px-6 py-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
        {joinDate}
      </td>

      {/* 5. Actions */}
      {canManage && (
        <td className="px-6 py-4 text-right">
          {showActionsButton ? (
            <div className="relative inline-block text-left">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all mx-auto mr-0"
              >
                <i className="fi fi-rr-menu-dots-vertical text-xs"></i>
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowDropdown(false)}
                  />

                  <div className="absolute right-0 mt-1 bg-white dark:bg-[#18181b] border border-slate-200/60 dark:border-white/10 rounded-xl shadow-xl py-2 w-48 z-40 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                    {actions.map((act, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setShowDropdown(false);
                          act.onClick();
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center gap-2 font-jakarta font-bold text-xs transition-all ${act.className}`}
                      >
                        <i className={`fi ${act.icon} text-xs`}></i>
                        {act.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-zinc-600">-</span>
          )}
        </td>
      )}
    </tr>
  );
};
