import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Toaster } from "react-hot-toast";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import {
  ManageDraftBlogPost,
  ManagePublishedBlogCard,
} from "../components/manage-blogcard.component";
import { useSearchParams } from "react-router-dom";
import { getTranslations } from "../../translations";

const PAGE_SIZE = 5;

// ── Pagination bar ────────────────────────────────────────────────
const Pagination = ({ currentPage, totalDocs, onPageChange }) => {
  const totalPages = Math.ceil(totalDocs / PAGE_SIZE);
  if (totalPages <= 1) return null;

  // Build page window: always show first, last, current ±1, and ellipsis
  const getPages = () => {
    const pages = [];
    const delta = 1;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-grey">
      <p className="text-[13px] text-dark-grey">
        Page <span className="font-semibold text-black">{currentPage}</span> of{" "}
        <span className="font-semibold text-black">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-grey bg-white text-dark-grey hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <i className="fi fi-rr-angle-left text-[12px]"></i>
        </button>

        {/* Pages */}
        {getPages().map((page, i) =>
          page === "..." ? (
            <span key={i} className="w-9 h-9 flex items-center justify-center text-[13px] text-dark-grey">
              ···
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-medium transition-all border ${
                currentPage === page
                  ? "bg-black text-white border-black shadow-sm"
                  : "border-grey bg-white text-dark-grey hover:border-black hover:text-black"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          disabled={currentPage === Math.ceil(totalDocs / PAGE_SIZE)}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-grey bg-white text-dark-grey hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <i className="fi fi-rr-angle-right text-[12px]"></i>
        </button>
      </div>
    </div>
  );
};

// ── Blog list tab ──────────────────────────────────────────────────
const BlogTab = ({ data, loading, CardComponent, stateFunc, onPageChange }) => {
  if (loading) return <div className="py-16 flex justify-center"><Loader /></div>;
  if (!data || !data.results.length) return <NoDataMessage message="No blogs found." />;

  return (
    <>
      <div>
        {data.results.map((blog, i) => (
          <AnimationWrapper key={blog.blog_id || i} transition={{ delay: i * 0.04 }}>
            <CardComponent blog={{ ...blog, index: i, setStateFunc: stateFunc }} />
          </AnimationWrapper>
        ))}
      </div>
      <Pagination
        currentPage={data.page}
        totalDocs={data.totalDocs}
        onPageChange={onPageChange}
      />
    </>
  );
};

// ── Main page ─────────────────────────────────────────────────────
const ManageBlogs = () => {
  const {
    userAuth: { access_token, language },
  } = useContext(UserContext);
  const translations = getTranslations(language);

  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState({ published: false, draft: false, pending: false });

  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [pending, setPending] = useState(null);

  const activeTab = useSearchParams()[0].get("tab");

  // Generic fetch — returns page-aware data object
  const fetchBlogs = useCallback(
    async ({ page = 1, draft, filter }) => {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/user-written-blogs",
        { page, draft, query, filter },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      const { data: countData } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/user-written-blogs-count",
        { draft, query, filter },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      return {
        results: data.blogs,
        page,
        totalDocs: countData.totalDocs,
      };
    },
    [access_token, query]
  );

  // Load each tab on mount & query change
  useEffect(() => {
    if (!access_token) return;

    const load = async () => {
      setLoading({ published: true, draft: true, pending: true });
      const [pub, dft, pnd] = await Promise.all([
        fetchBlogs({ page: 1, draft: false }),
        fetchBlogs({ page: 1, draft: true, filter: "draft" }),
        fetchBlogs({ page: 1, draft: false, filter: "pending" }),
      ]);
      setBlogs(pub);
      setDrafts(dft);
      setPending(pnd);
      setLoading({ published: false, draft: false, pending: false });
    };

    load().catch(console.error);
  }, [access_token, query]);

  const handlePageChange = useCallback(
    async (type, page) => {
      const configs = {
        published: { setter: setBlogs, draft: false, filter: undefined },
        draft: { setter: setDrafts, draft: true, filter: "draft" },
        pending: { setter: setPending, draft: false, filter: "pending" },
      };
      const { setter, draft, filter } = configs[type];
      setLoading((prev) => ({ ...prev, [type]: true }));
      const result = await fetchBlogs({ page, draft, filter });
      setter(result);
      setLoading((prev) => ({ ...prev, [type]: false }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [fetchBlogs]
  );

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchInput.trim()) {
      setQuery(searchInput.trim());
      setBlogs(null); setDrafts(null); setPending(null);
    }
  };

  const handleClear = () => {
    setSearchInput("");
    setQuery("");
    setBlogs(null); setDrafts(null); setPending(null);
  };

  return (
    <div>
      <h1 className="hidden md:block text-[22px] font-bold text-black mb-8">
        {translations.manageBlogs}
      </h1>

      <Toaster />

      {/* Search bar */}
      <div className="relative mb-8">
        <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-dark-grey pointer-events-none"></i>
        <input
          type="search"
          value={searchInput}
          className="input-box pl-12 py-3 pr-12"
          placeholder={translations.searchBlogs || "Search blogs..."}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearch}
        />
        {searchInput && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-grey hover:text-black transition-colors"
          >
            <i className="fi fi-rr-cross-small text-[16px]"></i>
          </button>
        )}
      </div>

      {query && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[13px] text-dark-grey">Results for</span>
          <span className="bg-grey text-black text-[13px] font-medium px-3 py-1 rounded-full">{query}</span>
          <button onClick={handleClear} className="text-[12px] text-dark-grey hover:text-black transition-colors ml-1">Clear</button>
        </div>
      )}

      <InPageNavigation
        routes={[translations.publishedBlogs, translations.drafts, translations.pendingBlogs]}
        defaultActiveIndex={activeTab === "draft" ? 1 : activeTab === "pending" ? 2 : 0}
      >
        {/* Published */}
        <BlogTab
          data={blogs}
          loading={loading.published}
          CardComponent={ManagePublishedBlogCard}
          stateFunc={setBlogs}
          onPageChange={(page) => handlePageChange("published", page)}
        />

        {/* Drafts */}
        <BlogTab
          data={drafts}
          loading={loading.draft}
          CardComponent={ManageDraftBlogPost}
          stateFunc={setDrafts}
          onPageChange={(page) => handlePageChange("draft", page)}
        />

        {/* Pending */}
        <BlogTab
          data={pending}
          loading={loading.pending}
          CardComponent={ManagePublishedBlogCard}
          stateFunc={setPending}
          onPageChange={(page) => handlePageChange("pending", page)}
        />
      </InPageNavigation>
    </div>
  );
};

export default ManageBlogs;
