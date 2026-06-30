import { motion } from "framer-motion";
import { useContext } from "react";
import { UserContext } from "../../App";
import { toast } from "react-hot-toast";
import groupBannerDefault from "../../imgs/group-banner-default.png";

/* eslint-disable react/prop-types */
export const GroupCard = ({ group, navigate }) => {
  const { userAuth } = useContext(UserContext);
  const myRole = group.myMembership?.role;
  const isOwner = myRole === "OWNER";
  const isDeputy = myRole === "DEPUTY";
  const isMod = myRole === "MODERATOR";
  const initialsUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(group.name || "Group")}&backgroundColor=b3c5fc`;

  let glowRing = "border-white dark:border-[#111113]";
  let roleLabel = "";
  let roleClass = "";

  if (group.myMembership?.status === "JOINED") {
    if (isOwner) {
      glowRing = "border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]";
      roleLabel = "Trưởng nhóm";
      roleClass = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    } else if (isDeputy) {
      glowRing = "border-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.4)]";
      roleLabel = "Phó nhóm";
      roleClass =
        "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    } else if (isMod) {
      glowRing = "border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]";
      roleLabel = "Kiểm duyệt";
      roleClass =
        "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    } else {
      glowRing =
        "border-slate-300 dark:border-zinc-700 shadow-[0_0_10px_rgba(148,163,184,0.2)]";
      roleLabel = "Thành viên";
      roleClass =
        "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={() => navigate(`/group/${group._id}`)}
      className="cursor-pointer bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_20px_50px_rgba(99,102,241,0.08)] dark:hover:border-indigo-500/30 hover:border-slate-300/80 transition-all duration-500 flex flex-col h-full group"
    >
      {/* Banner */}
      <div className="h-36 w-full overflow-hidden relative bg-slate-100 dark:bg-zinc-800">
        <img
          src={group.banner || groupBannerDefault}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = groupBannerDefault;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          alt={group.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90" />

        {/* Top tags */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <span
            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-md ${
              group.isPrivate
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
            }`}
          >
            <i
              className={`fi ${group.isPrivate ? "fi-rr-lock" : "fi-rr-globe"} text-[10px]`}
            ></i>
            {group.isPrivate ? "Riêng tư" : "Công khai"}
          </span>

          {roleLabel && (
            <span
              className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${roleClass}`}
            >
              {roleLabel}
            </span>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className="p-6 flex flex-col flex-grow relative font-inter">
        {/* Avatar overlapping banner (Sleek offset styling with glow indicator ring) */}
        <div
          className={`w-16 h-16 rounded-2xl border-[3px] ${glowRing} overflow-hidden -mt-14 mb-4 shadow-lg bg-slate-200 transition-all duration-300 shrink-0 z-10`}
        >
          <img
            src={group.avatar || initialsUrl}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = initialsUrl;
            }}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>

        <div className="space-y-3 flex-grow">
          <h3 className="text-lg font-black text-slate-900 dark:text-black leading-snug font-jakarta line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {group.name}
          </h3>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">
            <span>Người tạo:</span>
            <span className="text-slate-600 dark:text-slate-350">
              @{group.creator?.personal_info?.username || "Không rõ"}
            </span>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3 font-medium">
            {group.description || "Chưa có mô tả cho nhóm học tập này."}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <i className="fi fi-rr-users text-xs"></i>
            <span className="text-[11px] font-bold">
              {group.totalMembers} thành viên
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (group.myMembership?.status !== "JOINED" && !userAuth?.access_token) {
                toast.error(
                  userAuth?.language === "vi"
                    ? "Vui lòng đăng nhập để tham gia nhóm."
                    : "Please log in to join the group."
                );
                return navigate("/signin");
              }
              navigate(`/group/${group._id}`);
            }}
            className={`text-[11px] font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
              group.myMembership?.status === "JOINED"
                ? "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
                : group.myMembership?.status === "PENDING"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20"
            }`}
            disabled={group.myMembership?.status === "PENDING"}
          >
            {group.myMembership?.status === "JOINED"
              ? "Xem nhóm"
              : group.myMembership?.status === "PENDING"
                ? "Chờ duyệt"
                : "Tham gia"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
