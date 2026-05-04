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
            <div className="bg-white absolute right-0 border border-grey w-64 duration-200 rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-grey bg-grey/30">
                    <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-black truncate mt-0.5">@{username}</p>
                </div>

                <Link to={`/user/${username}`} className="flex items-center gap-3 px-6 py-3.5 text-black font-bold text-sm hover:bg-grey transition-all border-b border-grey">
                    <i className="fi fi-rr-user text-indigo-500"></i>
                    {translations.profile}
                </Link>

                <Link to="/dashboard/blogs" className="flex items-center gap-3 px-6 py-3.5 text-black font-bold text-sm hover:bg-grey transition-all border-b border-grey">
                    <i className="fi fi-rr-apps text-indigo-500"></i>
                    {translations.dashboard}
                </Link>

                <Link to="/settings/edit-profile" className="flex items-center gap-3 px-6 py-3.5 text-black font-bold text-sm hover:bg-grey transition-all border-b border-grey">
                    <i className="fi fi-rr-settings text-indigo-500"></i>
                    {translations.settings}
                </Link>

                <button 
                    className="flex flex-col w-full px-6 py-4 hover:bg-rose-500/5 group transition-all duration-200"
                    onClick={signOutUser}
                >
                    <div className="flex items-center gap-3 text-black font-bold text-sm group-hover:text-rose-500 transition-colors">
                        <i className="fi fi-rr-sign-out-alt"></i>
                        {translations.signOut}
                    </div>
                </button>
            </div>
        </AnimationWrapper>
    );
};

export default UserNavigationPanel;
