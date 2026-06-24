import { useContext, useState, useEffect } from "react";
import { ThemeContext, UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Pagination from "../components/pagination.component";

// Extracted Subcomponents & Services
import { GroupCard } from "../components/groups/group-card.component";
import { CreateGroupModal } from "../components/groups/create-group-modal.component";
import { listGroups, createGroup } from "../services/group.service";

const GroupsPage = () => {
  const { theme } = useContext(ThemeContext);
  const { userAuth } = useContext(UserContext);
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all, public, private, mine
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGroups, setTotalGroups] = useState(0);
  const limit = 6;

  // Form states for creating group
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    avatar: "",
    banner: "",
    isPrivate: false,
  });

  const fetchGroups = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await listGroups(
        searchQuery,
        pageNum,
        limit,
        userAuth.access_token,
      );
      setGroups(data.list);
      setTotalGroups(data.totalGroups);
      setCurrentPage(pageNum);
    } catch (err) {
      console.error("Error fetching groups:", err);
      toast.error("Không thể tải danh sách nhóm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups(1);
  }, [searchQuery, userAuth.access_token]);

  const handlePageChange = (pageNum) => {
    fetchGroups(pageNum);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;

    try {
      await createGroup(groupForm, userAuth.access_token);

      toast.success("Tạo nhóm mới thành công!");
      fetchGroups(1);
      setIsModalOpen(false);
      setGroupForm({
        name: "",
        description: "",
        avatar: "",
        banner: "",
        isPrivate: false,
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi tạo nhóm.");
    }
  };

  const filteredGroups = groups.filter((group) => {
    if (activeFilter === "public") return !group.isPrivate;
    if (activeFilter === "private") return group.isPrivate;
    if (activeFilter === "mine") return group.myMembership !== null;

    return true;
  });

  return (
    <AnimationWrapper>
      <section
        className={`min-h-screen py-20 px-[5vw] md:px-[10vw] ${theme === "light" ? "bg-[#F8FAFC]" : "bg-[#09090B]"} transition-colors duration-500 font-inter`}
      >
        {/* Page Header */}
        <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          {/* Subtle ambient decorative backdrop glow in dark mode */}
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">
                Communities
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none font-jakarta">
              Nhóm Học Tập
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base max-w-xl font-inter">
              Khám phá và tham gia các nhóm học thuật để chia sẻ tài liệu và
              thảo luận bài tập cùng đồng nghiệp.
            </p>
          </div>

          {userAuth.access_token && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl hover:scale-[1.03] active:scale-95 transition-all text-xs font-black uppercase tracking-wider font-jakarta bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 border border-indigo-500/20"
            >
              <i className="fi fi-rr-plus text-sm"></i>
              Tạo nhóm mới
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="max-w-7xl mx-auto mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-inter">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Tất cả nhóm", icon: "fi-rr-grid" },
              { id: "public", label: "Công khai", icon: "fi-rr-globe" },
              { id: "private", label: "Riêng tư", icon: "fi-rr-lock" },
              { id: "mine", label: "Đã tham gia", icon: "fi-rr-users" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all border flex items-center gap-2 ${
                  activeFilter === filter.id
                    ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white shadow-sm shadow-indigo-500/5 scale-[1.02]"
                    : "bg-white dark:bg-[#111113] text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/10"
                }`}
              >
                <i className={`fi ${filter.icon} text-[13px]`}></i>
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Tìm kiếm nhóm học tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:border-indigo-500 outline-none text-slate-800 dark:text-white transition-all shadow-sm focus:shadow-md focus:shadow-indigo-500/5"
            />
            <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          </div>
        </div>

        {/* Group Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <GroupCard key={group._id} group={group} navigate={navigate} />
            ))
          ) : (
            <div className="col-span-full py-20 flex justify-center font-inter">
              <p className="text-slate-400 dark:text-slate-500 font-medium">
                Không tìm thấy nhóm học tập nào.
              </p>
            </div>
          )}
        </div>

        {/* Numbered Pagination */}
        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalDocs={totalGroups}
            limit={limit}
            onChange={handlePageChange}
          />
        )}

        {/* Create Group Modal */}
        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          groupForm={groupForm}
          setGroupForm={setGroupForm}
          handleCreateGroup={handleCreateGroup}
          theme={theme}
          token={userAuth?.access_token}
        />
      </section>
    </AnimationWrapper>
  );
};

export default GroupsPage;
