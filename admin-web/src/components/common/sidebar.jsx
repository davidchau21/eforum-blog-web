import { ERole } from "@/enums/staff";
import useLocalStorage from "@/hooks/useLocalStorage";
import { setProfile } from "@/redux/globalSlice";

import clsx from "clsx";
import {
  BadgeDollarSign,
  Blocks,
  Book,
  CircleFadingPlus,
  CupSoda,
  House,
  LandPlot,
  LogOut,
  Menu,
  MessageCircleCode,
  Users,
  Bell,
} from "lucide-react";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import NotificationCard from "../../../../frontend/src/components/notification-card.component";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { removeLocalStorage } = useLocalStorage();
  const { profile } = useSelector((state) => state.global);

  const menus = [
    {
      label: "Trang chủ",
      icon: <House width={24} height={24} />,
      link: "/",
    },
    {
      label: "Người dùng",
      icon: <Users width={24} height={24} />,
      link: "/users",
    },
    {
      label: "Danh mục",
      icon: <Menu width={24} height={24} />,
      link: "/tags",
    },
    {
      label: "Bài đăng",
      icon: <Book width={24} height={24} />,
      link: "/blogs",
    },
    {
      label: "Bình luận",
      icon: <MessageCircleCode width={24} height={24} />,
      link: "/comments",
    },
    {
      label: "Thông báo",
      icon: <Bell width={24} height={24} />,
      link: "/notifications",
    },
    // {
    //   label: "Nguyên liệu",
    //   icon: <Blocks width={24} height={24} />,
    //   link: "/ingredients",
    // },

    // {
    //   label: "Khu vực",
    //   icon: <LandPlot width={24} height={24} />,
    //   link: "/areas",
    // },
    // {
    //   label: "Sản phẩm",
    //   icon: <CupSoda width={24} height={24} />,
    //   link: "/products",
    // },
    // {
    //   label: "Nhập hàng",
    //   icon: <CircleFadingPlus width={24} height={24} />,
    //   link: "/import",
    // },
    // {
    //   label: "Đơn hàng",
    //   icon: <BadgeDollarSign width={24} height={24} />,
    //   link: "/orders",
    // },
  ];

  const onLogout = () => {
    removeLocalStorage();
    navigate("/login");
    dispatch(setProfile(undefined));
  };

  return (
    <div className="bg-gray-1 border-r border-gray-200 w-64 min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] p-5 flex flex-col items-start justify-between">
      <div className="flex flex-col items-start w-full gap-3">
        {menus.map((item, index) => (
          <NavLink
            key={`menu-item-${index}`}
            className={({ isActive }) =>
              clsx(
                "flex items-center w-full h-12 gap-3 px-4 duration-300 rounded-md shadow outline-none",
                {
                  "bg-white text-white-1 hover:bg-[#e9ecef]": !isActive,
                  "bg-emerald-500 text-white": isActive,
                }
              )
            }
            to={item.link}
          >
            {item.icon}
            <span className="text-base font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <button
        onClick={onLogout}
        type="button"
        className="flex items-center w-full h-12 gap-3 px-4 bg-white rounded-md shadow text-emerald-500 hover:bg-[#e9ecef] outline-none duration-300"
      >
        <LogOut width={24} height={24} />
        <span className="text-base font-medium">Đăng xuất</span>
      </button>
    </div>
  );
};

export default Sidebar;
