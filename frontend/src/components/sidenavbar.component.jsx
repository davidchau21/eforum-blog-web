import { useContext, useEffect, useRef, useState } from "react";
import { Outlet, Navigate, NavLink } from "react-router-dom";
import { UserContext } from "../App";
import { getTranslations } from "../../translations";

const SideNav = () => {
  let {
    userAuth: { access_token, new_notification_available, language },
  } = useContext(UserContext);

  let page = location.pathname.split("/")[2];
  let [pageState, setPageState] = useState(page ? page.replace("-", " ") : "");
  let [showSideNav, setShowSideNav] = useState(false);

  let activeTabLine = useRef();
  let sideBarIconTab = useRef();
  let pageStateTab = useRef();

  const translations = getTranslations(language);

  const changePageState = (e) => {
    let { offsetWidth, offsetLeft } = e.target;

    activeTabLine.current.style.width = offsetWidth + "px";
    activeTabLine.current.style.left = offsetLeft + "px";

    if (e.target == sideBarIconTab.current) {
      setShowSideNav(true);
    } else {
      setShowSideNav(false);
    }
  };

  useEffect(() => {
    setShowSideNav(false);
    if (pageStateTab.current) {
        pageStateTab.current.click();
    }
  }, [pageState]);

  return access_token === null ? (
    <Navigate to="/signin" />
  ) : (
    <>
      <section className="relative flex gap-10 py-0 m-0 max-md:flex-col min-h-screen bg-white">
        <div className="sticky top-[80px] z-30 flex-shrink-0">
          <div className="md:hidden bg-white/80 backdrop-blur-xl py-2 border-b border-grey flex flex-nowrap overflow-x-auto scrollbar-hide px-4">
            <button
              ref={sideBarIconTab}
              className="p-4 capitalize text-black font-bold flex items-center gap-2"
              onClick={changePageState}
            >
              <i className="fi fi-rr-menu-burger pointer-events-none"></i>
            </button>
            <button
              ref={pageStateTab}
              className="p-4 capitalize text-black font-bold"
              onClick={changePageState}
            >
              {pageState}
            </button>
            <hr
              ref={activeTabLine}
              className="absolute bottom-0 h-1 bg-purple rounded-t-full duration-500"
            />
          </div>

          <div
            className={
              "min-w-[280px] h-[calc(100vh-80px)] md:sticky top-[80px] overflow-y-auto py-8 pl-8 pr-6 md:border-grey md:border-r absolute max-md:top-[64px] bg-white/95 backdrop-blur-2xl max-md:w-full max-md:px-8 max-md:z-50 duration-500 scrollbar-hide " +
              (!showSideNav
                ? "max-md:opacity-0 max-md:pointer-events-none -translate-x-full md:translate-x-0"
                : "opacity-100 pointer-events-auto translate-x-0")
            }
          >
            <div className="mb-10">
              <h1 className="text-[11px] font-bold text-dark-grey uppercase tracking-[0.2em] mb-4 px-4">
                Dashboard
              </h1>

              <div className="space-y-1">
                <NavLink
                  to="/dashboard/blogs"
                  onClick={(e) => setPageState(e.target.innerText)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${isActive ? "bg-black text-white shadow-lg shadow-black/10" : "text-dark-grey hover:bg-grey/50 hover:text-black"}`}
                >
                  <i className="fi fi-rr-document text-[16px]"></i>
                  {translations.blogs}
                </NavLink>

                <NavLink
                  to="/dashboard/notifications"
                  onClick={(e) => setPageState(e.target.innerText)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${isActive ? "bg-black text-white shadow-lg shadow-black/10" : "text-dark-grey hover:bg-grey/50 hover:text-black"}`}
                >
                  <div className="relative">
                    <i className="fi fi-rr-bell text-[16px]"></i>
                    {new_notification_available > 0 ? (
                      <span className="bg-rose-500 w-4 h-4 rounded-full absolute -top-1.5 -right-2 flex items-center justify-center text-white text-[9px] font-bold border-2 border-white dark:border-black">
                        {new_notification_available > 99
                          ? "99+"
                          : new_notification_available}
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                  {translations.notifications}
                </NavLink>

                <NavLink
                  to="/editor"
                  onClick={(e) => setPageState(e.target.innerText)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${isActive ? "bg-black text-white shadow-lg shadow-black/10" : "text-dark-grey hover:bg-grey/50 hover:text-black"}`}
                >
                  <i className="fi fi-rr-file-edit text-[16px]"></i>
                  {translations.write}
                </NavLink>
              </div>
            </div>

            <div>
              <h1 className="text-[11px] font-bold text-dark-grey uppercase tracking-[0.2em] mb-4 px-4">
                Settings
              </h1>

              <div className="space-y-1">
                <NavLink
                  to="/settings/edit-profile"
                  onClick={(e) => setPageState(e.target.innerText)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${isActive ? "bg-black text-white shadow-lg shadow-black/10" : "text-dark-grey hover:bg-grey/50 hover:text-black"}`}
                >
                  <i className="fi fi-rr-user text-[16px]"></i>
                  {translations.editProfile}
                </NavLink>

                <NavLink
                  to="/settings/change-password"
                  onClick={(e) => setPageState(e.target.innerText)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${isActive ? "bg-black text-white shadow-lg shadow-black/10" : "text-dark-grey hover:bg-grey/50 hover:text-black"}`}
                >
                  <i className="fi fi-rr-lock text-[16px]"></i>
                  {translations.changePassword}
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-md:-mt-8 py-8 md:py-12 px-4 md:px-10 overflow-hidden relative">
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default SideNav;
