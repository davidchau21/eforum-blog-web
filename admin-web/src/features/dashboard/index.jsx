import { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js";
import { User2Icon, FileIcon, MessageCircleIcon, CalendarIcon, ThumbsUp, Share2, BookOpen} from "lucide-react";
import reportApi from "../../api/reportApi";

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [totalUser, setTotalUser] = useState(0);
  const [totalBlog, setTotalBlog] = useState(0);
  const [totalComment, setTotalComment] = useState(0);
  const [totalInteraction, setTotalInteraction] = useState(0);
  const [totalLike, setTotalLike] = useState(0);
  const [totalShare, setTotalShare] = useState(0);
  const [totalRead, setTotalRead] = useState(0);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Số lượng người dùng",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
        pointBorderColor: "#fff",
      },
      {
        label: "Số lượng bài viết",
        data: [],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
        pointBorderColor: "#fff",
      },
    ],
  });

  const [interactionData, setInteractionData] = useState({
    labels: [],
    datasets: [
      {
        label: "Lượt thích",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.8)",
      },
      {
        label: "Lượt chia sẻ",
        data: [],
        backgroundColor: "rgba(255, 206, 86, 0.8)",
      },
      {
        label: "Lượt bình luận",
        data: [],
        backgroundColor: "rgba(54, 162, 235, 0.8)",
      },
    ],
  });

  const [pieData, setPieData] = useState({
    labels: ["Lượt thích", "Lượt chia sẻ", "Lượt bình luận"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: [
          "rgba(75, 192, 192, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(54, 162, 235, 0.8)",
        ],
      },
    ],
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    // Lấy số liệu tổng quan
    reportApi.totalUser().then((res) => {
      setTotalUser(res.body.totalUser);
    });
    reportApi.totalBlog().then((res) => {
      setTotalBlog(res.body.totalBlog);
    });
    reportApi.totalComment().then((res) => {
      setTotalComment(res.body.totalComment);
    });

    reportApi.blogStatistic().then((res) => {
      setInteractionData({ ...interactionData, labels: res.body.labels });
    });
    reportApi.getStats().then((res) => {
      setTotalInteraction(res);
      setTotalLike(totalInteraction.body.totalLikes);
      setTotalShare(totalInteraction.body.totalShares);
      setTotalRead(totalInteraction.body.totalReads);
    });

    handleDateChange();
  }, [startDate, endDate]);

  const handleDateChange = () => {
    Promise.all([
      reportApi.userChartByDate(startDate, endDate),
      reportApi.blogStatisticsByDate(startDate, endDate),
      reportApi.weeklyInteractions(),
    ]).then(([userResponse, blogResponse, interactionResponse]) => {
      // Dữ liệu người dùng và bài viết
      const userGrowth = userResponse.body.growthData;
      const blogGrowth = blogResponse.body;

      const labels = userGrowth.map((entry) => entry.date); // Lấy ngày từ userGrowth
      const userData = userGrowth.map((entry) => entry.userCount);
      const blogData = blogGrowth.map((entry) => entry.totalBlogs);

      setChartData((prev) => ({
        ...prev,
        labels,
        datasets: [
          {
            ...prev.datasets[0], // Dữ liệu người dùng
            data: userData,
          },
          {
            ...prev.datasets[1], // Dữ liệu bài viết
            data: blogData,
          },
        ],
      }));

      // Dữ liệu tương tác hàng tuần
      const interactions = interactionResponse.body;

      const interactionLabels = interactions.map((entry) => entry.date);
      const likes = interactions.map((entry) => entry.totalLikes);
      const shares = interactions.map((entry) => entry.totalShares);
      const comments = interactions.map((entry) => entry.totalComments);

      setInteractionData({
        labels: interactionLabels,
        datasets: [
          {
            label: "Lượt thích",
            data: likes,
            backgroundColor: "rgba(75, 192, 192, 0.8)",
          },
          {
            label: "Lượt chia sẻ",
            data: shares,
            backgroundColor: "rgba(255, 206, 86, 0.8)",
          },
          {
            label: "Lượt bình luận",
            data: comments,
            backgroundColor: "rgba(54, 162, 235, 0.8)",
          },
        ],
      });

      const totalInteractions = likes.reduce((a, b) => a + b, 0) + shares.reduce((a, b) => a + b, 0) + comments.reduce((a, b) => a + b, 0);

      setPieData({
        labels: ["Lượt thích", "Lượt chia sẻ", "Lượt bình luận"],
        datasets: [
          {
            data: [
              (likes.reduce((a, b) => a + b, 0) / totalInteractions) * 100,
              (shares.reduce((a, b) => a + b, 0) / totalInteractions) * 100,
              (comments.reduce((a, b) => a + b, 0) / totalInteractions) * 100,
            ],
            backgroundColor: [
              "rgba(75, 192, 192, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(54, 162, 235, 0.8)",
            ],
          },
        ],
      });
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header: Chọn khoảng thời gian */}
      <div className="w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">Chọn khoảng thời gian</h2>
        <div className="flex gap-4 justify-center">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
  
      {/* 6 thẻ và biểu đồ tròn */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6 thẻ: 2 cột, 3 thẻ mỗi cột */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[120px] bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-5 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <User2Icon size={44} color="white" />
            <p className="text-3xl font-bold text-right text-white">{totalUser}</p>
          </div>
          <h1 className="text-xl font-semibold text-right text-white mt-2">Số lượng người dùng</h1>
        </div>

        <div className="h-[120px] bg-gradient-to-r from-teal-400 to-green-500 px-5 py-5 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <FileIcon size={44} color="white" />
            <p className="text-3xl font-bold text-right text-white">{totalBlog}</p>
          </div>
          <h1 className="text-xl font-semibold text-right text-white mt-2">Số lượng bài viết</h1>
        </div>

        <div className="h-[120px] bg-gradient-to-r from-pink-400 to-red-500 px-5 py-5 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <MessageCircleIcon size={44} color="white" />
            <p className="text-3xl font-bold text-right text-white">{totalComment}</p>
          </div>
          <h1 className="text-xl font-semibold text-right text-white mt-2">Số lượng bình luận</h1>
        </div>

        {/* Các thẻ dưới với gradient khác và icon thay đổi */}
        <div className="h-[120px] bg-gradient-to-r from-purple-400 to-pink-500 px-5 py-5 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <ThumbsUp size={44} color="white" /> {/* Đổi icon thành ThumbUpIcon cho "Like" */}
            <p className="text-3xl font-bold text-right text-white">{totalLike}</p>
          </div>
          <h1 className="text-xl font-semibold text-right text-white mt-2">Số lượng like</h1>
        </div>

        <div className="h-[120px] bg-gradient-to-r from-orange-400 to-yellow-500 px-5 py-5 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <Share2 size={44} color="white" /> {/* Đổi icon thành ShareIcon cho "Share" */}
            <p className="text-3xl font-bold text-right text-white">{totalShare}</p>
          </div>
          <h1 className="text-xl font-semibold text-right text-white mt-2">Số lượt chia sẻ</h1>
        </div>

        <div className="h-[120px] bg-gradient-to-r from-indigo-400 to-blue-500 px-5 py-5 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <BookOpen size={44} color="white" /> {/* Đổi icon thành BookIcon cho "Read" */}
            <p className="text-3xl font-bold text-right text-white">{totalRead}</p>
          </div>
          <h1 className="text-xl font-semibold text-right text-white mt-2">Số lượt đọc</h1>
        </div>

        </div>
  
        {/* Biểu đồ tròn */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-center text-2xl font-semibold text-gray-800 mb-4">Thống kê tương tác</h2>
          <div className="flex justify-center items-center">
            {/* Thêm kích thước cụ thể cho biểu đồ */}
            <div className="w-[300px] h-[300px] md:w-[300px] md:h-[300px]">
              <Pie 
                data={pieData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false 
                }} 
              />
            </div>
          </div>
        </div>

      </div>
  
      {/* 2 biểu đồ cột và đường */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Số liệu người dùng và bài viết</h2>
          <Line data={chartData} />
        </div>
        <div className="w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Tương tác hàng tuần</h2>
          <Bar data={interactionData} />
        </div>
      </div>
    </div>
  );
  
};

export default Dashboard;
