/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from "axios";
import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const SavedBlogCard = ({ blog, collections, onMove, onDelete }) => {
  const { title, banner, blog_id, author, publishedAt, collection_id } = blog;
  const authorName =
    author?.personal_info?.fullname ||
    author?.personal_info?.username ||
    "Unknown Author";
  const authorImg = author?.personal_info?.profile_img;

  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const menuRef = useRef(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoveMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const collectionName = collection_id
    ? collections.find((c) => c._id === collection_id)?.name ||
      "Bộ sưu tập đã xóa"
    : "Mục đã lưu";

  const isDefaultBanner =
    banner ===
    "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg";

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow duration-200 group relative">
      {/* Thumbnail */}
      <Link
        to={`/blog/${blog_id}`}
        className="flex-shrink-0 w-full sm:w-[200px] h-[140px] rounded-lg overflow-hidden relative bg-slate-100 flex items-center justify-center"
      >
        {banner && !isDefaultBanner ? (
          <img
            src={banner}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <img
            src={authorImg}
            alt={title}
            className="w-20 h-20 rounded-full object-cover group-hover:scale-105 transition-transform duration-500 shadow-sm"
          />
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
        <div>
          <Link to={`/blog/${blog_id}`}>
            <h2 className="text-xl font-bold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors">
              {title}
            </h2>
          </Link>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <span>Bài viết</span>
            <span>•</span>
            <span>
              Đã lưu vào{" "}
              <span className="font-semibold text-indigo-600">
                {collectionName}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <img
              src={authorImg}
              className="w-6 h-6 rounded-full object-cover"
              alt="author"
            />
            <span className="text-sm text-slate-700">
              Đã lưu từ bài viết của{" "}
              <span className="font-semibold text-slate-900">{authorName}</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              Chuyển mục <i className="fi fi-rr-angle-small-down mt-1"></i>
            </button>

            {showMoveMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
                <p className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Chuyển bài viết đến:
                </p>
                <button
                  onClick={() => {
                    onMove(blog_id, "default");
                    setShowMoveMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${!collection_id ? "text-indigo-600 font-semibold bg-indigo-50/50" : "text-slate-700"}`}
                >
                  <i className="fi fi-sr-bookmark mr-2 text-indigo-500"></i> Mục
                  mặc định
                </button>
                {collections.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => {
                      onMove(blog_id, c._id);
                      setShowMoveMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${collection_id === c._id ? "text-indigo-600 font-semibold bg-indigo-50/50" : "text-slate-700"}`}
                  >
                    <i className="fi fi-rr-folder mr-2"></i> {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            title="Bỏ lưu bài viết"
            onClick={() => onDelete(blog_id)}
          >
            <i className="fi fi-rr-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const SavedBlogsPage = () => {
  const [blogs, setBlogs] = useState(null);
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState("all"); // "all", "default", or collection_id
  const [filterType, setFilterType] = useState("all"); // "all", "image", "video", "link"
  const [sortDate, setSortDate] = useState("desc"); // "desc", "asc"

  const [page, setPage] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const fetchCollections = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/collections", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then(({ data }) => setCollections(data.collections))
      .catch(console.log);
  };

  const fetchSavedBlogs = (
    pageNum = 1,
    collectionId = activeCollection,
    type = filterType,
    sort = sortDate,
  ) => {
    let params = { page: pageNum, sort };
    if (collectionId !== "all") {
      params.collection_id = collectionId;
    }
    if (type !== "all") {
      params.type = type;
    }

    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/get-saved-blogs", {
        params,
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then(({ data }) => {
        if (pageNum === 1) {
          setBlogs(data.blogs);
        } else {
          setBlogs((prev) => [...prev, ...data.blogs]);
        }
        setTotalDocs(data.total);
        setPage(data.page);
      })
      .catch(console.log);
  };

  useEffect(() => {
    if (access_token) {
      fetchCollections();
      fetchSavedBlogs(1, activeCollection, filterType, sortDate);
    }
  }, [access_token, activeCollection, filterType, sortDate]);

  const handleCreateCollection = (e) => {
    e.preventDefault();
    if (!newCollectionName.trim())
      return toast.error("Tên không được để trống");

    setIsSubmitting(true);
    let loadingToast = toast.loading("Đang tạo...");

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/collections",
        { name: newCollectionName },
        { headers: { Authorization: `Bearer ${access_token}` } },
      )
      .then(({ data }) => {
        toast.dismiss(loadingToast);
        toast.success(data.message || "Đã tạo bộ sưu tập");
        setShowCreateModal(false);
        setNewCollectionName("");
        fetchCollections(); // refresh
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        toast.error(err.response?.data?.error || "Lỗi tạo bộ sưu tập");
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDeleteCollection = (e, colId) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa bộ sưu tập này? Các bài viết bên trong sẽ được chuyển về Mục mặc định.",
      )
    )
      return;

    let loadingToast = toast.loading("Đang xóa...");
    axios
      .delete(
        import.meta.env.VITE_SERVER_DOMAIN + `/blogs/collections/${colId}`,
        { headers: { Authorization: `Bearer ${access_token}` } },
      )
      .then(({ data }) => {
        toast.dismiss(loadingToast);
        toast.success(data.message);
        if (activeCollection === colId) setActiveCollection("all");
        fetchCollections();
        if (activeCollection === "all") fetchSavedBlogs(1, "all"); // refresh blogs if we are on 'all'
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        toast.error(err.response?.data?.error || "Lỗi khi xóa");
      });
  };

  const handleMoveBlog = (blog_id, target_collection_id) => {
    let loadingToast = toast.loading("Đang chuyển...");
    axios
      .put(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/save-blog/move",
        { blog_id, collection_id: target_collection_id },
        { headers: { Authorization: `Bearer ${access_token}` } },
      )
      .then(() => {
        toast.dismiss(loadingToast);
        toast.success("Đã chuyển bài viết");
        // If we are viewing a specific collection, remove it from view if it moved away
        if (
          activeCollection !== "all" &&
          activeCollection !== target_collection_id
        ) {
          setBlogs((prev) => prev.filter((b) => b.blog_id !== blog_id));
          setTotalDocs((prev) => prev - 1);
        } else {
          fetchSavedBlogs(1, activeCollection); // Re-fetch to update card UI
        }
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        toast.error(err.response?.data?.error || "Lỗi khi chuyển");
      });
  };

  const handleUnsaveBlog = (blog_id) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/save-blog",
        { blog_id },
        { headers: { Authorization: `Bearer ${access_token}` } },
      )
      .then(() => {
        toast.success("Đã bỏ lưu");
        setBlogs((prev) => prev.filter((b) => b.blog_id !== blog_id));
        setTotalDocs((prev) => prev - 1);
      })
      .catch(console.log);
  };

  return (
    <AnimationWrapper>
      <Toaster />
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                Tạo bộ sưu tập mới
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                <i className="fi fi-rr-cross-small text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleCreateCollection} className="p-6">
              <input
                type="text"
                placeholder="Nhập tên bộ sưu tập..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                autoFocus
              />
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors"
                >
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-80px)] bg-[#F0F2F5]">
        {/* Left Sidebar */}
        <aside className="w-[360px] bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide shadow-sm z-10">
          <div className="p-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Đã lưu</h1>
            <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <i className="fi fi-rr-settings text-slate-700"></i>
            </button>
          </div>

          <div className="px-2 space-y-1">
            <button
              onClick={() => setActiveCollection("all")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeCollection === "all" ? "bg-indigo-50" : "hover:bg-slate-50"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${activeCollection === "all" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}
              >
                <i className="fi fi-sr-apps text-lg mt-1"></i>
              </div>
              <span
                className={`font-semibold text-[15px] ${activeCollection === "all" ? "text-indigo-700" : "text-slate-700"}`}
              >
                Tất cả mục đã lưu
              </span>
            </button>

            <button
              onClick={() => setActiveCollection("default")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeCollection === "default" ? "bg-indigo-50" : "hover:bg-slate-50"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${activeCollection === "default" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}
              >
                <i className="fi fi-sr-bookmark text-lg mt-1"></i>
              </div>
              <span
                className={`font-semibold text-[15px] ${activeCollection === "default" ? "text-indigo-700" : "text-slate-700"}`}
              >
                Mục mặc định
              </span>
            </button>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="px-5 mb-2">
              <h3 className="font-semibold text-slate-900 text-[17px]">
                Bộ sưu tập của tôi
              </h3>
            </div>

            <div className="px-2 space-y-1">
              {collections.map((col, idx) => {
                // Determine color based on index
                const colors = [
                  "bg-blue-100 text-blue-600",
                  "bg-emerald-100 text-emerald-600",
                  "bg-pink-100 text-pink-600",
                  "bg-amber-100 text-amber-600",
                  "bg-purple-100 text-purple-600",
                ];
                const colBg = colors[idx % colors.length];
                const isActive = activeCollection === col._id;

                return (
                  <button
                    key={col._id}
                    onClick={() => setActiveCollection(col._id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group ${isActive ? "bg-slate-100" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? "ring-2 ring-indigo-400 ring-offset-2" : ""} ${colBg}`}
                      >
                        <i className={`fi fi-rr-folder text-xl mt-1`}></i>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span
                          className={`font-semibold text-[15px] truncate w-full text-left ${isActive ? "text-indigo-700" : "text-slate-800"}`}
                        >
                          {col.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mt-0.5">
                          <i className="fi fi-rr-lock text-[10px]"></i>
                          <span>Chỉ mình tôi</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Col Btn (shows on hover) */}
                    <div
                      onClick={(e) => handleDeleteCollection(e, col._id)}
                      className="w-8 h-8 rounded-full hover:bg-red-100 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-2"
                      title="Xóa bộ sưu tập"
                    >
                      <i className="fi fi-rr-trash text-sm mt-0.5"></i>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 mt-auto border-t border-slate-200 bg-white sticky bottom-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <i className="fi fi-rr-plus"></i>
              Tạo bộ sưu tập mới
            </button>
          </div>
        </aside>

        {/* Right Content */}
        <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {activeCollection === "all"
                  ? "Tất cả mục đã lưu"
                  : activeCollection === "default"
                    ? "Mục mặc định"
                    : collections.find((c) => c._id === activeCollection)
                        ?.name || "Bộ sưu tập"}
              </h2>
              <div className="bg-slate-200/50 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold">
                {totalDocs} mục
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {/* Type Filters */}
              {[
                { id: "all", label: "Tất cả" },
                { id: "image", label: "Ảnh" },
                { id: "video", label: "Video" },
                { id: "link", label: "Liên kết" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-4 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap transition-colors border ${
                    filterType === f.id
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <div className="h-6 w-[1px] bg-slate-300 mx-1"></div>

              {/* Date Sort */}
              <button
                onClick={() =>
                  setSortDate((prev) => (prev === "desc" ? "asc" : "desc"))
                }
                className="px-4 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm whitespace-nowrap flex items-center gap-2 transition-colors"
              >
                <i className="fi fi-rr-calendar"></i>
                {sortDate === "desc" ? "Gần đây nhất" : "Cũ nhất trước"}
                <i
                  className={`fi fi-rr-angle-small-${sortDate === "desc" ? "down" : "up"} mt-0.5 ml-1`}
                ></i>
              </button>
            </div>

            {blogs === null ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : blogs.length > 0 ? (
              <div className="flex flex-col gap-4">
                {blogs.map((blog, i) => (
                  <AnimationWrapper
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    key={blog.blog_id}
                  >
                    <SavedBlogCard
                      blog={blog}
                      collections={collections}
                      onMove={handleMoveBlog}
                      onDelete={handleUnsaveBlog}
                    />
                  </AnimationWrapper>
                ))}

                {blogs.length < totalDocs && (
                  <button
                    onClick={() => fetchSavedBlogs(page + 1)}
                    className="w-full py-3 mt-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Tải thêm
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center border border-slate-200 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <i className="fi fi-rr-folder-open text-3xl text-slate-300 mt-2"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có bài viết nào
                </h3>
                <p className="text-slate-500 max-w-sm">
                  Hãy khám phá và lưu các bài viết thú vị vào đây nhé!
                </p>
                <Link
                  to="/feed"
                  className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Khám phá ngay
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </AnimationWrapper>
  );
};

export default SavedBlogsPage;
