import { useCallback, useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import darkLogo from "../imgs/logo-dark.png";
import lightLogo from "../imgs/logo-light.png";
import { ThemeContext, UserContext } from '../App';
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";
import { storeInSession } from "../common/session";
import { getTranslations } from '../../translations'; // Import file translations.js
import vietnamFlag from "../imgs/vietnam-flag.png"; // Nhập hình cờ Việt
import usFlag from "../imgs/us-flag.png"; // Nhập hình cờ Mỹ

const Navbar = () => {

    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
    const [userNavPanel, setUserNavPanel] = useState(false);
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false); // state for mobile menu visibility

    let { theme, setTheme } = useContext(ThemeContext);

    let navigate = useNavigate();

    const { userAuth, userAuth: { access_token, profile_img, new_notification_available, language }, setUserAuth } = useContext(UserContext);

    // Lấy bản dịch theo ngôn ngữ hiện tại
    const currentTranslations = getTranslations(language);

    useEffect(() => {
        if (access_token) {
            axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/new-notification", {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data }) => {
                    setUserAuth({ ...userAuth, ...data })
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }, [access_token]);

    const handleUserNavPanel = () => {
        setUserNavPanel(currentVal => !currentVal);
    }

    const handleSearch = (e) => {
        let query = e.target.value;

        if (e.keyCode == 13 && query.length) {
            navigate(`/search/${query}`);
        }
    }

    const handleBlur = () => {
        setTimeout(() => {
            setUserNavPanel(false);
        }, 200);
    }

    const changeTheme = () => {

        let newTheme = theme == "light" ? "dark" : "light";

        setTheme(newTheme);

        document.body.setAttribute("data-theme", newTheme);

        storeInSession("theme", newTheme);

    }

    const changeLanguage = useCallback(() => {
        const newLanguage = language === 'vi' ? 'en' : 'vi';
        if (newLanguage !== language) { // Kiểm tra xem ngôn ngữ có thực sự thay đổi hay không
            setUserAuth(prev => ({ ...prev, language: newLanguage }));
            storeInSession("language", newLanguage); // Lưu ngôn ngữ vào session
        }
    }, [language, setUserAuth]);

    return (
        <>
            <nav className="navbar z-50">

                <Link to="/" className="flex-none w-10">
                    <img src={theme == "light" ? darkLogo : lightLogo} className="w-full" />
                </Link>

                {/* <button className="flex right-0 items-center justify-center hover:text-emerald-500" onClick={() => setSearchBoxVisibility(prev => !prev)}>
                    <i className="fi fi-rr-search text-xl"></i>
                </button> */}

                <div className={"absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " + (searchBoxVisibility ? "show" : "hide")}>
                    <input
                        type="search"
                        placeholder={currentTranslations.searchPlaceholder}
                        className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
                        onKeyDown={handleSearch}
                    />

                    <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
                </div>

                <div className="flex items-center gap-4 md:gap-6 ml-auto">
                    {/* Search in mobile */}
                    <button className="flex items-center justify-center hover:text-emerald-500 md:hidden" onClick={() => setSearchBoxVisibility(prev => !prev)}>
                        <i className="fi fi-rr-search text-xl"></i>
                    </button>

                    {/* Notification in mobile */}
                    {access_token && (
                        <>
                            <Link to="/dashboard/notifications" className="flex items-center gap-2 text-black hover:text-emerald-500 relative md:hidden">
                                <i className="fi fi-rr-bell text-xl"></i>
                                {new_notification_available && <span className="bg-red w-3 h-3 rounded-full absolute top-0 right-0"></span>}
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu Hamburger Icon */}
                    <button className="w-6 h-6 md:hidden rounded-full flex items-center justify-center hover:text-emerald-500" onClick={() => setMobileMenuVisible(prev => !prev)}>
                        {profile_img ? (
                            <img src={profile_img} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <i className="fi fi-rr-menu-burger text-xl"></i> // Icon menu burger khi không có ảnh
                        )}
                    </button>


                    {/* Mobile Menu - Dropdown (Icons in a row) */}
                    {mobileMenuVisible && (
                        <div className="absolute top-20 right-0 bg-white shadow-lg py-4 md:hidden flex flex-col items-left gap-6 px-4 w-[50vw]">
                            {access_token ? (
                                <div className="relative flex items-center gap-2" onClick={handleUserNavPanel} onBlur={handleBlur}>
                                    <i className="fi fi-rr-user text-xl"></i>
                                    <span>{currentTranslations.profile}</span>
                                    {userNavPanel && (
                                        <UserNavigationPanel className="absolute top-full mt-2 z-10 shadow-lg bg-white w-full md:w-auto" />
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link className="flex items-center gap-2 text-black hover:text-emerald-500" to="/signin">
                                        <i className="fi fi-rr-user text-xl"></i>
                                        <span>{currentTranslations.signIn}</span>
                                    </Link>
                                    <Link className="flex items-center gap-2 text-black hover:text-emerald-500" to="/signup">
                                        <i className="fi fi-rr-user-add text-xl"></i>
                                        <span>{currentTranslations.signUp}</span>
                                    </Link>
                                </>
                            )}
                             <Link to="/editor" className="flex items-center gap-2 text-black hover:text-emerald-500">
                                <i className="fi fi-rr-file-edit"></i>
                                <p>{currentTranslations.write}</p>
                            </Link>
                            <Link to="/search-google" className="flex items-center gap-2 text-black hover:text-emerald-500">
                                <i className="fi fi-rr-book text-xl"></i>
                                <span>{currentTranslations.searchGoogle}</span>
                            </Link>
                            <button className="flex items-center gap-2 text-black hover:text-emerald-500" onClick={changeTheme}>
                                <i className={"fi fi-rr-" + (theme === "light" ? "moon-stars" : "sun") + " text-xl"}></i>
                                <span>{theme === "light" ? currentTranslations.darkMode : currentTranslations.lightMode}</span>
                            </button>
                            {access_token && (
                                <>
                                    <Link to="/chat" className="flex items-center gap-2 text-black hover:text-emerald-500">
                                        <i className="fi fi-rr-messages text-xl"></i>
                                        <span>{currentTranslations.chat}</span>
                                    </Link>
                                </>
                            )}
                            <button className="flex items-center gap-2 text-black hover:text-emerald-500" onClick={changeLanguage}>
                                <img
                                    src={language === 'en' ? usFlag : vietnamFlag}
                                    alt={language === 'vi' ? "Cờ Mỹ" : "Cờ Việt"}
                                    className="w-6 h-6"
                                />
                                <span>{language === 'en' ? "English" : "Tiếng Việt"}</span>
                            </button>
                        </div>
                    )}

                    {/* Desktop-Only Items */}
                    <div className="hidden md:flex items-center gap-3">

                        <Link to="/editor" className="hidden md:flex gap-2 hover:text-emerald-500">
                            <i className="fi fi-rr-file-edit"></i>
                            <p>{currentTranslations.write}</p>
                        </Link>

                        <Link to="/search-google" className="bg-grey w-12 h-12 rounded-full flex items-center justify-center hover:bg-black/10 hover:text-emerald-500">
                            <i className="fi fi-rr-book"></i>
                        </Link>

                        <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 hover:text-emerald-500" onClick={changeTheme}>
                            <i className={"fi fi-rr-" + (theme == "light" ? "moon-stars" : "sun") + " text-2xl block mt-1" }></i>
                        </button>

                        <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 flex items-center justify-center" onClick={changeLanguage}>
                            <img
                                src={language === 'en' ? usFlag : vietnamFlag}
                                alt={language === 'vi' ? "Cờ Mỹ" : "Cờ Việt"}
                                className="w-6 h-6"
                            />
                        </button>

                        {access_token ? (
                            <>
                                <Link to="/chat" className="bg-grey w-12 h-12 rounded-full flex items-center justify-center hover:bg-black/10 hover:text-emerald-500">
                                    <i className="fi fi-rr-messages text-2xl block mt-1 "></i>
                                </Link>
                                <Link to="/dashboard/notifications">
                                    <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 hover:text-emerald-500">
                                        <i className="fi fi-rr-bell text-2xl block mt-1"></i>
                                        {new_notification_available && <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span>}
                                    </button>
                                </Link>
                                <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
                                    <button className="w-12 h-12 mt-1">
                                        <img src={profile_img} className="w-full h-full object-cover rounded-full" />
                                    </button>
                                    {userNavPanel && <UserNavigationPanel />}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link className="btn-dark py-2" to="/signin">{currentTranslations.signIn}</Link>
                                <Link className="btn-light py-2 hidden md:block" to="/signup">{currentTranslations.signUp}</Link>
                            </>
                        )}
                    </div>
                </div>

            </nav>

            <Outlet />
        </>
    );
}

export default Navbar;
