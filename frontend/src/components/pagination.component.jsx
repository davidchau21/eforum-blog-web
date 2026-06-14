/* eslint-disable react/prop-types */
const Pagination = ({ currentPage, totalDocs, limit, onChange }) => {
  const totalPages = Math.ceil(totalDocs / limit);
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      if (start === 1) {
        end = maxVisiblePages;
      } else if (end === totalPages) {
        start = totalPages - maxVisiblePages + 1;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-10 select-none">
      {/* Previous Button */}
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-grey/80 dark:border-zinc-800/80 flex items-center justify-center text-dark-grey hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-zinc-900 disabled:hover:text-dark-grey cursor-pointer disabled:cursor-not-allowed"
      >
        <i className="fi fi-rr-angle-small-left text-lg mt-0.5"></i>
      </button>
      
      {/* Page Numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
            p === currentPage
              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "bg-white dark:bg-zinc-900 border-grey/80 dark:border-zinc-800/80 text-dark-grey hover:bg-indigo-600/10 hover:text-indigo-600"
          }`}
        >
          {p}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-grey/80 dark:border-zinc-800/80 flex items-center justify-center text-dark-grey hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-zinc-900 disabled:hover:text-dark-grey cursor-pointer disabled:cursor-not-allowed"
      >
        <i className="fi fi-rr-angle-small-right text-lg mt-0.5"></i>
      </button>
    </div>
  );
};

export default Pagination;
