/* eslint-disable no-unused-vars */
import { useCallback, useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import darkLogo from "../imgs/logo-dark.png";
import lightLogo from "../imgs/logo-light.png";
import { ThemeContext, UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";
import { storeInSession } from "../common/session";
import { getTranslations } from "../../translations"; // Import file translations.js
import vietnamFlag from "../imgs/vietnam-flag.png"; // Nhập hình cờ Việt
import usFlag from "../imgs/us-flag.png"; // Nhập hình cờ Mỹ
import { AnimatePresence } from "framer-motion";
import NotificationPanel from "./notification-panel.component";
import { useRef } from "react";

const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);
  const [notifPanel, setNotifPanel] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false); // state for mobile menu visibility

  const notifRef = useRef(null);
  const userNavRef = useRef(null);
  const handleMenuClose = () => {
    setMobileMenuVisible(false);
  };
  const toggleUserNavPanel = () => {
    setUserNavPanel((prevState) => {
      const newState = !prevState;
      if (!newState) {
        // Nếu đóng Profile menu thì đóng luôn menu chính
        setMobileMenuVisible(false);
      }
      return newState;
    });
  };
  let { theme, setTheme } = useContext(ThemeContext);

  let navigate = useNavigate();

  const {
    userAuth,
    userAuth: {
      access_token,
      profile_img,
      new_notification_available,
      unread_messages,
      language,
    },
    setUserAuth,
  } = useContext(UserContext);

  // Lấy bản dịch theo ngôn ngữ hiện tại
  const currentTranslations = getTranslations(language);

  useEffect(() => {
    if (access_token) {
      axios
        .get(import.meta.env.VITE_SERVER_DOMAIN + "/notifications/new", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then(({ data }) => {
          setUserAuth((prev) => ({ ...prev, ...data }));
        })
        .catch((err) => {
          console.log(err);
        });

      axios
        .get(import.meta.env.VITE_SERVER_DOMAIN + "/message/new-messages", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then(({ data }) => {
          setUserAuth((prev) => ({ ...prev, ...data }));
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);

  // Click Outside logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      // User Nav Panel
      if (userNavRef.current && !userNavRef.current.contains(event.target)) {
        setUserNavPanel(false);
      }
      // Notification Panel
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserNavPanel = () => {
    setUserNavPanel((currentVal) => !currentVal);
  };

  const handleSearch = (e) => {
    let query = e.target.value;

    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };

  const handleBlur = () => {
    // Replaced by Click Outside logic for more reliability
  };

  const changeTheme = () => {
    let newTheme = theme == "light" ? "dark" : "light";

    setTheme(newTheme);

    document.body.setAttribute("data-theme", newTheme);

    storeInSession("theme", newTheme);
  };

  const changeLanguage = useCallback(() => {
    const newLanguage = language === "vi" ? "en" : "vi";
    if (newLanguage !== language) {
      // Kiểm tra xem ngôn ngữ có thực sự thay đổi hay không
      setUserAuth((prev) => ({ ...prev, language: newLanguage }));
      storeInSession("language", newLanguage); // Lưu ngôn ngữ vào session
    }
  }, [language, setUserAuth]);

  const location = useLocation();

  const handleExploreClick = (e) => {
    if (location.pathname === "/feed") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-[#09090B] w-full h-[80px] flex items-center justify-between px-4 lg:px-8 border-b border-slate-200 dark:border-white/5 sticky top-0 z-50 transition-colors duration-300">
        {/* Left Section: Logo & Search */}
        <div className="flex items-center gap-6 lg:gap-10">
          <Link
            to="/feed"
            onClick={handleExploreClick}
            className="flex items-center"
          >
            <img
              src={theme == "light" ? darkLogo : lightLogo}
              className="h-9 w-auto object-contain"
              alt="EduBlog Logo"
            />
          </Link>

          <div className="hidden md:flex items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-4 py-2.5 w-64 lg:w-[400px] group focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-500/20 focus-within:border-indigo-300 dark:focus-within:border-indigo-500/40 transition-all">
            <i className="fi fi-rr-search text-slate-400 text-sm"></i>
            <input
              type="search"
              placeholder="Search ⌘K"
              className="bg-transparent border-none outline-none w-full ml-3 text-sm placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        {/* Center Section: Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 h-full">
          <Link
            to="/feed"
            onClick={handleExploreClick}
            className={`h-full flex items-center border-b-2 font-semibold text-sm px-1 transition-all ${location.pathname === "/feed" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
          >
            Explore
          </Link>
          <Link
            to="/trending"
            className={`h-full flex items-center border-b-2 font-semibold text-sm px-1 transition-all ${location.pathname === "/trending" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
          >
            Trending
          </Link>
          <Link
            to="/search-google"
            className={`h-full flex items-center border-b-2 font-semibold text-sm px-1 transition-all gap-2 ${location.pathname === "/search-google" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
          >
            Academic Search
            <span className="bg-indigo-100 text-indigo-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter border border-indigo-200">
              New
            </span>
          </Link>
          <Link
            to="/feed"
            onClick={handleExploreClick}
            className="h-full flex items-center text-slate-500 hover:text-slate-900 font-medium text-sm px-1 transition-colors"
          >
            Directory
          </Link>
        </div>

        {/* <button className="flex right-0 items-center justify-center hover:text-emerald-500" onClick={() => setSearchBoxVisibility(prev => !prev)}>
                    <i className="fi fi-rr-search text-xl"></i>
                </button> */}

        <div className="flex items-center gap-4 md:gap-6 ml-auto">
          {/* Search in mobile */}
          <button
            className="flex items-center justify-center hover:text-emerald-500 md:hidden"
            onClick={() => setSearchBoxVisibility((prev) => !prev)}
          >
            <i className="fi fi-rr-search text-black text-3xl"></i>
          </button>

          {/* Notification in mobile */}
          {access_token && (
            <>
              <Link
                to="/dashboard/notifications"
                className="flex items-center gap-2 text-black hover:text-emerald-500 relative md:hidden"
              >
                <i className="fi fi-rr-bell text-3xl"></i>
                {new_notification_available > 0 && (
                  <span className="bg-red w-5 h-5 rounded-full absolute top-0 -right-2 flex items-center justify-center text-white text-[10px] font-bold">
                    {new_notification_available > 99
                      ? "99+"
                      : new_notification_available}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* Mobile Menu Hamburger Icon */}
          <button
            className="w-10 h-10 md:hidden rounded-full flex items-center justify-center hover:text-emerald-500"
            onClick={() => setMobileMenuVisible((prev) => !prev)}
          >
            {profile_img ? (
              <img
                src={profile_img}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <i className="fi fi-rr-menu-burger text-3xl"></i> // Icon menu burger khi không có ảnh
            )}
          </button>

          {/* Mobile Menu - Dropdown (Icons in a row) */}
          {mobileMenuVisible && (
            <div className="absolute top-20 right-0 bg-white shadow-lg py-4 md:hidden flex flex-col items-left gap-6 px-4 w-[50vw]">
              {access_token ? (
                <div
                  className="relative flex items-center gap-2 text-black"
                  onClick={toggleUserNavPanel} // Đổi tên hàm ở đây
                  onBlur={handleMenuClose} // Khi mất focus, menu sẽ đóng
                >
                  <i className="fi fi-rr-user text-xl"></i>
                  <span>{currentTranslations.profile}</span>
                  {userNavPanel && (
                    <UserNavigationPanel className="absolute top-full mt-2 z-10 shadow-lg bg-white w-full md:w-auto" />
                  )}
                </div>
              ) : (
                <>
                  <Link
                    className="flex items-center gap-2 text-black hover:text-emerald-500"
                    to="/signin"
                    onClick={handleMenuClose}
                  >
                    <i className="fi fi-rr-user text-xl"></i>
                    <span>{currentTranslations.signIn}</span>
                  </Link>
                  <Link
                    className="flex items-center gap-2 text-black hover:text-emerald-500"
                    to="/signup"
                    onClick={handleMenuClose}
                  >
                    <i className="fi fi-rr-user-add text-xl"></i>
                    <span>{currentTranslations.signUp}</span>
                  </Link>
                </>
              )}
              <Link
                to="/search-google"
                className="flex items-center gap-2 text-black hover:text-emerald-500"
                onClick={handleMenuClose}
              >
                <i className="fi fi-rr-search-alt text-xl"></i>
                <span>Academic Search</span>
              </Link>
              <button
                className="flex items-center gap-2 text-black hover:text-emerald-500"
                onClick={() => {
                  changeTheme();
                  handleMenuClose();
                }}
              >
                <i
                  className={
                    "fi fi-rr-" +
                    (theme === "light" ? "moon-stars" : "sun") +
                    " text-xl"
                  }
                ></i>
                <span>
                  {theme === "light"
                    ? currentTranslations.darkMode
                    : currentTranslations.lightMode}
                </span>
              </button>
              {access_token && (
                <>
                  <Link
                    to="/chat"
                    className="flex items-center gap-2 text-black hover:text-emerald-500 relative"
                    onClick={handleMenuClose}
                  >
                    <i className="fi fi-rr-messages text-xl"></i>
                    <span>{currentTranslations.chat}</span>
                    {unread_messages > 0 && (
                      <span className="bg-red w-5 h-5 rounded-full absolute top-0 -right-2 flex items-center justify-center text-white text-[10px] font-bold">
                        {unread_messages > 99 ? "99+" : unread_messages}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <button
                className="flex items-center gap-2 text-black hover:text-emerald-500"
                onClick={() => {
                  changeLanguage();
                  handleMenuClose();
                }}
              >
                <img
                  src={language === "en" ? usFlag : vietnamFlag}
                  alt={language === "vi" ? "Cờ Mỹ" : "Cờ Việt"}
                  className="w-6 h-6"
                />
                <span>{language === "en" ? "English" : "Tiếng Việt"}</span>
              </button>
            </div>
          )}

          {/* Desktop-Only Items */}
          <div className="hidden md:flex items-center gap-2">
            {access_token && (
              <Link
                to="/editor"
                className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors mr-2"
              >
                Write a Post
              </Link>
            )}

            <button
              className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
              onClick={changeTheme}
            >
              <i
                className={
                  "fi fi-rr-" +
                  (theme == "light" ? "moon-stars" : "sun") +
                  " text-lg mt-1"
                }
              ></i>
            </button>

            <button
              className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors mr-2"
              onClick={changeLanguage}
            >
              <img
                src={language === "en" ? usFlag : vietnamFlag}
                alt={language === "vi" ? "Cờ Mỹ" : "Cờ Việt"}
                className="w-5 h-5 rounded-full object-cover"
              />
            </button>

            {access_token ? (
              <div className="flex items-center gap-1">
                <div className="relative" ref={notifRef}>
                  <button
                    className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
                    onClick={() => setNotifPanel((prev) => !prev)}
                  >
                    <i className="fi fi-rr-bell text-xl mt-1"></i>
                    {new_notification_available > 0 && (
                      <span className="bg-rose-500 w-4 h-4 rounded-full absolute top-1.5 right-1.5 flex items-center justify-center text-white text-[9px] font-bold border border-white">
                        {new_notification_available > 99
                          ? "99+"
                          : new_notification_available}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifPanel && (
                      <NotificationPanel
                        closePanel={() => setNotifPanel(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to="/chat"
                  className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors relative"
                >
                  <i className="fi fi-rr-comment-alt text-xl mt-1"></i>
                  {unread_messages > 0 && (
                    <span className="bg-rose-500 w-4 h-4 rounded-full absolute top-1.5 right-1.5 flex items-center justify-center text-white text-[9px] font-bold border border-white">
                      {unread_messages > 99 ? "99+" : unread_messages}
                    </span>
                  )}
                </Link>

                <div
                  className="relative ml-2"
                  onClick={handleUserNavPanel}
                  ref={userNavRef}
                >
                  <button className="w-9 h-9 rounded-full ring-2 ring-transparent hover:ring-indigo-100 transition-all focus:outline-none focus:ring-indigo-200 cursor-pointer">
                    <img
                      src={profile_img}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </button>

                  {userNavPanel ? <UserNavigationPanel /> : ""}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  to="/signin"
                >
                  {currentTranslations.signIn}
                </Link>
                <Link
                  className="px-5 py-2 text-sm font-medium bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors hidden md:block"
                  to="/signup"
                >
                  {currentTranslations.signUp}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
