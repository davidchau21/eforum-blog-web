import logo from "@/assets/images/logo.png";
import { CircleUserRound, Search, Bell, Settings, Languages, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

// eslint-disable-next-line react/prop-types
const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { profile } = useSelector((state) => state.global);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="flex items-center justify-between w-full h-20 px-4 md:px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 font-exo-2">
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger menu */}
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50 lg:hidden cursor-pointer"
          type="button"
          aria-label="Toggle Sidebar"
        >
          <Menu size={22} />
        </button>

        <div
          className="flex items-center gap-2 md:gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <motion.div
            whileHover={{ rotate: -10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src={logo} className="w-8 h-8 md:w-10 md:h-10 object-contain" alt="Logo" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-black tracking-tighter text-slate-900 leading-none">
              EFOURUM <span className="text-emerald-500">ADMIN</span>
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t('login.portal_tag')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 focus-within:border-emerald-500/50 focus-within:bg-white transition-all duration-300 group">
          <Search size={18} className="group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder={t('header.search_placeholder')} 
            className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 w-48"
          />
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-100 rounded-xl text-slate-600 hover:text-emerald-600 transition-all duration-300 font-bold"
          >
            <Languages size={16} />
            <span className="text-[10px] md:text-xs uppercase tracking-tighter">{i18n.language === "en" ? "VI" : "EN"}</span>
          </button>

          <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all duration-300 relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all duration-300">
            <Settings size={18} />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1 md:mx-2" />

        <div 
          className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2 group cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-black text-slate-900">
              {profile?.personal_info?.fullname || t('header.admin_name')}
            </span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
              {profile?.personal_info?.role || t('header.admin_role')}
            </span>
          </div>
          <div className="relative flex-shrink-0">
            {profile?.personal_info?.profile_img ? (
              <img 
                src={profile.personal_info.profile_img} 
                className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-slate-100 group-hover:border-emerald-500 transition-all shadow-sm" 
                alt="Avatar" 
              />
            ) : (
              <CircleUserRound size={36} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
