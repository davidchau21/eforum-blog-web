import logo from "@/assets/images/logo.png";
import { CircleUserRound, Search, Bell, Settings, Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Header = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="flex items-center justify-between w-full h-20 px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 font-exo-2">
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate("/")}
      >
        <motion.div
          whileHover={{ rotate: -10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <img src={logo} className="w-10 h-10 object-contain" alt="Logo" />
        </motion.div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-slate-900 leading-none">
            EFOURUM <span className="text-emerald-500">ADMIN</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {t('login.portal_tag')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 focus-within:border-emerald-500/50 focus-within:bg-white transition-all duration-300 group">
          <Search size={18} className="group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder={t('header.search_placeholder')} 
            className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 w-48"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-100 rounded-xl text-slate-600 hover:text-emerald-600 transition-all duration-300 font-bold"
          >
            <Languages size={18} />
            <span className="text-xs uppercase tracking-tighter">{i18n.language === "en" ? "VI" : "EN"}</span>
          </button>

          <button className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all duration-300 relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all duration-300">
            <Settings size={20} />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-2" />

        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-slate-900">{t('header.admin_name')}</span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">{t('header.admin_role')}</span>
          </div>
          <div className="relative">
            <CircleUserRound size={40} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

