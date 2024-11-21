import Header from "@/components/common/header";
import Sidebar from "@/components/common/sidebar";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";

const MainLayout = () => {
  const navigate = useNavigate();
  const { getLocalStorage } = useLocalStorage();
  const { loading } = useSelector((state) => state.global);

  useEffect(() => {
    const accessToken = getLocalStorage();
    if (!accessToken) {
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getLocalStorage]);

  return (
    <div className="relative w-full">
      <Header />
      <div className="flex items-start w-full">
        <Sidebar />
        <div className="w-full min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] main-content bg-[#e9ecef]">
          <Outlet />
        </div>
      </div>

      {!!loading && (
        <div className="absolute top-0 left-0 flex items-center justify-center w-full h-screen bg-black z-1000 opacity-60">
          <Loader className="text-white animate-spin" size={52} />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
