// import { useEffect, useRef } from "react";

// const LoadMoreDataBtn = ({ state, fetchDataFun, additionalParam }) => {
//   const observerRef = useRef();

//   useEffect(() => {
//     if (!state || state.totalDocs <= state.results.length) return;

//     const handleObserver = (entries) => {
//       const target = entries[0];
//       if (target.isIntersecting) {
//         fetchDataFun({ ...additionalParam, page: state.page + 1 });
//       }
//     };

//     const observer = new IntersectionObserver(handleObserver, {
//       root: null,
//       rootMargin: "0px",
//       threshold: 0.1, // Trigger when 10% of the element is visible
//     });

//     if (observerRef.current) observer.observe(observerRef.current);

//     return () => observer.disconnect();
//   }, [state, fetchDataFun, additionalParam]);

//   return (
//     <div ref={observerRef} className="flex justify-center mt-8">
//       {state && state.totalDocs > state.results.length ? (
//         <button
//           onClick={() => fetchDataFun({ ...additionalParam, page: state.page + 1 })}
//           className="text-dark-grey px-3 rounded-md flex items-center gap-2"
//         >
//           Loading...
//         </button>
//       ) : (
//         <p className="text-gray-500">All loaded</p> // Show when all data is loaded
//       )}
//     </div>
//   );
// };

// export default LoadMoreDataBtn;

import { useEffect } from 'react';

const LoadMoreDataBtn = ({ state, fetchDataFun, additionalParam }) => {
  useEffect(() => {
    // Hàm kiểm tra nếu người dùng đã cuộn gần đến cuối trang
    const handleScroll = () => {
      // Kiểm tra nếu đã cuộn gần tới cuối
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200 // 200px là khoảng cách cách cuối trang
      ) {
        // Kiểm tra nếu chưa tải hết dữ liệu
        if (state != null && state.totalDocs > state.results.length) {
          fetchDataFun({ ...additionalParam, page: state.page + 1 });
        }
      }
    };

    // Thêm sự kiện cuộn khi component mount
    window.addEventListener('scroll', handleScroll);

    // Dọn dẹp sự kiện khi component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [state, fetchDataFun, additionalParam]);

  return null; // Không cần hiển thị button "Load More" nữa
};

export default LoadMoreDataBtn;
