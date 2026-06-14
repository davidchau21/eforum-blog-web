import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserContext } from "../App";
import { getTranslations } from "../../translations";

/* eslint-disable react/prop-types */
const DocumentDetailModal = ({
  isOpen,
  onClose,
  documentId,
  onDeleteSuccess,
  language,
}) => {
  const [doc, setDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userAuth } = useContext(UserContext);
  const { access_token, username } = userAuth;
  const translations = getTranslations(language || "vi");

  useEffect(() => {
    console.log("DocumentDetailModal useEffect. isOpen:", isOpen, "documentId:", documentId);
    if (!isOpen || !documentId) return;

    setIsLoading(true);
    const url = import.meta.env.VITE_SERVER_DOMAIN + `/documents/${documentId}`;
    console.log("Fetching document details from:", url);
    axios
      .get(url)
      .then(({ data }) => {
        console.log("Fetched document detail successfully:", data);
        setDoc(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch document details:", err);
        toast.error("Không thể tải thông tin chi tiết tài liệu.");
        onClose();
      });
  }, [isOpen, documentId]);

  if (!isOpen) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = async () => {
    if (!doc) return;

    try {
      // Trigger database download counter increment
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + `/documents/${doc._id}/download`,
      );

      // Locally increment download counter for instant UI update
      setDoc((prev) => ({ ...prev, downloads: prev.downloads + 1 }));

      // Force browser to download file
      const link = document.createElement("a");
      link.href = doc.file_url;
      link.target = "_blank";
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Đang chuẩn bị tải tài liệu về máy... 📥");
    } catch (err) {
      console.error("Error triggering download:", err);
      toast.error("Lỗi khi tải tài liệu.");
    }
  };

  const handleDelete = () => {
    if (!doc) return;

    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.",
      )
    ) {
      return;
    }

    const loadingToast = toast.loading("Đang xóa tài liệu...");
    axios
      .delete(import.meta.env.VITE_SERVER_DOMAIN + `/documents/${doc._id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(() => {
        toast.dismiss(loadingToast);
        toast.success("Xóa tài liệu thành công! 🗑️");
        onDeleteSuccess(doc._id);
        onClose();
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        toast.error(err.response?.data?.error || "Lỗi khi xóa tài liệu.");
      });
  };

  // Determine viewer url
  const getViewerUrl = () => {
    if (!doc) return "";
    const type = doc.file_type?.toLowerCase();

    // PDF can be opened natively in iframe
    if (type === "pdf") {
      return `${doc.file_url}#toolbar=0`;
    }

    // PPTX, PPT, DOC, DOCX will be rendered via Google Docs Viewer Embed
    return `https://docs.google.com/viewer?url=${encodeURIComponent(doc.file_url)}&embedded=true`;
  };

  const isAuthor =
    doc && username && doc.author?.personal_info?.username === username;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-zinc-900 w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl border border-grey/40 dark:border-zinc-800/80 overflow-hidden flex flex-col md:flex-row relative animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading overlay */}
        {isLoading ? (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/85 z-[101] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm text-dark-grey font-bold">
              Đang tải thông tin tài liệu...
            </p>
          </div>
        ) : (
          <>
            {/* Left Column: Embedded Viewer */}
            <div className="flex-1 bg-grey/40 dark:bg-zinc-950/40 p-4 md:p-6 flex items-center justify-center min-h-[300px] md:h-full">
              {doc.file_url ? (
                <iframe
                  src={getViewerUrl()}
                  className="w-full h-full border-none rounded-2xl bg-white shadow-inner min-h-[300px] md:min-h-0"
                  title={doc.title}
                />
              ) : (
                <div className="text-center text-dark-grey">
                  <i className="fi fi-rr-circle-exclamation text-3xl mb-2 block text-indigo-500"></i>
                  Không thể hiển thị tài liệu
                </div>
              )}
            </div>

            {/* Right Column: Metadata & Actions */}
            <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-grey/60 dark:border-zinc-800/60 p-6 flex flex-col justify-between h-auto md:h-full bg-white dark:bg-zinc-900 overflow-y-auto">
              {/* Metadata content */}
              <div>
                {/* Header details */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-full select-none">
                    {doc.file_type}
                  </span>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-grey hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-all duration-200"
                  >
                    <i className="fi fi-rr-cross-small text-xl mt-0.5"></i>
                  </button>
                </div>

                {/* Title */}
                <h2 className="text-xl font-black text-black dark:text-white leading-snug mb-3">
                  {doc.title}
                </h2>

                {/* Description */}
                {doc.description && (
                  <p className="text-xs text-dark-grey leading-relaxed mb-5 border-l-2 border-grey pl-3.5 py-1">
                    {doc.description}
                  </p>
                )}

                {/* Stats Table */}
                <div className="bg-grey/30 dark:bg-zinc-800/40 rounded-2xl p-4.5 space-y-3 mb-6 border border-grey/30">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-dark-grey font-bold">
                      Dung lượng:
                    </span>
                    <span className="text-black dark:text-white font-extrabold">
                      {formatFileSize(doc.file_size)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-dark-grey font-bold">Lượt xem:</span>
                    <span className="text-black dark:text-white font-extrabold flex items-center gap-1">
                      <i className="fi fi-rr-eye text-indigo-500"></i>
                      {doc.views}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-dark-grey font-bold">
                      Lượt tải về:
                    </span>
                    <span className="text-black dark:text-white font-extrabold flex items-center gap-1">
                      <i className="fi fi-rr-download text-emerald-500"></i>
                      {doc.downloads}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-dark-grey font-bold">Đăng lúc:</span>
                    <span className="text-black dark:text-white font-extrabold">
                      {new Date(doc.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Creator info */}
                <div className="border-t border-grey/50 dark:border-zinc-800/50 pt-5">
                  <p className="text-[10px] font-black text-dark-grey uppercase tracking-widest mb-3">
                    Người đăng tải
                  </p>
                  <div className="flex items-center gap-3 bg-grey/15 p-2 rounded-2xl border border-grey/20">
                    <img
                      src={doc.author?.personal_info?.profile_img}
                      alt={doc.author?.personal_info?.username}
                      className="w-9 h-9 rounded-full object-cover border border-grey"
                    />
                    <div className="min-w-0">
                      <p className="font-extrabold text-sm text-black dark:text-white truncate">
                        {doc.author?.personal_info?.fullname}
                      </p>
                      <p className="text-[10px] text-dark-grey truncate">
                        @{doc.author?.personal_info?.username}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col gap-3 pt-6 mt-6 border-t border-grey/50 dark:border-zinc-800/50">
                <button
                  onClick={handleDownload}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl text-sm font-extrabold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
                >
                  <i className="fi fi-rr-download-to-device text-base mt-0.5"></i>
                  Tải tài liệu về máy
                </button>

                {isAuthor && (
                  <button
                    onClick={handleDelete}
                    className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-3.5 rounded-2xl text-sm font-extrabold transition-all active:scale-95 flex items-center justify-center gap-2 border border-rose-500/20"
                  >
                    <i className="fi fi-rr-trash text-base mt-0.5"></i>
                    Xóa tài liệu
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentDetailModal;
