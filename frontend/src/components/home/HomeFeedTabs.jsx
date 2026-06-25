/**
 * Pill segmented tab bar for the home feed.
 * Matches the navbar pill style: frosted container + white filled active pill.
 */
const HomeFeedTabs = ({
  activeTab,
  setActiveTab,
  pageState,
  setPageState,
  translations,
  access_token,
}) => {
  const tabClass = (active) =>
    `flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 ${
      active
        ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
        : "text-dark-grey dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-700/50 hover:text-black dark:hover:text-zinc-100"
    }`;

  return (
    <div className="flex bg-grey/80 dark:bg-zinc-800/50 border border-grey dark:border-zinc-700/60 rounded-2xl mb-6 sticky top-[80px] z-30 p-1 gap-0.5 transition-all shadow-sm">
      {/* Bản tin */}
      <button
        onClick={() => { setActiveTab(0); setPageState("feed"); }}
        className={tabClass(activeTab === 0)}
      >
        <i className={`fi ${activeTab === 0 ? "fi-sr-home" : "fi-rr-home"} text-[13px] leading-none mt-0.5`} />
        <span className="hidden sm:inline capitalize">
          {pageState === "feed" ? "Bản tin" : pageState}
        </span>
      </button>

      {/* Theo dõi — chỉ hiện khi đăng nhập */}
      {access_token && (
        <button
          onClick={() => { setActiveTab(1); setPageState(translations.following); }}
          className={tabClass(activeTab === 1)}
        >
          <i className={`fi ${activeTab === 1 ? "fi-sr-users" : "fi-rr-users"} text-[13px] leading-none mt-0.5`} />
          <span className="hidden sm:inline">Theo dõi</span>
        </button>
      )}

      {/* Xu hướng */}
      <button
        onClick={() => setActiveTab(2)}
        className={tabClass(activeTab === 2)}
      >
        <i className={`fi ${activeTab === 2 ? "fi-sr-arrow-trend-up" : "fi-rr-arrow-trend-up"} text-[13px] leading-none mt-0.5`} />
        <span className="hidden sm:inline">Xu hướng</span>
      </button>

      {/* Tin tức */}
      <button
        onClick={() => setActiveTab(3)}
        className={tabClass(activeTab === 3)}
      >
        <i className={`fi ${activeTab === 3 ? "fi-sr-megaphone" : "fi-rr-megaphone"} text-[13px] leading-none mt-0.5`} />
        <span className="hidden sm:inline">Tin tức</span>
      </button>
    </div>
  );
};

export default HomeFeedTabs;
