import Header from "@/components/common/header";
import Sidebar from "@/components/common/sidebar";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import userApi from "@/api/userApi";
import { setProfile } from "@/redux/globalSlice";

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getLocalStorage } = useLocalStorage();
  const { loading, profile } = useSelector((state) => state.global);

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

  return (
    <div className="relative w-full">
      <Header />
      <div className="flex items-start w-full">
        <Sidebar />
        <div className="w-full min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] main-content bg-slate-50">
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
