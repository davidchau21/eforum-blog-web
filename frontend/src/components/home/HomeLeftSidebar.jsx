import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import { ThemeContext } from "../../App";

const HomeLeftSidebar = ({
  pageState,
  setPageState,
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
  const { theme } = useContext(ThemeContext) || {};
  const isDark = theme === "dark";

  const navBtnClass = (active) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm ${
      active
        ? "bg-indigo-500/10 text-indigo-500 font-bold"
        : "text-dark-grey dark:text-zinc-400 hover:bg-grey dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
    }`;

  // Build react-select options
  const allOption = { value: "__all__", label: translations.allSubjects };
  const tagOptions = [
    allOption,
    ...tags.map((t) => ({ value: t.tag_name, label: t.tag_name })),
  ];

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      background: isDark ? "#27272a" : "#f3f4f6",
      borderColor: state.isFocused ? "#6366f1" : isDark ? "#3f3f46" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(99,102,241,0.2)" : "none",
      borderRadius: "10px",
      minHeight: "38px",
      fontSize: "13px",
      cursor: "pointer",
      transition: "all 0.15s",
      "&:hover": {
        borderColor: "#818cf8",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 10px",
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#e4e4e7" : "#111827",
      fontWeight: 500,
      textTransform: "capitalize",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#71717a" : "#9ca3af",
      fontSize: "13px",
    }),
    input: (base) => ({
      ...base,
      color: isDark ? "#e4e4e7" : "#111827",
    }),
    menu: (base) => ({
      ...base,
      background: isDark ? "#18181b" : "#ffffff",
      border: `1px solid ${isDark ? "#3f3f46" : "#e5e7eb"}`,
      borderRadius: "12px",
      boxShadow: isDark
        ? "0 10px 30px rgba(0,0,0,0.5)"
        : "0 10px 30px rgba(0,0,0,0.1)",
      overflow: "hidden",
      zIndex: 50,
    }),
    menuList: (base) => ({
      ...base,
      padding: "6px",
      maxHeight: "220px",
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? "rgba(99,102,241,0.12)"
        : state.isFocused
          ? isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(99,102,241,0.06)"
          : "transparent",
      color: state.isSelected ? "#6366f1" : isDark ? "#d4d4d8" : "#374151",
      fontWeight: state.isSelected ? 700 : 400,
      fontSize: "13px",
      borderRadius: "8px",
      padding: "8px 12px",
      cursor: "pointer",
      textTransform: "capitalize",
      transition: "all 0.1s",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: isDark ? "#71717a" : "#9ca3af",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0)",
      transition: "transform 0.2s ease",
      padding: "0 8px",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: isDark ? "#71717a" : "#9ca3af",
      "&:hover": { color: isDark ? "#f4f4f5" : "#111827" },
      padding: "0 4px",
    }),
  };

  const handleTagChange = (selected) => {
    if (!selected || selected.value === "__all__") {
      // Simulate synthetic event for the existing handler
      loadBlogByTag({ target: { value: translations.allSubjects } });
      setPageState("feed");
    } else {
      loadBlogByTag({ target: { value: selected.value } });
    }
  };

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
          <i
            className={`fi fi-rr-home text-base mt-0.5 ${pageState === "feed" ? "text-indigo-500" : ""}`}
          ></i>
          Home
        </button>
        <button
          onClick={() => navigate("/trending")}
          className={navBtnClass(location.pathname === "/trending")}
        >
          <i
            className={`fi fi-rr-arrow-trend-up text-base mt-0.5 ${location.pathname === "/trending" ? "text-indigo-500" : ""}`}
          ></i>
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
            navigate("/feed/my-groups");
          }}
          className={navBtnClass(pageState === "my-groups")}
        >
          <i
            className={`fi fi-rr-users text-base mt-0.5 ${pageState === "my-groups" ? "text-indigo-500" : ""}`}
          ></i>
          {translations.myGroups}
        </button>
        <button
          onClick={() => {
            if (!access_token) return navigate("/signin");
            navigate("/feed/saved");
          }}
          className={navBtnClass(pageState === translations.savedBlogs)}
        >
          <i
            className={`fi fi-rr-bookmark text-base mt-0.5 ${pageState === translations.savedBlogs ? "text-indigo-500" : ""}`}
          ></i>
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
                    i % 3 === 0
                      ? "bg-blue-400"
                      : i % 3 === 1
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                  }`}
                />
                <span className="capitalize truncate tracking-tight">
                  {category}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="mt-auto px-3 py-4 border-t border-grey dark:border-zinc-800 space-y-3">
        <button
          onClick={() => {
            if (!access_token) return navigate("/signin");
            navigate("/settings/edit-profile");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-grey dark:text-zinc-400 hover:bg-grey dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
        >
          <i className="fi fi-rr-settings text-base mt-0.5"></i>
          Settings
        </button>

        {/* Tag Filter — react-select */}
        <div>
          <p className="px-1 text-[10px] font-bold text-dark-grey dark:text-zinc-500 uppercase tracking-widest mb-1.5">
            Filter by tag
          </p>
          <Select
            options={tagOptions}
            defaultValue={allOption}
            onChange={handleTagChange}
            styles={selectStyles}
            isSearchable
            placeholder={translations.allSubjects}
            classNamePrefix="rs"
            menuPlacement="top"
            components={{
              IndicatorSeparator: () => null,
            }}
          />
        </div>
      </div>
    </aside>
  );
};

export default HomeLeftSidebar;
