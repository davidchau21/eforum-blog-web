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
  ChevronRight,
} from "lucide-react";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { removeLocalStorage } = useLocalStorage();
  const { profile } = useSelector((state) => state.global);

  const menus = [
    {
      label: t('sidebar.dashboard'),
      icon: <House size={20} />,
      link: "/",
    },
    {
      label: t('sidebar.users'),
      icon: <Users size={20} />,
      link: "/users",
    },
    {
      label: t('sidebar.categories'),
      icon: <Menu size={20} />,
      link: "/tags",
    },
    {
      label: t('sidebar.blogs'),
      icon: <Book size={20} />,
      link: "/blogs",
    },
    {
      label: t('sidebar.comments'),
      icon: <MessageCircleCode size={20} />,
      link: "/comments",
    },
    {
      label: t('sidebar.notifications'),
      icon: <Bell size={20} />,
      link: "/notifications",
    },
  ];

  const onLogout = () => {
    removeLocalStorage();
    navigate("/login");
    dispatch(setProfile(undefined));
  };

  return (
    <div className="bg-white border-r border-slate-200 w-72 min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] p-6 flex flex-col items-start justify-between font-exo-2 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col items-start w-full gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-4">
          {t('sidebar.menu_title')}
        </p>
        {menus.map((item, index) => (
          <NavLink
            key={`menu-item-${index}`}
            className={({ isActive }) =>
              clsx(
                "group flex items-center justify-between w-full h-12 px-4 duration-300 rounded-2xl outline-none transition-all",
                {
                  "text-slate-500 hover:bg-slate-50 hover:text-slate-900": !isActive,
                  "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20": isActive,
                }
              )
            }
            to={item.link}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <span className={clsx("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <ChevronRight size={14} />
                  </motion.div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="w-full pt-6 border-t border-slate-100">
        <button
          onClick={onLogout}
          type="button"
          className="flex items-center w-full h-12 gap-3 px-4 text-slate-500 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-bold">{t('sidebar.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

