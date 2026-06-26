import { GroupPrivateLock } from "./group-private-lock.component";

/* eslint-disable react/prop-types */
export const GroupDocumentsTab = ({
  group,
  showLockScreen,
  handleToggleJoin,
  isJoined,
  settings = {},
  documents = [],
  setIsDocModalOpen,
  handleDownloadFile,
}) => {
  if (showLockScreen) {
    return (
      <GroupPrivateLock group={group} handleToggleJoin={handleToggleJoin} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload document widget */}
      {isJoined && (
        <div className="bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <p className="font-black text-slate-900 dark:text-white font-jakarta flex items-center gap-2 font-inter">
              Chia sẻ tài liệu học tập
              {settings.memberUploadApprovalRequired && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                  Cần duyệt file
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hỗ trợ các file định dạng PDF, PPT, PPTX, DOC, DOCX, MP4, WEBM tối đa 50MB.
            </p>
          </div>
          <button
            onClick={() => setIsDocModalOpen(true)}
            className="py-3 px-5 text-xs font-black uppercase tracking-wider font-jakarta bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/10 shrink-0 self-stretch sm:self-auto text-center"
          >
            Đăng tài liệu
          </button>
        </div>
      )}

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const isPdf = doc.file_type === "pdf";
            const isWord = ["doc", "docx"].includes(doc.file_type);
            const isPpt = ["ppt", "pptx"].includes(doc.file_type);
            const isVideo = ["mp4", "webm"].includes(doc.file_type);

            let colorClass =
              "bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400 border-slate-100 dark:border-white/5";
            let iconClass = "fi-rr-document";

            if (isPdf) {
              colorClass =
                "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-450 border-rose-100 dark:border-rose-500/20";
              iconClass = "fi-rr-file-pdf";
            } else if (isWord) {
              colorClass =
                "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-405 border-blue-100 dark:border-blue-500/20";
              iconClass = "fi-rr-file-word";
            } else if (isPpt) {
              colorClass =
                "bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20";
              iconClass = "fi-rr-file-powerpoint";
            } else if (isVideo) {
              colorClass =
                "bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400 border-violet-100 dark:border-violet-500/20";
              iconClass = "fi-rr-file-video";
            }

            return (
              <div
                key={doc._id}
                className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] p-6 flex flex-col justify-between h-[210px] shadow-sm hover:shadow-[0_20px_50px_rgba(99,102,241,0.06)] hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-300 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border text-lg shrink-0 ${colorClass}`}
                      >
                        <i className={`fi ${iconClass}`}></i>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black font-jakarta text-slate-900 dark:text-white leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider truncate flex items-center gap-1.5 font-inter">
                          <span>{doc.file_name}</span>
                          {doc.file_size && (
                            <>
                              <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full"></span>
                              <span>
                                {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-450 dark:text-slate-400 font-bold shrink-0 bg-slate-50 dark:bg-white/5 py-1 px-2.5 rounded-full border border-slate-100 dark:border-white/5 font-inter">
                      <span className="flex items-center gap-1">
                        <i className="fi fi-rr-eye"></i> {doc.views || 0}
                      </span>
                      <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <i className="fi fi-rr-download"></i>{" "}
                        {doc.downloads || 0}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium">
                    {doc.description || "Không có mô tả cho tài liệu này."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://api.dicebear.com/6.x/fun-emoji/svg?seed=${encodeURIComponent(
                        doc.author?.personal_info?.fullname || "anonymous",
                      )}`}
                      className="w-5 h-5 rounded-full object-cover bg-slate-100"
                      alt=""
                    />
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      {doc.author?.personal_info?.fullname || "Chưa rõ"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(doc)}
                    className="text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-1 hover:underline active:scale-95 transition-all"
                  >
                    <i className="fi fi-rr-download text-sm"></i> Tải về
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-3xl">
          <i className="fi fi-rr-document text-3xl mb-2 text-slate-350 dark:text-zinc-750 block"></i>
          Chưa có tài liệu chia sẻ nào trong nhóm này.
        </div>
      )}
    </div>
  );
};
