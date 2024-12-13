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
            <div className="bg-white absolute right-0 border border-grey w-60 duration-200">
                <Link to={`/user/${username}`} className="link pl-8 py-4">
                    {translations.profile}
                </Link>

                <Link to="/dashboard/blogs" className="link pl-8 py-4">
                    {translations.dashboard}
                </Link>

                <Link to="/settings/edit-profile" className="link pl-8 py-4">
                    {translations.settings}
                </Link>

                <span className="absolute border-t border-grey w-[100%]"></span>

                <button 
                    className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
                    onClick={signOutUser}
                >
                    <h1 className="font-bold text-xl mg-1">{translations.signOut}</h1>
                    <p className="text-dark-grey">@{username}</p>
                </button>
            </div>
        </AnimationWrapper>
    );
};

export default UserNavigationPanel;
