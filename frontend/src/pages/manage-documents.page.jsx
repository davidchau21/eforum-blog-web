import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import Pagination from "../components/pagination.component";
import DocumentDetailModal from "../components/document-detail-modal.component";
import UploadDocumentModal from "../components/upload-document-modal.component";

const TEXTS = {
  vi: {
    title: "Tài liệu của tôi",
    searchPlaceholder: "Tìm kiếm tài liệu cá nhân...",
    confirmDelete: "Xóa tài liệu này?",
    confirmDeleteMsg: "Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.",
    deleteSuccess: "Xóa tài liệu thành công! 🗑️",
    deleteFailed: "Xóa tài liệu thất bại.",
    noDocs: "Bạn chưa tải lên tài liệu nào.",
    downloadPreparing: "Đang chuẩn bị tải tài liệu về máy... 📥",
    downloads: "Lượt tải",
    views: "Lượt xem",
    latest: "Mới nhất",
    mostDownloaded: "Tải nhiều",
    mostViewed: "Xem nhiều",
    cancel: "Hủy",
    delete: "Xóa",
    totalUploaded: "Tổng số đã đăng:",
  },
  en: {
    title: "My Documents",
    searchPlaceholder: "Search your documents...",
    confirmDelete: "Delete this document?",
    confirmDeleteMsg: "Are you sure you want to delete this document? This action cannot be undone.",
    deleteSuccess: "Document deleted successfully! 🗑️",
    deleteFailed: "Failed to delete document.",
    noDocs: "You haven't uploaded any documents yet.",
    downloadPreparing: "Preparing document download... 📥",
    downloads: "Downloads",
    views: "Views",
    latest: "Latest",
    mostDownloaded: "Most Downloaded",
    mostViewed: "Most Viewed",
    cancel: "Cancel",
    delete: "Delete",
    totalUploaded: "Total uploads:",
  }
};

