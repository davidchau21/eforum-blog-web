import { useLocation, useNavigate } from "react-router-dom";

const HomeLeftSidebar = ({
  pageState,
  setPageState,
  setBlogs,
  setActiveTab,
  categories,
  tags,
  translations,
  language,
  access_token,
  loadBlogByCategory,
  loadBlogByTag,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navBtnClass = (active) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm ${
      active
        ? "bg-indigo-500/10 text-indigo-500 font-bold"
        : "text-dark-grey dark:text-zinc-400 hover:bg-grey dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
    }`;

  return (
    <aside className="home-sidebar hidden md:flex w-64 flex-shrink-0 h-[calc(100vh-80px)] sticky left-0 top-[80px] bg-white dark:bg-zinc-900 border-r border-grey dark:border-zinc-800 flex-col overflow-y-auto scrollbar-hide">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-grey dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-500 flex-shrink-0">
            <i className="fi fi-rr-graduation-cap text-base mt-0.5"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-black dark:text-white leading-tight">
              EForum
            </p>
            <p className="text-[10px] text-dark-grey dark:text-zinc-500 tracking-wide uppercase font-bold">
              Academic Community
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 py-3 space-y-0.5">
        <button
          onClick={() => navigate("/feed")}
          className={navBtnClass(pageState === "feed")}
        >
          <i className={`fi fi-rr-home text-base mt-0.5 ${pageState === "feed" ? "text-indigo-500" : ""}`}></i>
          Home
        </button>
        <button
          onClick={() => navigate("/trending")}
          className={navBtnClass(location.pathname === "/trending")}
        >
          <i className={`fi fi-rr-arrow-trend-up text-base mt-0.5 ${location.pathname === "/trending" ? "text-indigo-500" : ""}`}></i>
          Popular
        </button>
        <button
          onClick={() => navigate("/friends")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm text-dark-grey dark:text-zinc-400 hover:bg-grey dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
        >
          <i className="fi fi-rr-users text-base mt-0.5"></i>
          {language === "vi" ? "Bạn bè" : "Friends"}
        </button>
        <button
          onClick={() => {
            if (!access_token) return navigate("/signin");
            setActiveTab(4);
            setPageState("my-groups");
          }}
          className={navBtnClass(pageState === "my-groups")}
        >
          <i className={`fi fi-rr-users text-base mt-0.5 ${pageState === "my-groups" ? "text-indigo-500" : ""}`}></i>
          {translations.myGroups}
        </button>
        <button
          onClick={() => {
            if (!access_token) return navigate("/signin");
            navigate("/feed/saved");
          }}
          className={navBtnClass(pageState === translations.savedBlogs)}
        >
          <i className={`fi fi-rr-bookmark text-base mt-0.5 ${pageState === translations.savedBlogs ? "text-indigo-500" : ""}`}></i>
          {translations.savedBlogs}
        </button>
      </nav>

      {/* Subject Categories */}
      <div className="px-3 py-3 border-t border-grey dark:border-zinc-800">
        <p className="px-3 text-[10px] font-bold text-dark-grey dark:text-zinc-500 uppercase tracking-widest mb-2">
          Subjects
        </p>
        <nav className="space-y-1">
          {categories.slice(0, 8).map((category, i) => {
            const isActive = pageState === category;
            return (
              <button
                key={i}
                onClick={loadBlogByCategory}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm transform hover:translate-x-1 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/5 text-indigo-600 font-extrabold border-l-4 border-indigo-500 shadow-sm"
                    : "text-dark-grey hover:bg-grey/80 hover:text-black"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 transition-transform ${isActive ? "scale-125" : ""} ${
                    i % 3 === 0 ? "bg-blue-400" : i % 3 === 1 ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span className="capitalize truncate tracking-tight">{category}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="mt-auto px-3 py-4 border-t border-grey dark:border-zinc-800 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-grey dark:text-zinc-400 hover:bg-grey dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors">
          <i className="fi fi-rr-time-past text-base mt-0.5"></i>
          History
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-grey dark:text-zinc-400 hover:bg-grey dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors">
          <i className="fi fi-rr-settings text-base mt-0.5"></i>
          Settings
        </button>
        <div className="relative pt-3">
          <select
            className="w-full appearance-none bg-grey dark:bg-zinc-800 text-black dark:text-zinc-100 border border-grey dark:border-zinc-700 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
            onChange={(e) => {
              loadBlogByTag(e);
              if (e.target.value === translations.allSubjects) setPageState("feed");
            }}
          >
            <option>{translations.allSubjects}</option>
            {tags.map((tag, index) => (
              <option key={index} value={tag.tag_name}>
                {tag.tag_name}
              </option>
            ))}
          </select>
          <i className="fi fi-rr-angle-small-down absolute right-3 top-1/2 mt-1 text-dark-grey pointer-events-none text-sm"></i>
        </div>
        <button className="w-full bg-indigo-500 text-white font-bold text-sm py-2.5 rounded-lg hover:bg-indigo-600 transition-all mt-2 active:scale-95">
          Join Subject
        </button>
      </div>
    </aside>
  );
};

export default HomeLeftSidebar;
