import React, { createContext, useState } from 'react';
import { getTranslations } from './translations'; // Đảm bảo bạn import file translations.js

// Tạo ngữ cảnh người dùng
export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [userAuth, setUserAuth] = useState({
        access_token: null,
        profile_img: '',
        new_notification_available: false,
        language: 'vi' // Ngôn ngữ mặc định là tiếng Việt
    });

    const [translations, setTranslations] = useState(getTranslations(userAuth.language));

    const changeLanguage = (lang) => {
        setUserAuth(prev => ({ ...prev, language: lang }));
        setTranslations(getTranslations(lang));
    };

    return (
        <UserContext.Provider value={{ userAuth, setUserAuth, translations, changeLanguage }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
