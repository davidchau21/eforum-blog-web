/* eslint-disable react/prop-types */
export const GroupPrivateLock = ({ group, handleToggleJoin }) => {
  const isPending = group?.myMembership?.status === "PENDING";

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] shadow-sm relative overflow-hidden transition-all duration-500">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Lock Icon container */}
      <div className="relative w-20 h-20 rounded-[24px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-500 shadow-lg shadow-amber-500/5 animate-pulse">
        <i className="fi fi-rr-lock text-3xl"></i>
      </div>

      <h3 className="text-xl font-black font-jakarta text-slate-900 dark:text-white mb-2">
        Đây là nhóm riêng tư
      </h3>

      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        Nội dung thảo luận, tài liệu và danh sách thành viên của nhóm này đã
        được ẩn. Hãy gửi yêu cầu tham gia nhóm để xem các nội dung học tập bên
        trong.
      </p>

      <button
        onClick={handleToggleJoin}
        disabled={isPending}
        className={`py-3.5 px-8 rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg ${
          isPending
            ? "bg-amber-500/20 border border-amber-500/30 text-amber-300 cursor-not-allowed shadow-amber-500/5"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
        }`}
      >
        {isPending ? (
          <>
            <i className="fi fi-rr-clock text-sm"></i>
            <span>Đang chờ phê duyệt</span>
          </>
        ) : (
          <>
            <i className="fi fi-rr-user-add text-sm"></i>
            <span>Gửi yêu cầu tham gia</span>
          </>
        )}
      </button>
    </div>
  );
};
