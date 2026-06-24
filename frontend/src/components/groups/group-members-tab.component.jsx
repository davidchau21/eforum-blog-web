import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GroupMemberCard } from "./group-member-card.component";
import { GroupPrivateLock } from "./group-private-lock.component";
import { GroupConfirmModal } from "./group-confirm-modal.component";

/* eslint-disable react/prop-types */
export const GroupMembersTab = ({
  group,
  showLockScreen,
  handleToggleJoin,
  isAdminOrMod,
  pendingRequests = [],
  myRole,
  settings = {},
  handleRejectRequest,
  handleApproveRequest,
  memberSearch,
  setMemberSearch,
  memberFilter,
  setMemberFilter,
  adminMembers = [],
  regularMembers = [],
  filteredMembers = [],
  userAuth,
  handleKickMember,
  handleChangeRole,
}) => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
  });

  const canManage =
    myRole === "OWNER" ||
    myRole === "DEPUTY" ||
    (myRole === "MODERATOR" && settings?.moderatorCanKick);

  const isMod = myRole === "MODERATOR";
  const moderatorCanApprove = settings?.moderatorCanApprove !== false;
  const isRestrictedMod = isMod && !moderatorCanApprove;

  const filteredRequests = (pendingRequests || []).filter((req) => {
    if (!req.user) return false;
    return (
      (req.user.personal_info?.fullname || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
      (req.user.personal_info?.username || "").toLowerCase().includes(memberSearch.toLowerCase())
    );
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

  if (showLockScreen) {
    return (
      <GroupPrivateLock
        group={group}
        handleToggleJoin={handleToggleJoin}
      />
    );
  }

  return (
    <div className="space-y-8">

      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 p-4 rounded-[24px] shadow-sm font-inter">
        <div className="relative flex-grow max-w-md">
          <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="Tìm kiếm thành viên theo tên hoặc username..."
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl outline-none text-xs font-medium focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-slate-700 dark:text-slate-200"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl shrink-0 self-start md:self-auto flex-wrap">
          {[
            { value: "all", label: "Tất cả" },
            { value: "admin", label: "Ban quản trị" },
            { value: "member", label: "Thành viên" },
            ...(isAdminOrMod
              ? [
                  {
                    value: "pending",
                    label: `Chờ duyệt${pendingRequests.length > 0 ? ` (${pendingRequests.length > 9 ? "9+" : pendingRequests.length})` : ""}`,
                  },
                ]
              : []),
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMemberFilter(opt.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                memberFilter === opt.value
                  ? "bg-white dark:bg-[#1e1e22] text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members Grid Container */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {/* 1. Ban Quản Trị */}
          {memberFilter !== "pending" && adminMembers.length > 0 && (
            <motion.div
              key="admin-section"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2 font-inter">
                <span>Ban quản trị</span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                <span className="normal-case font-medium text-slate-400">
                  ({adminMembers.length})
                </span>
              </h4>
              <div className="w-full overflow-x-auto lg:overflow-visible bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[24px] shadow-sm min-h-[180px] pb-12">
                <table className="w-full min-w-[700px] border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-150 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-405 dark:text-slate-550 font-jakarta">
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
                      {canManage && (
                        <th scope="col" className="px-6 py-3.5 text-right pr-8">
                          Thao tác
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium font-inter">
                    {adminMembers.map((m) => (
                      <GroupMemberCard
                        key={m.user._id}
                        member={m}
                        myRole={myRole}
                        userAuth={userAuth}
                        settings={settings}
                        handleKickMember={handleKickMember}
                        handleChangeRole={handleChangeRole}
                        openConfirmModal={openConfirmModal}
                        canManage={canManage}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* 2. Thành viên thường */}
          {memberFilter !== "pending" && regularMembers.length > 0 && (
            <motion.div
              key="member-section"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2 font-inter">
                <span>Thành viên</span>
                <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full"></span>
                <span className="normal-case font-medium text-slate-400">
                  ({regularMembers.length})
                </span>
              </h4>
              <div className="w-full overflow-x-auto lg:overflow-visible bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[24px] shadow-sm min-h-[180px] pb-12">
                <table className="w-full min-w-[700px] border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-150 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-405 dark:text-slate-550 font-jakarta">
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
                      {canManage && (
                        <th scope="col" className="px-6 py-3.5 text-right pr-8">
                          Thao tác
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium font-inter">
                    {regularMembers.map((m) => (
                      <GroupMemberCard
                        key={m.user._id}
                        member={m}
                        myRole={myRole}
                        userAuth={userAuth}
                        settings={settings}
                        handleKickMember={handleKickMember}
                        handleChangeRole={handleChangeRole}
                        openConfirmModal={openConfirmModal}
                        canManage={canManage}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {memberFilter !== "pending" && filteredMembers.length === 0 && (
            <motion.div
              key="empty-members"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-3xl font-inter"
            >
              <i className="fi fi-rr-users text-3xl mb-2 block text-slate-300 dark:text-zinc-700"></i>
              <p className="text-xs font-medium">
                Không tìm thấy thành viên nào phù hợp với bộ lọc.
              </p>
            </motion.div>
          )}

          {/* 3. Yêu cầu chờ duyệt */}
          {memberFilter === "pending" && (
            <motion.div
              key="pending-requests"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2 font-inter">
                <span>Yêu cầu đang chờ duyệt</span>
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                <span className="normal-case font-medium text-slate-400">
                  ({filteredRequests.length})
                </span>
              </h4>

              {isRestrictedMod && (
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
                  <i className="fi fi-rr-ban text-amber-500 text-sm shrink-0 mt-0.5"></i>
                  <div className="space-y-0.5 font-inter">
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 font-jakarta">
                      Quyền hạn bị hạn chế
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Trưởng nhóm hoặc Phó nhóm đã khóa tính năng phê duyệt thành viên đối với Kiểm duyệt viên.
                    </p>
                  </div>
                </div>
              )}

              {filteredRequests.length === 0 ? (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-3xl font-inter">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                    <i className="fi fi-rr-checkbox"></i>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 font-jakarta">
                    Tất cả đã xử lý xong!
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Không có yêu cầu gia nhập nào đang chờ phê duyệt.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRequests.map((req) => {
                    if (!req.user) return null;
                    return (
                      <div
                        key={req.user._id}
                        className="p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111113] hover:border-slate-350 dark:hover:border-white/10 shadow-sm transition-all flex items-center justify-between gap-4 group"
                      >
                        <Link
                          to={`/user/${req.user.personal_info?.username}`}
                          className="flex items-center gap-3 min-w-0"
                        >
                          <img
                            src={req.user.personal_info?.profile_img}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-200 dark:bg-zinc-800 border border-slate-200/50 dark:border-white/5 shrink-0 transition-transform group-hover:scale-105"
                            alt=""
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-800 dark:text-slate-200 font-jakarta leading-none mb-1 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {req.user.personal_info?.fullname}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-550 leading-none truncate">
                              @{req.user.personal_info?.username}
                            </p>
                          </div>
                        </Link>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleRejectRequest(req.user._id)}
                            disabled={isRestrictedMod}
                            className="h-8 px-3.5 bg-slate-200/80 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-xl transition-all font-jakarta uppercase tracking-wider"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleApproveRequest(req.user._id)}
                            disabled={isRestrictedMod}
                            className="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-bold rounded-xl transition-all shadow-md shadow-indigo-500/10 font-jakarta uppercase tracking-wider"
                          >
                            Duyệt
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GroupConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
};
