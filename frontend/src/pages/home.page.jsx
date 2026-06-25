import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import AnimationWrapper from "../common/page-animation";
import { getTranslations } from "../../translations";
import { UserContext, ThemeContext } from "../App";
import SupportChat from "../components/support-chat.component";
import { CreateGroupModal } from "../components/groups/create-group-modal.component";
import { createGroup } from "../services/group.service";
import { toast } from "react-hot-toast";

// ── Service Layer ───────────────────────────────────────────────────────────
import {
  fetchTags,
  fetchLatestBlogs,
  fetchFollowingBlogs,
  fetchBlogsByCategory,
  fetchTrendingBlogs,
  fetchAdminBlogs,
  fetchTrendingTopics,
  fetchTopContributors,
  fetchJoinedGroups,
  fetchAdminAlert,
} from "../services/feed.service";

// ── Layout Sub-Components ───────────────────────────────────────────────────
import HomeLeftSidebar from "../components/home/HomeLeftSidebar";
import HomeFeedTabs from "../components/home/HomeFeedTabs";
import HomeFeedContent from "../components/home/HomeFeedContent";
import HomeRightSidebar from "../components/home/HomeRightSidebar";

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Toán",
  "Văn",
  "Anh",
  "Lý",
  "Hóa",
  "Sinh",
  "Sử",
  "Địa",
  "GDCD",
  "Công Nghệ",
  "Tin Học",
  "Môn học khác",
];

