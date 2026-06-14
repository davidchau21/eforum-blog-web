import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import DocumentCard from "../components/document-card.component";
import UploadDocumentModal from "../components/upload-document-modal.component";
import DocumentDetailModal from "../components/document-detail-modal.component";
import Pagination from "../components/pagination.component";
import { getTranslations } from "../../translations";

const DocumentLibraryPage = () => {
  const [documents, setDocuments] = useState({ results: [], totalDocs: 0 });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  const { userAuth } = useContext(UserContext);
  const { access_token, language } = userAuth;
  const navigate = useNavigate();
  const translations = getTranslations(language || "vi");

  const fetchDocuments = (currentPage) => {
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/documents", {
        params: {
          search: search,
          sort: sort,
          page: currentPage,
          limit: 6,
        },
      })
      .then(({ data }) => {
        const { list, totalDocs } = data;
        console.log("Fetched documents list from backend:", list);
        setDocuments({
          results: list,
          totalDocs: totalDocs,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching documents:", err);
        toast.error("Không thể tải danh sách tài liệu.");
        setIsLoading(false);
      });
  };

  // Fetch when search query, sort, or page changes
  useEffect(() => {
    fetchDocuments(page);
  }, [search, sort, page]);

  // Reset to page 1 when search or sort changes
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

  const handleUploadClick = () => {
    if (!access_token) {
      toast.error("Vui lòng đăng nhập để tải tài liệu lên!");
      return navigate("/signin");
    }
    setIsUploadOpen(true);
  };

  const handleCardClick = (docId) => {
    console.log("Card click handler triggered. docId received:", docId);
    setSelectedDocId(docId);
    setIsDetailOpen(true);
  };

  const handleUploadSuccess = (newDoc) => {
    // Prefix the new document to results and increment total count
    setDocuments((prev) => ({
      results: [newDoc, ...prev.results],
      totalDocs: prev.totalDocs + 1,
    }));
  };

  const handleDeleteSuccess = (deletedId) => {
    setDocuments((prev) => ({
      results: prev.results.filter((doc) => doc._id !== deletedId),
      totalDocs: Math.max(0, prev.totalDocs - 1),
    }));
  };

  return (
    <AnimationWrapper>
      <main className="min-h-screen bg-grey/30 dark:bg-zinc-950 pb-16 transition-colors duration-300">
        <div className="max-w-6xl mx-auto py-10 px-5 lg:px-8">
          {/* Hero Banner Section */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden mb-10 border border-indigo-500/25">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-y-12 translate-x-12"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-y-24 -translate-x-12"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="bg-white/20 border border-white/10 text-white/95 text-xs font-black uppercase px-3.5 py-1.5 rounded-full select-none tracking-widest backdrop-blur-sm">
                  📚 Tài nguyên học tập
                </span>
                <h1 className="text-3xl md:text-4xl font-black mt-4 leading-tight">
                  Thư viện Tài liệu & Slide
                </h1>
                <p className="text-sm md:text-base text-white/80 mt-3.5 font-bold leading-relaxed max-w-xl">
                  Kho lưu trữ tài liệu giáo dục trực quan, slide thuyết trình, đề thi thử và giáo án được chia sẻ bởi cộng đồng EForum.
                </p>
              </div>

              <button
                onClick={handleUploadClick}
                className="bg-white hover:bg-grey/90 text-indigo-700 font-extrabold px-6 py-4 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-95 transition-all self-start md:self-center shrink-0 cursor-pointer"
              >
                <i className="fi fi-rr-cloud-upload text-base mt-0.5"></i>
                Đóng góp tài liệu
              </button>
            </div>
          </div>

          {/* Search and Sort Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8 bg-white dark:bg-zinc-900 border border-grey/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm transition-colors duration-300">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md flex items-center">
              <i className="fi fi-rr-search absolute left-4 text-dark-grey text-base mt-0.5"></i>
              <input
                type="text"
                placeholder="Tìm tên tài liệu, mô tả..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-grey/30 dark:bg-zinc-800/50 pt-3 pb-3 pl-11 pr-10 rounded-xl focus:outline-none focus:bg-grey/50 dark:focus:bg-zinc-800/80 focus:ring-1 focus:ring-indigo-500/20 text-sm text-black dark:text-white transition-all font-bold placeholder:text-dark-grey"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 w-6 h-6 rounded-full hover:bg-grey flex items-center justify-center transition-all"
                >
                  <i className="fi fi-rr-cross-small text-dark-grey text-sm mt-0.5"></i>
                </button>
              )}
            </form>

            {/* Sort Options */}
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
              <span className="text-xs font-bold text-dark-grey uppercase hidden md:inline">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-grey/40 border border-grey dark:border-zinc-800 text-black dark:text-white rounded-xl px-4 py-3 text-sm font-bold cursor-pointer hover:border-indigo-400 focus:outline-none transition-all pr-8 relative"
              >
                <option value="latest">Mới nhất</option>
                <option value="views">Xem nhiều nhất</option>
                <option value="downloads">Tải về nhiều nhất</option>
              </select>
            </div>
          </div>

          {/* Document list render */}
          {isLoading ? (
            /* List Shimmer Skeleton */
            <div className="flex flex-col gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-grey/80 dark:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 h-auto md:h-20">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-grey dark:bg-zinc-800 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-1/3 h-4 bg-grey dark:bg-zinc-800 rounded"></div>
                      <div className="w-2/3 h-3 bg-grey dark:bg-zinc-800 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 justify-between md:justify-end">
                    <div className="w-24 h-4 bg-grey dark:bg-zinc-800 rounded"></div>
                    <div className="w-16 h-4 bg-grey dark:bg-zinc-800 rounded"></div>
                    <div className="w-16 h-4 bg-grey dark:bg-zinc-800 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : documents.results.length === 0 ? (
            <NoDataMessage message="Không tìm thấy tài liệu phù hợp." />
          ) : (
            <>
              {/* Documents List */}
              <div className="flex flex-col gap-4">
                {documents.results.map((doc, idx) => (
                  <DocumentCard
                    key={doc._id || idx}
                    doc={doc}
                    language={language}
                    onClick={() => handleCardClick(doc._id)}
                  />
                ))}
              </div>

              {/* Numbered Pagination */}
              <Pagination
                currentPage={page}
                totalDocs={documents.totalDocs}
                limit={6}
                onChange={(p) => setPage(p)}
              />
            </>
          )}
        </div>
      </main>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Document Detail Modal with Embedded Reader */}
      <DocumentDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedDocId(null);
        }}
        documentId={selectedDocId}
        onDeleteSuccess={handleDeleteSuccess}
        language={language}
      />
    </AnimationWrapper>
  );
};

export default DocumentLibraryPage;