const ManageDocumentCard = ({ doc, onClick, onDelete, onDownload, t }) => {
  const { title, description, file_type, file_size, views, downloads, createdAt } = doc;

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
        };
      case "ppt":
      case "pptx":
        return {
          icon: "fi fi-rr-file-powerpoint",
          bgColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        };
      case "doc":
      case "docx":
        return {
          icon: "fi fi-rr-file-word",
          bgColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        };
      default:
        return {
          icon: "fi fi-rr-file",
          bgColor: "bg-slate-500/10 text-slate-600 border-slate-500/20",
        };
    }
  };

  const fileStyles = getFileIconAndColor(file_type);

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 border border-grey/80 dark:border-zinc-800/80 rounded-2xl p-4 hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:translate-x-1"
    >
      {/* Left side: Icon + Title & description */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${fileStyles.bgColor} flex-shrink-0 transition-transform group-hover:scale-105 duration-200`}>
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

      {/* Right side: stats & action buttons */}
      <div className="flex items-center gap-6 flex-shrink-0 flex-wrap md:flex-nowrap justify-between md:justify-end">
        {/* Size Badge */}
        <span className="text-[10px] font-bold text-dark-grey uppercase tracking-wider bg-grey dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-grey/50">
          {formatFileSize(file_size)}
        </span>

        {/* Upload Date */}
        <span className="text-[11px] text-dark-grey font-medium hidden lg:inline-block w-24">
          {new Date(createdAt).toLocaleDateString("vi-VN", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })}
        </span>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[11px] font-bold text-dark-grey w-20 justify-end">
          <div className="flex items-center gap-1.5" title={t.views}>
            <i className="fi fi-rr-eye text-sm mt-0.5"></i>
            <span>{views}</span>
          </div>
          <div className="flex items-center gap-1.5" title={t.downloads}>
            <i className="fi fi-rr-download text-sm mt-0.5"></i>
            <span>{downloads}</span>
          </div>
        </div>

        {/* Quick Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Download */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(doc);
            }}
            className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all duration-200 border border-emerald-500/20 active:scale-95 cursor-pointer"
            title="Tải nhanh"
          >
            <i className="fi fi-rr-download text-sm mt-0.5"></i>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(doc);
            }}
            className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all duration-200 border border-rose-500/20 active:scale-95 cursor-pointer"
            title="Xóa tài liệu"
          >
            <i className="fi fi-rr-trash text-sm mt-0.5"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageDocuments = () => {
  const { userAuth } = useContext(UserContext);
  const { access_token, language } = userAuth;

  const t = TEXTS[language] || TEXTS.vi;

  const [documents, setDocuments] = useState({ results: [], totalDocs: 0 });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Deletion Confirm Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  // Detail Modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchUserDocuments = useCallback((currentPage) => {
    if (!access_token) return;
    setIsLoading(true);

    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/documents/user-documents", {
        params: {
          search: search,
          sort: sort,
          page: currentPage,
          limit: 5,
        },
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(({ data }) => {
        const { list, totalDocs } = data;
        setDocuments({
          results: list || [],
          totalDocs: totalDocs || 0,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user documents:", err);
        toast.error("Không thể tải danh sách tài liệu cá nhân.");
        setIsLoading(false);
      });
  }, [access_token, search, sort]);

  useEffect(() => {
    fetchUserDocuments(page);
  }, [page, search, sort, fetchUserDocuments]);

  useEffect(() => {
    setPage(1);
  }, [search, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  const handleCardClick = (docId) => {
    setSelectedDocId(docId);
    setIsDetailOpen(true);
  };

  const handleUploadSuccess = () => {
    setPage(1);
    fetchUserDocuments(1);
  };

  const handleQuickDownload = async (doc) => {
    try {
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + `/documents/${doc._id}/download`
      );

      // Instantly update stats locally
      setDocuments((prev) => ({
        ...prev,
        results: prev.results.map((item) =>
          item._id === doc._id ? { ...item, downloads: item.downloads + 1 } : item
        ),
      }));

      const link = document.createElement("a");
      link.href = doc.file_url;
      link.target = "_blank";
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(t.downloadPreparing);
    } catch (err) {
      console.error("Error triggering quick download:", err);
      toast.error("Lỗi khi tải tài liệu.");
    }
  };

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setShowConfirmModal(true);
  };

  const confirmDeleteHandler = () => {
    if (!docToDelete || !access_token) return;

    const loadingToast = toast.loading("Đang xóa tài liệu...");
    axios
      .delete(import.meta.env.VITE_SERVER_DOMAIN + `/documents/${docToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(() => {
        toast.dismiss(loadingToast);
        toast.success(t.deleteSuccess);
        
        // Remove from list and update count
        setDocuments((prev) => {
          const updatedResults = prev.results.filter((item) => item._id !== docToDelete._id);
          const newTotal = Math.max(0, prev.totalDocs - 1);
          
          // If we delete the last item of a page, go to previous page if page > 1
          if (updatedResults.length === 0 && page > 1) {
            setPage(page - 1);
          }

          return {
            results: updatedResults,
            totalDocs: newTotal,
          };
        });

        setShowConfirmModal(false);
        setDocToDelete(null);
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        console.error("Error deleting document:", err);
        toast.error(t.deleteFailed);
        setShowConfirmModal(false);
      });
  };

  const handleModalDeleteSuccess = (deletedId) => {
    setDocuments((prev) => {
      const updatedResults = prev.results.filter((item) => item._id !== deletedId);
      const newTotal = Math.max(0, prev.totalDocs - 1);
      
      if (updatedResults.length === 0 && page > 1) {
        setPage(page - 1);
      }

      return {
        results: updatedResults,
        totalDocs: newTotal,
      };
    });
    setIsDetailOpen(false);
  };

  return (
    <AnimationWrapper>
      <div className="w-full">
        {/* Header Title & Count */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-grey pb-5">
          <div>
            <h1 className="text-2xl font-black text-black dark:text-white">
              {t.title}
            </h1>
            <p className="text-sm text-dark-grey mt-1">
              {t.totalUploaded} <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{documents.totalDocs}</span>
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-black dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer select-none active:scale-95 self-start md:self-center shrink-0"
          >
            <i className="fi fi-rr-cloud-upload text-sm mt-0.5"></i>
            {language === "vi" ? "Đăng tài liệu" : "Upload Document"}
          </button>
        </div>

        {/* Toolbar: Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 bg-white dark:bg-zinc-900 border border-grey/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md flex items-center">
            <i className="fi fi-rr-search absolute left-4 text-dark-grey text-base mt-0.5"></i>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-grey/30 dark:bg-zinc-800/50 pt-2.5 pb-2.5 pl-11 pr-10 rounded-xl focus:outline-none focus:bg-grey/50 dark:focus:bg-zinc-800/80 focus:ring-1 focus:ring-indigo-500/20 text-sm text-black dark:text-white transition-all font-bold placeholder:text-dark-grey"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 text-dark-grey hover:text-black dark:hover:text-white cursor-pointer"
              >
                <i className="fi fi-rr-cross-small text-lg"></i>
              </button>
            )}
          </form>

          {/* Sort Filters */}
          <div className="flex items-center gap-2 overflow-x-auto self-start sm:self-center scrollbar-hide py-1">
            <button
              onClick={() => setSort("latest")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                sort === "latest"
                  ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-sm"
                  : "bg-grey/40 dark:bg-zinc-800 border-grey/50 dark:border-zinc-800/50 text-dark-grey hover:bg-grey/60 hover:text-black"
              }`}
            >
              {t.latest}
            </button>
            <button
              onClick={() => setSort("downloads")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                sort === "downloads"
                  ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-sm"
                  : "bg-grey/40 dark:bg-zinc-800 border-grey/50 dark:border-zinc-800/50 text-dark-grey hover:bg-grey/60 hover:text-black"
              }`}
            >
              {t.mostDownloaded}
            </button>
            <button
              onClick={() => setSort("views")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                sort === "views"
                  ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-sm"
                  : "bg-grey/40 dark:bg-zinc-800 border-grey/50 dark:border-zinc-800/50 text-dark-grey hover:bg-grey/60 hover:text-black"
              }`}
            >
              {t.mostViewed}
            </button>
          </div>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader />
          </div>
        ) : documents.results.length === 0 ? (
          <NoDataMessage message={t.noDocs} />
        ) : (
          <div className="flex flex-col gap-4">
            {documents.results.map((doc, i) => (
              <AnimationWrapper key={doc._id} transition={{ delay: i * 0.04 }}>
                <ManageDocumentCard
                  doc={doc}
                  onClick={() => handleCardClick(doc._id)}
                  onDelete={handleDeleteClick}
                  onDownload={handleQuickDownload}
                  t={t}
                />
              </AnimationWrapper>
            ))}

            {/* Numbered Pagination */}
            <Pagination
              currentPage={page}
              totalDocs={documents.totalDocs}
              limit={5}
              onChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && docToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-grey dark:border-zinc-800/80 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 mx-auto">
              <i className="fi fi-rr-trash text-rose-500 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white text-center mb-2">
              {t.confirmDelete}
            </h3>
            <p className="text-sm text-dark-grey text-center leading-relaxed mb-8">
              {t.confirmDeleteMsg}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setDocToDelete(null);
                }}
                className="flex-1 py-3 px-6 bg-grey dark:bg-zinc-800 text-black dark:text-white font-bold rounded-2xl hover:bg-black/5 dark:hover:bg-zinc-700/50 transition-all active:scale-95 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDeleteHandler}
                className="flex-1 py-3 px-6 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      <DocumentDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedDocId(null);
        }}
        documentId={selectedDocId}
        onDeleteSuccess={handleModalDeleteSuccess}
        language={language || "vi"}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </AnimationWrapper>
  );
};

export default ManageDocuments;
