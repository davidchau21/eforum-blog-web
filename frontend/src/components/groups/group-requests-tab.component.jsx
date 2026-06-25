import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* eslint-disable react/prop-types */
export const GroupRequestsTab = ({
  pendingRequests = [],
  myRole,
  settings = {},
  handleRejectRequest,
  handleApproveRequest,
}) => {
  const isMod = myRole === "MODERATOR";
  const moderatorCanApprove = settings?.moderatorCanApprove !== false;
  const isRestrictedMod = isMod && !moderatorCanApprove;

  return (
    <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] p-6 shadow-sm min-h-[300px] font-inter">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white font-jakarta flex items-center gap-2">
            Yêu cầu gia nhập
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Duyệt hoặc từ chối người dùng muốn tham gia nhóm học tập
          </p>
        </div>
        <span className="text-[9px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest bg-amber-500/5 dark:bg-amber-500/[0.02] border border-amber-500/10 px-3 py-1 rounded-xl">
          Bảng kiểm duyệt
        </span>
      </div>

      {isRestrictedMod && (
        <div className="mb-6 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
          <i className="fi fi-rr-ban text-amber-500 text-sm shrink-0 mt-0.5"></i>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 font-jakarta">
              Quyền hạn bị hạn chế
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Trưởng nhóm hoặc Phó nhóm đã khóa tính năng phê duyệt thành viên đối với Kiểm duyệt viên.
            </p>
          </div>
        </div>
      )}

      {pendingRequests.length === 0 ? (
        <div className="py-16 text-center text-slate-400 dark:text-slate-500">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
            <i className="fi fi-rr-checkbox"></i>
          </div>
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 font-jakarta">
            Tất cả đã xử lý xong!
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
            Không có yêu cầu gia nhập nào đang chờ phê duyệt vào thời điểm này.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {pendingRequests.map((req) => {
              if (!req.user) return null;
              return (
                <motion.div
                  key={req.user._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] hover:border-slate-200 dark:hover:border-white/10 transition-all flex items-center justify-between gap-4 group"
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
