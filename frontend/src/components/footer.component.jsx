import { Link } from "react-router-dom";
import { useContext } from "react";
import logoDark from "../imgs/logo-dark.png";
import logoLight from "../imgs/logo-light.png";
// import github from "../imgs/github.png";
// import youtube from "../imgs/youtube.png";
// import facebook from "../imgs/facebook.png";
import { UserContext, ThemeContext } from "../App";
import { getTranslations } from "../../translations";

const Footer = () => {
  const { userAuth } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const { language } = userAuth;
  const translations = getTranslations(language);

  return (
    <footer
      className={`py-20 px-6 border-t border-grey/20 ${theme === "light" ? "bg-white" : "bg-dark-grey/5"} transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-16">
        {/* Logo & About Section */}
        <div className="max-w-sm">
          <Link
            to="/"
            className="flex items-center gap-3 mb-8 px-2 transition-transform hover:scale-105 active:scale-95 group"
          >
            <img
              src={theme === "light" ? logoDark : logoLight}
              className="h-10 w-auto object-contain"
              alt="EFORUM Logo"
            />
            <span className="font-outfit font-black text-xl tracking-tighter text-black uppercase dark:text-white">
              {translations.siteName || "EFORUM"}
            </span>
          </Link>
          <p className="text-dark-grey font-medium text-sm leading-relaxed">
            {translations.aboutUsDes ||
              "Nền tảng chia sẻ tri thức và thảo luận hàng đầu dành cho cộng đồng học thuật trẻ."}
          </p>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24">
          <div>
            <h4 className="font-outfit font-black text-black text-[10px] tracking-widest uppercase mb-8 dark:text-white">
              {translations.navigation || "Navigation"}
            </h4>
            <ul className="space-y-4 font-semibold text-dark-grey text-xs">
              <li>
                <Link
                  to="/feed"
                  className="hover:text-emerald-500 transition-colors uppercase"
                >
                  Latest Feed
                </Link>
              </li>
              <li>
                <Link
                  to="/trending"
                  className="hover:text-emerald-500 transition-colors uppercase"
                >
                  Trending
                </Link>
              </li>
              <li>
                <Link
                  to="/chat"
                  className="hover:text-emerald-500 transition-colors uppercase"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-outfit font-black text-black text-[10px] tracking-widest uppercase mb-8 dark:text-white">
              {translations.legal || "Legal"}
            </h4>
            <ul className="space-y-4 font-semibold text-dark-grey text-xs">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-emerald-500 transition-colors uppercase"
                >
                  {translations.privacy}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="hover:text-emerald-500 transition-colors uppercase"
                >
                  {translations.termsOfService}
                </Link>
              </li>
              <li>
                <Link
                  to="/policy"
                  className="hover:text-emerald-500 transition-colors uppercase"
                >
                  {translations.policy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Connect */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-outfit font-black text-black text-[10px] tracking-widest uppercase mb-8 dark:text-white">
              {translations.social || "Connect"}
            </h4>
            <div className="flex gap-4">
              <Link
                to="https://www.facebook.com/"
                className="w-10 h-10 rounded-full bg-grey/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all text-sm"
              >
                <i className="fi fi-brands-facebook pt-1"></i>
              </Link>
              <Link
                to="https://twitter.com/"
                className="w-10 h-10 rounded-full bg-grey/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all text-sm"
              >
                <i className="fi fi-brands-twitter pt-1"></i>
              </Link>
              <Link
                to="https://www.youtube.com/"
                className="w-10 h-10 rounded-full bg-grey/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all text-sm"
              >
                <i className="fi fi-brands-youtube pt-1"></i>
              </Link>
              <Link
                to="https://github.com/davidchau21/edu-blog-web"
                className="w-10 h-10 rounded-full bg-grey/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all text-sm"
              >
                <i className="fi fi-brands-github pt-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-grey/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-dark-grey font-bold text-[9px] tracking-[0.2em] uppercase">
          © 2025 {translations.siteName || "EFORUM"} CORE. MADE WITH ✨
        </p>
        <div className="flex gap-8 text-[9px] font-bold text-dark-grey uppercase tracking-[0.15em]">
          <Link
            to="/contact"
            className="hover:text-emerald-500 transition-colors"
          >
            {translations.contact}
          </Link>
          <Link
            to="/about"
            className="hover:text-emerald-500 transition-colors"
          >
            {translations.more}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
