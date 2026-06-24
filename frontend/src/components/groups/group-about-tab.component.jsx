/* eslint-disable react/prop-types */
export const GroupAboutTab = ({ group }) => {
  return (
    <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] p-8 space-y-6 shadow-sm">
      <div className="space-y-3">
        <h3 className="text-lg font-black text-slate-900 dark:text-white font-jakarta">
          Mô tả chi tiết
        </h3>
        <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed whitespace-pre-line font-medium font-inter">
          {group.description || "Chưa có mô tả chi tiết."}
        </p>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
        <h3 className="text-lg font-black text-slate-900 dark:text-white font-jakarta flex items-center gap-2">
          <i className="fi fi-rr-list-check text-indigo-500 text-base"></i>
          Nội quy nhóm
        </h3>
        <div className="grid grid-cols-1 gap-4 font-inter">
          {group.rules && group.rules.length > 0
            ? group.rules.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl hover:border-slate-200 dark:hover:border-white/10 transition-all duration-300"
                >
                  <span className="text-xl font-black text-indigo-500 dark:text-indigo-400 tracking-tight shrink-0 font-jakarta">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                    {rule}
                  </span>
                </div>
              ))
            : [
                "Tôn trọng các thành viên khác, không công kích cá nhân.",
                "Chia sẻ tài liệu chất lượng, ghi rõ nguồn nếu sưu tầm.",
                "Không đăng bài quảng cáo, spam, hoặc tin nhắn rác.",
              ].map((rule, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl hover:border-slate-200 dark:hover:border-white/10 transition-all duration-300"
                >
                  <span className="text-xl font-black text-indigo-500 dark:text-indigo-400 tracking-tight shrink-0 font-jakarta">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                    {rule}
                  </span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};
