import { useContext, useEffect, useState, useCallback } from "react";
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

    const { theme, setTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const { userAuth, setUserAuth } = useContext(UserContext);
    const { access_token, profile_img, new_notification_available, language } = userAuth;

    // Lấy bản dịch theo ngôn ngữ hiện tại
    const currentTranslations = getTranslations(language);

    useEffect(() => {
        if (access_token) {
            axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/new-notification`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data }) => {
                    setUserAuth(prev => ({ ...prev, ...data }));
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }, [access_token, setUserAuth]);

    const handleUserNavPanel = () => {
        setUserNavPanel(currentVal => !currentVal);
    };

    const handleSearch = (e) => {
        let query = e.target.value;
        if (e.keyCode === 13 && query.length) {
            navigate(`/search/${query}`);
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            setUserNavPanel(false);
        }, 200);
    };

    const changeTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.body.setAttribute("data-theme", newTheme);
        storeInSession("theme", newTheme);
    };

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
                    <img src={theme === "light" ? darkLogo : lightLogo} className="w-full" alt="Logo" />
                </Link>
                <div className="absolute hidden bg-white left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0">
                    <input 
                        type="search"
                        placeholder={currentTranslations.searchPlaceholder} // Sử dụng bản dịch cho placeholder
                        className="bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
                        onKeyDown={handleSearch}
                    />
                    <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <button className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
                        onClick={() => setSearchBoxVisibility(currentVal => !currentVal)}
                    >
                        <i className="fi fi-rr-search text-xl"></i>
                    </button>

                    <Link to="/editor" className="hidden md:flex gap-2 link">
                        <i className="fi fi-rr-file-edit"></i>
                        <p>{currentTranslations.write}</p> {/* Sử dụng bản dịch cho "Viết" */}
                    </Link>

                    <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10" onClick={changeTheme}>
                        <i className={`fi fi-rr-${theme === "light" ? "moon-stars" : "sun"} text-2xl block mt-1`}></i>
                    </button>

                    {/* Nút thay đổi ngôn ngữ với hình cờ */}
                    <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 flex items-center justify-center" onClick={changeLanguage}>
                        <img 
                            src={language === 'en' ? usFlag : vietnamFlag} // Hiển thị cờ tương ứng
                            alt={language === 'vi' ? "Cờ Mỹ" : "Cờ Việt"} 
                            className="w-6 h-6" // Đặt kích thước hình ảnh là 16x16 pixel (4x4 rem)
                        />
                    </button>

                    {access_token ? (
                        <>
                            <Link to="/dashboard/notifications">
                                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                                    <i className="fi fi-rr-bell text-2xl block mt-1"></i>
                                    {new_notification_available ? <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span> : ""}
                                </button>
                            </Link>

                            <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
                                <button className="w-12 h-12 mt-1">
                                    <img src={profile_img} className="w-full h-full object-cover rounded-full" alt="Profile" />
                                </button>
                                {userNavPanel ? <UserNavigationPanel /> : ""}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link className="btn-dark py-2" to="/signin">
                                {currentTranslations.signIn} {/* Sử dụng bản dịch cho "Đăng Nhập" */}
                            </Link>
                            <Link className="btn-light py-2 hidden md:block" to="/signup">
                                {currentTranslations.signUp} {/* Sử dụng bản dịch cho "Đăng Ký" */}
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <Outlet />
        </>
    );
};

export default Navbar;
