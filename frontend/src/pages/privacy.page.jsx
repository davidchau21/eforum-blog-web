import React, { useContext } from "react";
import { UserContext } from '../App'; // Đảm bảo bạn nhập đúng đường dẫn đến tệp App
import { getTranslations } from '../../translations'; // Đảm bảo bạn nhập đúng đường dẫn đến tệp translations

const PrivacyPage = () => {
    const { userAuth } = useContext(UserContext); // Lấy thông tin người dùng từ context
    const { language } = userAuth; // Lấy ngôn ngữ hiện tại
    const translations = getTranslations(language); // Lấy bản dịch theo ngôn ngữ hiện tại

    return (
        <div className="p-6 max-w-screen-lg min-h-screen mx-auto">
            <h1 className="text-2xl font-bold mb-4">{translations.privacyContent.title}</h1>
            <p className="text-lg mb-4">{translations.privacyContent.intro}</p>
            <h2 className="text-xl font-semibold mb-2">{translations.privacyContent.informationCollectionTitle}</h2>
            <p className="text-lg mb-4">{translations.privacyContent.informationCollection}</p>
            <h2 className="text-xl font-semibold mb-2">{translations.privacyContent.dataUsageTitle}</h2>
            <p className="text-lg mb-4">{translations.privacyContent.dataUsage}</p>
            <p className="text-lg">{translations.privacyContent.closing}</p>
        </div>
    );
};

export default PrivacyPage;
