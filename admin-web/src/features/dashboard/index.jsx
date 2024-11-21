import { useEffect, useState } from "react";
import reportApi from "../../api/reportApi";
import { FileIcon, MessageCircleIcon, User2, User2Icon } from "lucide-react";

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
  return (
    <div className="w-full flex flex-col md:flex-row flex-wrap items-start  p-5 gap-y-5 justify-between">
      <div className="w-[100%] md:w-[48%] h-[100px] bg-cyan-400 px-5 py-5 rounded-lg  ">
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
      <div className="w-[100%] md:w-[48%] h-[100px] bg-teal-400 px-5 py-5 rounded-lg ">
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
      <div className="w-[100%] md:w-[48%] h-[100px] bg-pink-400 px-5 py-5 rounded-lg ">
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
    </div>
  );
};

export default Dashboard;
