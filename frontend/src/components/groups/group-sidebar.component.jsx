export const GroupSidebar = ({
  group,
  blogs = [],
  documents = [],
  managementTeam = [],
  isJoined = false,
  isAdminOrMod = false,
  onInviteClick,
  handleToggleMute,
  onMemberClick,
}) => {
  return (
    <div className="lg:col-span-3 space-y-6">
      <div className="sticky top-24 space-y-6">
        {/* Widget 1: Bento Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Stat 1: Members */}
          <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-2xl p-3 text-center flex flex-col justify-center items-center shadow-sm hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all">
            <i className="fi fi-rr-users text-indigo-500 text-sm mb-1"></i>
            <span className="text-sm font-black font-jakarta text-slate-800 dark:text-white leading-tight">
              {group.totalMembers}
            </span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
              Thành viên
            </span>
          </div>
          {/* Stat 2: Posts */}
          <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-2xl p-3 text-center flex flex-col justify-center items-center shadow-sm hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all">
            <i className="fi fi-rr-comments text-emerald-500 text-sm mb-1"></i>
            <span className="text-sm font-black font-jakarta text-slate-800 dark:text-white leading-tight">
              {blogs.length}
            </span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
              Bài viết
            </span>
          </div>
          {/* Stat 3: Files */}
          <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-2xl p-3 text-center flex flex-col justify-center items-center shadow-sm hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-all">
            <i className="fi fi-rr-document text-rose-500 text-sm mb-1"></i>
            <span className="text-sm font-black font-jakarta text-slate-800 dark:text-white leading-tight">
              {documents.length}
            </span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
              Tài liệu
            </span>
          </div>
        </div>

        {/* Widget 2: About Community Card */}
        <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5">
              <i className="fi fi-rr-info text-[11px]"></i>
              Giới thiệu
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
              {group.description ||
                "Chưa có mô tả chi tiết cho cộng đồng học tập này."}
            </p>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-slate-500">
                Thành lập:
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-350">
                {new Date(group.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-slate-500">
                Sáng lập:
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-350">
                @{group.creator?.personal_info?.username || "Không rõ"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-slate-500">
                Hiển thị:
              </span>
              <span
                className={`font-black uppercase text-[8px] px-1.5 py-0.5 rounded ${
                  group.isPrivate
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                }`}
              >
                {group.isPrivate ? "Riêng tư" : "Công khai"}
              </span>
            </div>
          </div>

          {isJoined ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-center space-y-0.5 relative">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute top-2 right-2 animate-ping" />
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black font-jakarta uppercase tracking-wider">
                  Thành viên chính thức
                </p>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Bạn đã gia nhập cộng đồng này
                </p>
              </div>
              {isAdminOrMod && (
                <a
                  href={`/group/${group._id}/admin`}
                  className="w-full py-2.5 bg-slate-950 dark:bg-black hover:bg-slate-850 dark:hover:bg-black/90 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 font-jakarta hover:scale-[1.02] active:scale-98"
                >
                  <i className="fi fi-rr-settings-sliders text-xs"></i>
                  Quản lý nhóm
                </a>
              )}
              <button
                type="button"
                onClick={onInviteClick}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 font-jakarta"
              >
                <i className="fi fi-rr-user-add text-xs"></i>
                Mời thành viên
              </button>
              <button
                type="button"
                onClick={handleToggleMute}
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 font-jakarta ${
                  group?.myMembership?.muteNotifications
                    ? "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <i
                  className={`fi ${group?.myMembership?.muteNotifications ? "fi-rr-bell-ring" : "fi-rr-bell-slash"} text-xs`}
                ></i>
                {group?.myMembership?.muteNotifications
                  ? "Bật thông báo"
                  : "Tắt thông báo"}
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200/50 dark:border-white/5 text-center text-slate-400 text-[9px] leading-relaxed">
              Gia nhập nhóm để tương tác và xem tài liệu đầy đủ
            </div>
          )}
        </div>

        {/* Widget 3: Active Management Widget */}
        {managementTeam.length > 0 && (
          <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 space-y-3.5 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5">
              <i className="fi fi-sr-crown text-[11px]"></i>
              Ban quản trị ({managementTeam.length})
            </h4>
            <div className="space-y-2.5">
              {managementTeam.slice(0, 5).map((member) => {
                const username = member.user?.personal_info?.username;
                const fullname = member.user?.personal_info?.fullname;
                const img = member.user?.personal_info?.profile_img;
                const role = member.role;

                let ringColor = "border-slate-200 dark:border-zinc-800";
                let roleLabel = "Thành viên";
                let roleColor = "text-slate-400";
                if (role === "OWNER") {
                  ringColor =
                    "border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.25)]";
                  roleLabel = "Trưởng nhóm";
                  roleColor = "text-amber-500";
                } else if (role === "DEPUTY") {
                  ringColor =
                    "border-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.25)]";
                  roleLabel = "Phó nhóm";
                  roleColor = "text-indigo-550 dark:text-indigo-400";
                } else if (role === "MODERATOR") {
                  ringColor =
                    "border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.25)]";
                  roleLabel = "Kiểm duyệt";
                  roleColor = "text-emerald-500";
                }

                return (
                  <div
                    key={member.user?._id || username}
                    onClick={() => onMemberClick && onMemberClick(member)}
                    className="flex items-center gap-3 cursor-pointer group/sidebar-member hover:opacity-80 transition-all"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg border-2 ${ringColor} overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0`}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-jakarta leading-none mb-1 font-inter">
                        {fullname}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate leading-none">
                        @{username}
                      </p>
                    </div>
                    <span
                      className={`text-[8px] font-black uppercase tracking-wider shrink-0 ${roleColor}`}
                    >
                      {roleLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Widget 4: Condensed Rules checklist widget */}
        <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 space-y-3.5 shadow-sm">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5">
            <i className="fi fi-rr-list-check text-[11px]"></i>
            Quy định chung
          </h4>
          <div className="space-y-3">
            {(group.rules && group.rules.length > 0
              ? group.rules
              : [
                  "Tôn trọng thành viên & không công kích cá nhân.",
                  "Đăng tải tài liệu học tập chính xác, ghi nguồn.",
                  "Không spam, quảng cáo hoặc chia sẻ nội dung rác.",
                ]
            ).map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                  <i className="fi fi-rr-check"></i>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-medium font-inter">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