// ─────────────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const { userAuth } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const { language, access_token } = userAuth;
  const translations = getTranslations(language);
  const location = useLocation();
  const navigate = useNavigate();

  // ── Feed state ──────────────────────────────────────────────────────────
  const [blogs, setBlogs] = useState(null);
  const [followingBlogs, setFollowingBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [adminBlogs, setAdminBlogs] = useState(null);

  // ── Sidebar state ───────────────────────────────────────────────────────
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [tags, setTags] = useState([]);

  // ── Groups state ────────────────────────────────────────────────────────
  const [joinedGroups, setJoinedGroups] = useState(null);
  const [joinedGroupsPage, setJoinedGroupsPage] = useState(1);
  const [joinedGroupsTotal, setJoinedGroupsTotal] = useState(0);

  // ── Group Creation state ────────────────────────────────────────────────
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    avatar: "",
    banner: "",
    isPrivate: false,
  });

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;

    try {
      await createGroup(groupForm, access_token);
      toast.success("Tạo nhóm mới thành công!");

      // Refresh groups list
      setJoinedGroups(null);
      fetchJoinedGroups(1, access_token)
        .then(({ list, totalGroups }) => {
          setJoinedGroups(list);
          setJoinedGroupsTotal(totalGroups);
          setJoinedGroupsPage(1);
        })
        .catch(console.log);

      setIsCreateGroupModalOpen(false);
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

  // ── UI state ────────────────────────────────────────────────────────────
  const [pageState, setPageState] = useState(() => {
    if (location.pathname === "/feed/following") return translations.following;
    if (location.pathname === "/feed/my-groups") return "my-groups";
    return "feed";
  });
  const [activeTab, setActiveTab] = useState(0);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [adminAlert, setAdminAlert] = useState(null);
  const [showAlert, setShowAlert] = useState(true);

  // ── Scroll-to-top visibility ────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Load tags on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetchTags()
      .then(setTags)
      .catch((err) => console.error("Failed to fetch tags:", err));
  }, []);

  // ── Sync URL ↔ pageState ────────────────────────────────────────────────
  useEffect(() => {
    if (location.pathname === "/feed/following") {
      setPageState(translations.following);
    } else if (location.pathname === "/feed/my-groups") {
      setPageState("my-groups");
    } else {
      setPageState("feed");
    }
  }, [location.pathname, translations.following]);

  // ── Main data fetch when pageState changes ──────────────────────────────
  useEffect(() => {
    setBlogs(null);

    if (pageState === "feed") {
      setActiveTab(0);
      fetchLatestBlogs(1, access_token, null).then(setBlogs).catch(console.log);
    } else if (pageState === translations.following) {
      if (!access_token) {
        setPageState("feed");
        setActiveTab(0);
      } else {
        setActiveTab(1);
        fetchFollowingBlogs(1, access_token, null)
          .then(setFollowingBlogs)
          .catch(console.log);
      }
    } else if (pageState === "my-groups") {
      if (!access_token) {
        navigate("/signin");
      } else {
        setActiveTab(4);
        setJoinedGroups(null);
        fetchJoinedGroups(1, access_token)
          .then(({ list, totalGroups }) => {
            setJoinedGroups(list);
            setJoinedGroupsTotal(totalGroups);
            setJoinedGroupsPage(1);
          })
          .catch(console.log);
      }
    } else {
      setActiveTab(0);
      fetchBlogsByCategory(pageState, 1, null)
        .then(setBlogs)
        .catch(console.log);
    }

    if (!trendingBlogs)
      fetchTrendingBlogs().then(setTrendingBlogs).catch(console.log);
    if (!adminBlogs) fetchAdminBlogs().then(setAdminBlogs).catch(console.log);
    fetchTrendingTopics().then(setTrendingTopics).catch(console.log);
    fetchTopContributors().then(setTopContributors).catch(console.log);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState]);

  // ── Re-fetch on login/logout ────────────────────────────────────────────
  useEffect(() => {
    if (!access_token) return;
    if (pageState === translations.following) {
      fetchFollowingBlogs(1, access_token, null)
        .then(setFollowingBlogs)
        .catch(console.log);
    } else if (pageState === "my-groups") {
      fetchJoinedGroups(1, access_token)
        .then(({ list, totalGroups }) => {
          setJoinedGroups(list);
          setJoinedGroupsTotal(totalGroups);
        })
        .catch(console.log);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access_token]);

  // ── Admin alert (session-scoped) ────────────────────────────────────────
  useEffect(() => {
    const alertKey = "adminAlertShown";
    if (sessionStorage.getItem(alertKey)) return;
    fetchAdminAlert(access_token)
      .then((msg) => {
        if (msg) {
          setAdminAlert(msg);
          sessionStorage.setItem(alertKey, "true");
        }
      })
      .catch(console.log);
  }, [access_token]);

  useEffect(() => {
    if (!adminAlert) return;
    setShowAlert(true);
    const t = setTimeout(() => {
      setShowAlert(false);
      setTimeout(() => setAdminAlert(null), 500);
    }, 5000);
    return () => clearTimeout(t);
  }, [adminAlert]);

  // ── Paginated load-more helpers (passed down as props) ──────────────────
  const handleLoadMoreLatest = ({ page }) =>
    fetchLatestBlogs(page, access_token, blogs)
      .then(setBlogs)
      .catch(console.log);

  const handleLoadMoreFollowing = ({ page }) =>
    fetchFollowingBlogs(page, access_token, followingBlogs)
      .then(setFollowingBlogs)
      .catch(console.log);

  const handleLoadMoreByCategory = ({ page }) =>
    fetchBlogsByCategory(pageState, page, blogs)
      .then(setBlogs)
      .catch(console.log);

  const handleLoadMoreGroups = ({ page, append }) => {
    fetchJoinedGroups(page, access_token)
      .then(({ list, totalGroups }) => {
        setJoinedGroups(
          append && joinedGroups ? [...joinedGroups, ...list] : list,
        );
        setJoinedGroupsTotal(totalGroups);
        setJoinedGroupsPage(page);
      })
      .catch(console.log);
  };

  // ── Category handlers ───────────────────────────────────────────────────
  const loadBlogByCategory = (e) => {
    const category = e.target.innerText;
    setBlogs(null);
    setPageState(pageState === category ? "feed" : category);
  };

  const loadBlogByTag = (e) => {
    const tag = e.target.value;
    setBlogs(null);
    setPageState(tag === translations.allSubjects ? "feed" : tag);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AnimationWrapper>
      {/* Admin Alert Toast */}
      {adminAlert && (
        <div
          role="alert"
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
            showAlert ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <div className="flex items-center gap-3 px-5 py-3.5 bg-white/90 dark:bg-grey/90 border border-amber-200 dark:border-amber-900/30 shadow-xl rounded-2xl backdrop-blur-sm">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-amber-600 dark:text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <span className="text-amber-800 dark:text-amber-200 font-medium text-sm">
              {adminAlert}
            </span>
            <button
              className="ml-2 text-amber-400 hover:text-amber-700 dark:hover:text-amber-200 transition-colors"
              onClick={() => setAdminAlert(null)}
            >
              <i className="fi fi-rr-cross-small text-xl"></i>
            </button>
          </div>
        </div>
      )}

      {/* Three-Column Layout */}
      <section className="home-section w-full flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-grey transition-colors duration-300">
        {/* Left Sidebar */}
        <HomeLeftSidebar
          pageState={pageState}
          setPageState={setPageState}
          categories={CATEGORIES}
          tags={tags}
          translations={translations}
          language={language}
          access_token={access_token}
          loadBlogByCategory={loadBlogByCategory}
          loadBlogByTag={loadBlogByTag}
        />

        {/* Center Feed */}
        <main className="home-feed-main flex-1 min-w-0 pb-12 bg-grey">
          <div className="max-w-3xl mx-auto py-5 px-4 lg:px-8">
            <HomeFeedTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              pageState={pageState}
              setPageState={setPageState}
              translations={translations}
              access_token={access_token}
            />
            <HomeFeedContent
              activeTab={activeTab}
              pageState={pageState}
              blogs={blogs}
              followingBlogs={followingBlogs}
              trendingBlogs={trendingBlogs}
              adminBlogs={adminBlogs}
              joinedGroups={joinedGroups}
              joinedGroupsTotal={joinedGroupsTotal}
              joinedGroupsPage={joinedGroupsPage}
              showWriteModal={showWriteModal}
              setShowWriteModal={setShowWriteModal}
              categories={CATEGORIES}
              fetchLatestBlogsFn={handleLoadMoreLatest}
              fetchFollowingBlogsFn={handleLoadMoreFollowing}
              fetchBlogsByCategoryFn={handleLoadMoreByCategory}
              fetchJoinedGroupsFn={handleLoadMoreGroups}
              loadBlogByCategory={loadBlogByCategory}
              translations={translations}
              navigate={navigate}
              setIsCreateGroupModalOpen={setIsCreateGroupModalOpen}
            />
          </div>
        </main>

        {/* Right Sidebar */}
        <HomeRightSidebar
          trendingTopics={trendingTopics}
          topContributors={topContributors}
          adminBlogs={adminBlogs}
          setPageState={setPageState}
          navigate={navigate}
          translations={translations}
        />
      </section>

      <SupportChat />

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        groupForm={groupForm}
        setGroupForm={setGroupForm}
        handleCreateGroup={handleCreateGroupSubmit}
        theme={theme}
        token={access_token}
      />

      {/* Scroll-to-top FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-[88px] right-7 z-40 w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-xl border border-grey/25 hover:bg-indigo-600 dark:hover:bg-indigo-100 transition-colors cursor-pointer group"
            aria-label="Scroll to top"
          >
            <i className="fi fi-rr-arrow-small-up text-2xl group-hover:-translate-y-0.5 transition-transform"></i>
          </motion.button>
        )}
      </AnimatePresence>
    </AnimationWrapper>
  );
};

export default HomePage;
