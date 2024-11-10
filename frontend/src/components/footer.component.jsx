import { Link } from "react-router-dom";
import { useContext } from "react";
import darkLogo from "../imgs/logo-dark.png";
import lightLogo from "../imgs/logo-light.png";
import github from "../imgs/github.png";
import youtube from "../imgs/youtube.png";
import facebook from "../imgs/facebook.png"
import { UserContext, ThemeContext } from '../App';
import { getTranslations } from '../../translations';

const Footer = () => {
    const { userAuth } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
    const { language } = userAuth;
    const translations = getTranslations(language);

    return (
        <footer className={`p-5 mt-10 ${theme === "light" ? "bg-gray-200" : "bg-gray-800"}`}>
            <div className={"p-5 mx-auto flex md:flex-row gap-10 "}>

                <div className="flex">
                    <Link to="/" className="flex items-center">
                        <img src={theme === "light" ? darkLogo : lightLogo} className="w-[70px] h-[70px]" alt="Logo" />
                    </Link>
                </div>

                <div className="text-left">
                    <p className={`text-xl font-bold mt-2`}>  
                            {translations.aboutUs}
                    </p>
                    <p className={`text-xs mt-2 max-w-lg`}>  
                            {translations.aboutUsDes}
                    </p>
                    <p className={`text-xl font-bold mt-2`}>
                        <span>
                            {translations.contact}
                        </span>
                    </p>
                    <p className={`text-xs mt-2`}>
                    <span>
                        contact@edublog.com -
                        <span className="mx-2">
                            <Link to="/contact" className={`hover:underline`}>
                                {translations.more}
                            </Link>
                        </span>
                    </span>

                    </p>
                </div>
                
                <div className="text-left">
                    <p className={`text-xl font-bold mt-2`}>  
                            {translations.legal}
                    </p>
                    <p className={`text-xs mt-2`}>
                        <Link to="/terms-of-service" className={`hover:underline`}>
                            {translations.termsOfService}
                        </Link>
                    </p>
                    <p className={`text-xs mt-2`}>
                        <Link to="/privacy" className={`hover:underline `}>
                            {translations.privacy}
                        </Link>
                    </p>
                    <p className={`text-xs mt-2`}>
                        <Link to="/policy" className={`hover:underline`}>
                            {translations.policy}
                        </Link>
                    </p>
                </div>

                <div className="text-left">
                    <p className={`text-xl font-bold mt-2`}>  
                            {translations.social}
                    </p>
                    <p className={`text-xs mt-2`}>
                        
                        <Link to="https://www.youtube.com/" className={`hover:opacity-50`}>
                            <img src={youtube} className="w-8 h-8" alt="Logo" />
                        </Link>
                    </p>
                    <p className={`text-xs mt-2`}>
                        <Link to="https://www.facebook.com/" className={`hover:opacity-50`}>
                            <img src={facebook} className="w-8 h-8" alt="Logo" />
                        </Link>
                    </p>
                    <p className={`text-xs mt-2`}>
                        <Link to="https://github.com/" className={`hover:opacity-50`}>
                            <img src={github} className="w-8 h-8" alt="Logo" />
                        </Link>
                    </p>
                </div>

                
            </div>
            <div className="text-center border-t border-black">
                    <p className={`text-xs mt-2`}>
                        <span>
                            ©2024 {translations.siteName} - All rights reserved.
                        </span>
                    </p>
                </div>
        </footer>
    );
};

export default Footer;
