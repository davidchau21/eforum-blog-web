import useLocalStorage from "@/hooks/useLocalStorage";
import { setProfile } from "@/redux/globalSlice";

import clsx from "clsx";
import {
  House,
  LogOut,
  Menu,
  MessageCircleCode,
  Users,
  Bell,
  ChevronRight,
  Shield,
  Clock,
  Book,
} from "lucide-react";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useTranslation } from "react-i18next";

// eslint-disable-next-line react/prop-types
const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { removeLocalStorage } = useLocalStorage();
  const { profile } = useSelector((state) => state.global);

  const menus = useMemo(() => {
    const list = [
      {
        label: t('sidebar.dashboard'),
        icon: <House size={20} />,
        link: "/",
      },
      {
        label: t('sidebar.users'),
        icon: <Users size={20} />,
        link: "/users",
        permission: "USER_VIEW",
      },
      {
        label: t('sidebar.categories'),
        icon: <Menu size={20} />,
        link: "/tags",
        permission: "CATEGORY_MANAGE",
      },
      {
        label: t('sidebar.blogs'),
        icon: <Book size={20} />,
        link: "/blogs",
        permission: "BLOG_VIEW",
      },
      {
        label: t('sidebar.comments'),
        icon: <MessageCircleCode size={20} />,
        link: "/comments",
        permission: "COMMENT_VIEW",
      },
      {
        label: t('sidebar.notifications'),
        icon: <Bell size={20} />,
        link: "/notifications",
        permission: "ALERT_PUBLISH",
      },
      {
        label: t('sidebar.roles', "Phân quyền"),
        icon: <Shield size={20} />,
        link: "/roles",
        permission: "ROLE_MANAGE",
      },
      {
        label: t('sidebar.logs', "Nhật ký hệ thống"),
        icon: <Clock size={20} />,
        link: "/logs",
        permission: "ROLE_MANAGE",
      },
    ];

    // Filter menus based on user permissions
    return list.filter(item => {
      // Dashboard does not require permission
      if (!item.permission) return true;
      if (!profile) return false;
      // Super Admin bypasses all checks
      if (profile.role_id?.role_name === "Super Admin") return true;
      // Check if user's role has the required permission code
      return profile.role_id?.permissions?.some(
        (p) => p.permission_code === item.permission
      );
    });
  }, [profile, t]);

  const onLogout = () => {
    removeLocalStorage();
    navigate("/login");
    dispatch(setProfile(undefined));
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <div
        className={clsx(
          "bg-white border-r border-slate-200 w-72 p-6 flex flex-col justify-between font-exo-2 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 z-50 overflow-y-auto",
          "lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] lg:translate-x-0 lg:flex lg:flex-shrink-0", // Desktop settings
          "fixed top-20 bottom-0 left-0 h-[calc(100vh-80px)]", // Mobile settings
          {
            "translate-x-0": isOpen,
            "-translate-x-full lg:translate-x-0": !isOpen,
          }
        )}
      >
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

        <div className="w-full pt-6 border-t border-slate-100 mt-6">
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
    </>
  );
};

export default Sidebar;
