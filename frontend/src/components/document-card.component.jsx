import axios from "axios";
import { toast } from "react-hot-toast";
import { getTranslations } from "../../translations";

/* eslint-disable react/prop-types */
const DocumentCard = ({ doc, onClick, language }) => {
  const {
    title,
    description,
    file_type,
    file_size,
    author,
    views,
    downloads,
    createdAt,
  } = doc;
  const translations = getTranslations(language || "vi");

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIconAndColor = (type) => {
    switch (type?.toLowerCase()) {
      case "pdf":
        return {
          icon: "fi fi-rr-file-pdf",
          bgColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
          iconColor: "text-rose-500",
        };
      case "ppt":
      case "pptx":
        return {
          icon: "fi fi-rr-file-powerpoint",
          bgColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          iconColor: "text-amber-500",
        };
      case "doc":
      case "docx":
        return {
          icon: "fi fi-rr-file-word",
          bgColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          iconColor: "text-blue-500",
        };
      default:
        return {
          icon: "fi fi-rr-file",
          bgColor: "bg-slate-500/10 text-slate-600 border-slate-500/20",
          iconColor: "text-slate-500",
        };
    }
  };

  const handleQuickDownload = async (e) => {
    e.stopPropagation(); // Stop click from opening details modal
    try {
      // Trigger database download counter increment
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + `/documents/${doc._id}/download`,
      );

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
      console.error("Error triggering quick download:", err);
      toast.error("Lỗi khi tải tài liệu.");
    }
  };

  const fileStyles = getFileIconAndColor(file_type);

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 border border-grey/80 dark:border-zinc-800/80 rounded-2xl p-4 hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:translate-x-1"
    >
      {/* Left side: Icon + Title/Description */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${fileStyles.bgColor} flex-shrink-0 transition-transform group-hover:scale-105 duration-200`}
        >
          <i className={`${fileStyles.icon} text-2xl mt-1`}></i>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-black dark:text-white text-base leading-snug truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-dark-grey mt-1 truncate max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Middle/Right side: Author & Info */}
      <div className="flex items-center gap-6 flex-shrink-0 flex-wrap md:flex-nowrap justify-between md:justify-end">
        {/* Author info */}
        <div className="flex items-center gap-2.5 min-w-0 w-36">
          <img
            src={author?.personal_info?.profile_img}
            alt={author?.personal_info?.username}
            className="w-7 h-7 rounded-full object-cover border border-grey"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-black text-black dark:text-white truncate">
              {author?.personal_info?.fullname}
            </p>
            <p className="text-[9px] text-dark-grey truncate">
              @{author?.personal_info?.username}
            </p>
          </div>
        </div>

        {/* Size Badge */}
        <span className="text-[10px] font-bold text-dark-grey uppercase tracking-wider bg-grey dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-grey/50">
          {formatFileSize(file_size)}
        </span>

        {/* Upload Date */}
        <span className="text-[11px] text-dark-grey font-medium hidden lg:inline-block w-24">
          {new Date(createdAt).toLocaleDateString("vi-VN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[11px] font-bold text-dark-grey w-20 justify-end">
          <div className="flex items-center gap-1.5" title="Lượt xem">
            <i className="fi fi-rr-eye text-sm mt-0.5"></i>
            <span>{views}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Lượt tải">
            <i className="fi fi-rr-download text-sm mt-0.5"></i>
            <span>{downloads}</span>
          </div>
        </div>

        {/* Quick Download Button */}
        <button
          onClick={handleQuickDownload}
          className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all duration-250 border border-emerald-500/20 active:scale-90"
          title="Tải nhanh tài liệu"
        >
          <i className="fi fi-rr-download text-sm mt-0.5"></i>
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
