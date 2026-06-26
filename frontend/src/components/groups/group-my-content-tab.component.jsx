import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ThemeContext, UserContext } from "../../App";
import { getUserGroupBlogs } from "../../services/group.service";

export const GroupMyContentTab = ({ groupId }) => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { userAuth: { access_token } } = useContext(UserContext);

  // Component states
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("published"); // published, pending, draft, rejected
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [counts, setCounts] = useState({ published: 0, pending: 0, draft: 0, rejected: 0 });

  // Delete confirmation
  const [blogToDelete, setBlogToDelete] = useState(null);

  const limit = 5;

  // Fetch blogs list based on tab, search, and page
  const fetchBlogs = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await getUserGroupBlogs(groupId, activeSubTab, page, limit, access_token, searchQuery);
      setBlogs(data.list || []);
      setTotalBlogs(data.totalBlogs || 0);
      
      // Dynamically update the count for the active tab
      setCounts(prev => ({
        ...prev,
        [activeSubTab]: data.totalBlogs
      }));
    } catch (err) {
      console.error("Failed to fetch user group blogs:", err);
      toast.error("Lỗi khi tải danh sách bài viết.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Fetch counts for all tabs in parallel to show on the sub-tab headers
  const fetchAllCounts = async () => {
    try {
      const filters = ["published", "pending", "draft", "rejected"];
      const promises = filters.map(f => 
        getUserGroupBlogs(groupId, f, 1, 1, access_token, searchQuery)
          .then(data => ({ filter: f, count: data.totalBlogs }))
      );
      const results = await Promise.all(promises);
      const newCounts = {};
      results.forEach(r => {
        newCounts[r.filter] = r.count;
      });
      setCounts(newCounts);
    } catch (err) {
      console.error("Failed to fetch user group blog counts:", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchAllCounts();
  }, [activeSubTab, page, searchQuery]);

  // Handle post deletion
  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    
    let loadingToast = toast.loading("Đang xóa bài viết...");
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/delete-blog`,
        { blog_id: blogToDelete.blog_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      toast.dismiss(loadingToast);
      toast.success("Xóa bài viết thành công!");
      setBlogToDelete(null);
      // Re-fetch to update UI
      fetchBlogs(true);
      fetchAllCounts();
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Failed to delete blog:", err);
      toast.error(err.response?.data?.error || "Lỗi khi xóa bài viết.");
    }
  };

  const getDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 font-jakarta text-left">
      {/* Search and Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
            Quản lý bài viết của tôi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Xem và chỉnh sửa các bài viết bạn đã soạn thảo hoặc đăng trong nhóm này
          </p>
        </div>

        {/* Search input with sleek glassmorphism */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề bài viết..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white"
          />
          <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/60 dark:border-white/5 pb-px">
        {[
          { id: "published", label: "Đã đăng", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
          { id: "pending", label: "Chờ duyệt", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
          { id: "draft", label: "Bản nháp", color: "bg-slate-500/10 text-slate-600 dark:text-slate-405" },
          { id: "rejected", label: "Bị từ chối", color: "bg-rose-500/10 text-rose-600 dark:text-rose-450" }
        ].map((subTab) => {
          const isActive = activeSubTab === subTab.id;
          const count = counts[subTab.id] || 0;
          return (
            <button
              key={subTab.id}
              onClick={() => {
                setActiveSubTab(subTab.id);
                setPage(1);
              }}
              className={`pb-3 px-4 text-xs font-black relative flex items-center gap-2 transition-colors duration-250 cursor-pointer ${
                isActive
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <span>{subTab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                isActive ? subTab.color : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400"
              }`}>
                {count}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeSubTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950 dark:bg-white"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Lists */}
      <div className="min-h-[250px]">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 w-full bg-slate-100 dark:bg-zinc-800/35 rounded-[24px] animate-pulse" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          /* Sleek Empty State Card */
          <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] p-12 text-center shadow-sm relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center text-xl mx-auto mb-4 border border-indigo-100 dark:border-indigo-500/20">
              <i className="fi fi-rr-document-signed"></i>
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Không tìm thấy bài viết nào
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              {searchQuery 
                ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc tìm kiếm để hiển thị lại dữ liệu." 
                : `Bạn chưa có bài viết nào thuộc danh mục này trong nhóm học tập này.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => {
              const { blog_id, title, des, banner, publishedAt, activity } = blog;

              return (
                <div 
                  key={blog_id}
                  className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[24px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex gap-4 items-start w-full">
                    {/* Thumbnail banner */}
                    {banner && activeSubTab !== "draft" && (
                      <img
                        src={banner}
                        alt="Blog Thumbnail"
                        className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-zinc-850 border border-slate-200/50 dark:border-white/5 shadow-sm group-hover:scale-102 transition-all duration-300"
                      />
                    )}

                    <div className="space-y-1.5 w-full">
                      {/* Badge section */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {activeSubTab === "pending" && (
                          <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-500/25">
                            Chờ phê duyệt
                          </span>
                        )}
                        {activeSubTab === "draft" && (
                          <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider border border-slate-200 dark:border-white/5">
                            Bản nháp
                          </span>
                        )}
                        {activeSubTab === "rejected" && (
                          <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-450 rounded-full text-[9px] font-black uppercase tracking-wider border border-rose-500/25">
                            Bị từ chối
                          </span>
                        )}
                        <span className="text-[10px] text-slate-450 font-bold">
                          {getDisplayDate(publishedAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-1 group-hover:text-indigo-500 transition-colors">
                        {activeSubTab === "published" ? (
                          <Link to={`/blog/${blog_id}`}>{title}</Link>
                        ) : (
                          <span>{title || "Untitled Draft"}</span>
                        )}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed max-w-2xl font-light">
                        {des || "Chưa có mô tả ngắn cho bài đăng này..."}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Stats & Action Controls */}
                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 border-slate-100 dark:border-white/5 pt-4 md:pt-0">
                    {/* Stats for published posts */}
                    {activeSubTab === "published" && activity && (
                      <div className="flex gap-4 text-[11px] font-black text-slate-550 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <i className="fi fi-br-heart text-indigo-500 text-xs"></i>
                          <span>{activity.total_likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <i className="fi fi-br-comment text-indigo-500 text-xs"></i>
                          <span>{activity.total_comments || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <i className="fi fi-br-eye text-indigo-500 text-xs"></i>
                          <span>{activity.total_reads || 0}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions button group */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/group-editor/${blog_id}`)}
                        className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-indigo-500/10 text-slate-650 dark:text-slate-300 hover:text-indigo-500 rounded-xl transition-all border border-slate-150 dark:border-white/5 cursor-pointer text-xs flex items-center gap-1 font-bold"
                      >
                        <i className="fi fi-rr-edit text-xs"></i>
                        <span className="hidden sm:inline">Sửa</span>
                      </button>

                      <button
                        onClick={() => setBlogToDelete(blog)}
                        className="p-2 bg-rose-500/5 hover:bg-rose-500/15 text-rose-550 dark:text-rose-400 rounded-xl transition-all border border-rose-500/10 cursor-pointer text-xs flex items-center gap-1 font-bold"
                      >
                        <i className="fi fi-rr-trash text-xs"></i>
                        <span className="hidden sm:inline">Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination component */}
      {totalBlogs > limit && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed dark:text-white"
          >
            <i className="fi fi-rr-angle-left"></i>
          </button>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Trang {page} / {Math.ceil(totalBlogs / limit)}
          </span>
          <button
            disabled={page >= Math.ceil(totalBlogs / limit)}
            onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(totalBlogs / limit)))}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed dark:text-white"
          >
            <i className="fi fi-rr-angle-right"></i>
          </button>
        </div>
      )}

      {/* Sleek Delete Confirmation Modal */}
      <AnimatePresence>
        {blogToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#111113] rounded-[32px] shadow-2xl p-8 max-w-sm w-full border border-slate-200/60 dark:border-white/5 font-jakarta text-center"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-5 mx-auto border border-rose-500/20">
                <i className="fi fi-rr-trash text-xl"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                Xóa bài viết này?
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed mb-8 px-2">
                Hành động này không thể hoàn tác. Bài viết, lượt tương tác và toàn bộ bình luận liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setBlogToDelete(null)}
                  className="flex-1 py-3 px-6 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all active:scale-95 text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDeleteBlog}
                  className="flex-1 py-3 px-6 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-650 transition-all shadow-lg shadow-rose-500/20 active:scale-95 text-xs cursor-pointer"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
