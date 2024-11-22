import { useEffect, useRef } from "react";

const LoadMoreDataBtn = ({ state, fetchDataFun, additionalParam }) => {
  const observerRef = useRef();

  useEffect(() => {
    if (!state || state.totalDocs <= state.results.length) return;

    const handleObserver = (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        fetchDataFun({ ...additionalParam, page: state.page + 1 });
      }
    };

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1, // Kích hoạt khi phần tử xuất hiện 10% trên màn hình
    });

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [state, fetchDataFun, additionalParam]);

  return (
    <div ref={observerRef} className="flex justify-center mt-8">
      {state && state.totalDocs > state.results.length ? (
        <button
          onClick={() => fetchDataFun({ ...additionalParam, page: state.page + 1 })}
          className="text-dark-grey px-3 text-emerald-500 rounded-md flex items-center gap-2"
        >
          Loading...
        </button>
      ) : (
        <p className="text-dark-grey px-3 text-emerald-500 rounded-md flex items-center gap-2">
            Đã hết bài viết.
        </p>
      )}
    </div>
  );
};

export default LoadMoreDataBtn;
