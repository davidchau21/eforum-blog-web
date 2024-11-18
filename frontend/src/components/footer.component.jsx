import { Link } from "react-router-dom";
import { useContext } from "react";
import darkLogo from "../imgs/logo-dark.png";
import lightLogo from "../imgs/logo-light.png";
import github from "../imgs/github.png";
import youtube from "../imgs/youtube.png";
import facebook from "../imgs/facebook.png";
import { UserContext, ThemeContext } from '../App';
import { getTranslations } from '../../translations';

const Footer = () => {
    const { userAuth } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
    const { language } = userAuth;
    const translations = getTranslations(language);

    return (
        <footer className={`p-5 mt-10 ${theme === "light" ? "bg-gray-200" : "bg-gray-800"} flex-shrink-0`}>
            <div className="p-5 mx-auto flex flex-col md:flex-row gap-10 max-w-7xl">
                {/* Logo Section */}
                <div className="flex justify-center md:justify-start">
                    <Link to="/" className="flex items-center">
                        <img src={theme === "light" ? darkLogo : lightLogo} className="w-[70px] h-[70px]" alt="Logo" />
                    </Link>
                </div>
                {/* About Us Section */}
                <div className="text-center md:text-left">
                    <p className="text-xl font-bold mt-2">{translations.aboutUs}</p>
                    <p className="text-xs mt-2 max-w-xs mx-auto md:mx-0">{translations.aboutUsDes}</p>
                </div>
                {/* Contact Section */}
                <div className="text-center md:text-left">
                    <p className="text-xl font-bold mt-2">{translations.contact}</p>
                    <p className="text-xs mt-2">
                        <span>
                            contact@eforum.com - 
                            <span className="mx-2">
                                <Link to="/contact" className="hover:underline">{translations.more}</Link>
                            </span>
                        </span>
                    </p>
                </div>
                
                {/* Legal Section */}
                <div className="text-center md:text-left">
                    <p className="text-xl font-bold mt-2">{translations.legal}</p>
                    <p className="text-xs mt-2">
                        <Link to="/terms-of-service" className="hover:underline">{translations.termsOfService}</Link>
                    </p>
                    <p className="text-xs mt-2">
                        <Link to="/privacy" className="hover:underline">{translations.privacy}</Link>
                    </p>
                    <p className="text-xs mt-2">
                        <Link to="/policy" className="hover:underline">{translations.policy}</Link>
                    </p>
                </div>

                {/* Social Links Section */}
                <div className="text-center md:text-left">
                    <p className="text-xl font-bold mt-2">{translations.social}</p>
                    <div className="flex flex-col items-center md:items-start space-y-4 mt-2">
                    <p className="text-xs">
                        <Link to="https://www.youtube.com/" className="flex items-center gap-x-2 hover:opacity-50">
                            <img src={youtube} className="w-8 h-8" alt="Logo" />
                            Youtube
                        </Link>
                    </p>
                    <p className="text-xs">
                        <Link to="https://www.facebook.com/" className="flex items-center gap-x-2 hover:opacity-50">
                            <img src={facebook} className="w-8 h-8" alt="Logo" />
                            Facebook
                        </Link>
                    </p>
                    <p className="text-xs">
                        <Link to="https://github.com/" className="flex items-center gap-x-2 hover:opacity-50">
                            <img src={github} className="w-8 h-8" alt="Logo" />
                            GitHub
                        </Link>
                    </p>
                </div>

                </div>
            </div>

            {/* Copyright Section */}
            <div className="text-center border-t border-black pt-2 mt-4">
                <p className="text-xs">
                    ©2024 {translations.siteName} - All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
