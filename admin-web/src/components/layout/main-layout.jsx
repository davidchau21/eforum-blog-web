import Header from "@/components/common/header";
import Sidebar from "@/components/common/sidebar";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import userApi from "@/api/userApi";
import { setProfile } from "@/redux/globalSlice";

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { getLocalStorage } = useLocalStorage();
  const { loading, profile } = useSelector((state) => state.global);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const accessToken = getLocalStorage();
    if (!accessToken) {
      navigate("/login");
    } else if (!profile) {
      userApi.getMyProfile().then((res) => {
        if (res.ok && res.body) {
          dispatch(setProfile(res.body));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getLocalStorage, profile]);

  // Auto-close sidebar on mobile when navigating pages
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-x-hidden">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex items-start w-full relative flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content Area */}
        <div className="flex-1 w-full min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] overflow-y-auto main-content bg-slate-50">
          <Outlet />
        </div>
      </div>

      {!!loading && (
        <div className="fixed inset-0 flex items-center justify-center w-full h-full bg-black/60 z-[9999] opacity-60">
          <Loader className="text-white animate-spin" size={52} />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
