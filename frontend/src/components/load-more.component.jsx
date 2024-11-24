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
