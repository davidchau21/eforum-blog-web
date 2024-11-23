import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from "chart.js";
import { User2Icon, FileIcon, MessageCircleIcon } from "lucide-react";
import reportApi from "../../api/reportApi";

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [totalUser, setTotalUser] = useState(0);
  const [totalBlog, setTotalBlog] = useState(0);
  const [totalComment, setTotalComment] = useState(0);

  useEffect(() => {
    reportApi.totalUser().then((res) => {
      setTotalUser(res.body.totalUser);
    });
    reportApi.totalBlog().then((res) => {
      setTotalBlog(res.body.totalBlog);
    });
    reportApi.totalComment().then((res) => {
      setTotalComment(res.body.totalComment);
    });
  }, []);

  // Dữ liệu cho biểu đồ cột "Monthly Active Users"
  const activeUsersData = {
    // labels: ["January", "February", "March", "April", "May", "June", "July"],
    labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
    datasets: [
      {
        label: "Người",
        data: [10, 20, 15, 40, 30, 45, 25],
        backgroundColor: "rgba(0, 123, 255, 0.6)", // Màu xanh cho cột
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ cột "Revenue"
  const revenueData = {
    // labels: ["January", "February", "March", "April", "May", "June", "July"],
    labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
    datasets: [
      {
        label: "Bài viết",
        data: [15, 25, 35, 45, 55, 65, 75],
        backgroundColor: "#FF6384",
      },
      {
        label: "Lượt thích",
        data: [10, 20, 30, 40, 50, 60, 70],
        backgroundColor: "#36A2EB",
      },
    ],
  };

  return (
    <div className="p-6 flex flex-wrap gap-6 justify-between">
      {/* Các thẻ thống kê */}
      {/* <div className="w-full flex flex-col md:flex-row flex-wrap items-start  p-5 gap-y-5 justify-between"> */}
      <div className="w-[100%] md:w-[30%] h-[100px] bg-cyan-400 px-5 py-5 rounded-lg  ">
        <div className="flex items-center justify-between">
          <User2Icon size={44} color="white" />
          <p className="text-2xl font-semibold text-right text-white">
            {totalUser}
          </p>
        </div>
        <h1 className="text-l font-semibold text-right text-white">
          Số lượng người dùng
        </h1>
      </div>
      <div className="w-[100%] md:w-[30%] h-[100px] bg-teal-400 px-5 py-5 rounded-lg ">
        <div className="flex items-center justify-between">
          <FileIcon size={44} color="white" />
          <p className="text-2xl font-semibold text-right text-white">
            {totalBlog}
          </p>
        </div>
        <h1 className="text-l font-semibold text-right text-white">
          Số lượng bài viết
        </h1>
      </div>
      <div className="w-[100%] md:w-[30%] h-[100px] bg-pink-400 px-5 py-5 rounded-lg ">
        <div className="flex items-center justify-between">
          <MessageCircleIcon size={44} color="white" />
          <p className="text-2xl font-semibold text-right text-white">
            {totalComment}
          </p>
        </div>
        <h1 className="text-l font-semibold text-right text-white">
          Số lượng bình luận
        </h1>
      </div>

    

      {/* Biểu đồ Monthly Active Users */}
      <div className="card w-full md:w-[48%] bg-white px-5 py-5 rounded-lg mt-28">
        <div className="card-body">
          <h2 className="text-2xl font-semibold">Lượng người dùng hằng ngày</h2>
          <Line data={activeUsersData} />
        </div>
      </div>

      {/* Biểu đồ Revenue */}
      <div className="card w-full md:w-[48%] bg-white px-5 py-5 rounded-lg mt-28">
        <div className="card-body">
          <h2 className="text-2xl font-semibold">Tương tác bài viết hằng ngày</h2>
          <Bar data={revenueData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
