import { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";
import { getTranslations } from '../../translations';

const UserNavigationPanel = () => {
    const { userAuth: { username, language }, setUserAuth } = useContext(UserContext);
    const translations = getTranslations(language);

    const signOutUser = () => {
        removeFromSession("user");
        setUserAuth({ access_token: null });
        removeFromSession("adminAlertShown");
    };

    return (
        <AnimationWrapper 
            className="absolute right-full top-2 z-50 px-3"
            transition={{ duration: 0.2 }}
        >
            <div className="bg-white dark:bg-[#111113] absolute right-0 border border-grey dark:border-white/10 w-60 duration-200 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                <Link to={`/user/${username}`} className="link pl-8 py-4 border-b border-grey/50">
                    <i className="fi fi-rr-user mr-2 text-purple"></i>
                    {translations.profile}
                </Link>

                <Link to="/dashboard/blogs" className="link pl-8 py-4 border-b border-grey/50">
                    <i className="fi fi-rr-apps mr-2 text-purple"></i>
                    {translations.dashboard}
                </Link>

                <Link to="/settings/edit-profile" className="link pl-8 py-4 border-b border-grey/50">
                    <i className="fi fi-rr-settings mr-2 text-purple"></i>
                    {translations.settings}
                </Link>

                <button 
                    className="text-left p-4 hover:bg-red/5 w-full pl-8 py-4 group transition-all duration-200"
                    onClick={signOutUser}
                >
                    <h1 className="font-bold text-xl mg-1 group-hover:text-red transition-colors flex items-center">
                        <i className="fi fi-rr-sign-out-alt mr-2 text-lg"></i>
                        {translations.signOut}
                    </h1>
                    <p className="text-dark-grey group-hover:text-red/70 transition-colors">@{username}</p>
                </button>
            </div>
        </AnimationWrapper>
    );
};

export default UserNavigationPanel;
