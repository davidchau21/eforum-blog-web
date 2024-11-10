import React, { useContext } from "react";
import { UserContext } from '../App'; // Đảm bảo bạn nhập đúng đường dẫn đến tệp App
import { getTranslations } from '../../translations'; // Đảm bảo bạn nhập đúng đường dẫn đến tệp translations

const TermsOfServicePage = () => {
    const { userAuth } = useContext(UserContext); // Lấy thông tin người dùng từ context
    const { language } = userAuth; // Lấy ngôn ngữ hiện tại
    const translations = getTranslations(language); // Lấy bản dịch theo ngôn ngữ hiện tại

    return (
        <div className="p-6 max-w-screen-lg min-h-screen mx-auto">
            <h1 className="text-2xl font-bold mb-4">{translations.termsOfServiceContent.title}</h1>
            <p className="text-lg mb-4">{translations.termsOfServiceContent.intro}</p>
            <h2 className="text-xl font-semibold mb-2">{translations.termsOfServiceContent.accountRegistrationTitle}</h2>
            <p className="text-lg mb-4">{translations.termsOfServiceContent.accountRegistration}</p>
            <h2 className="text-xl font-semibold mb-2">{translations.termsOfServiceContent.serviceLimitationsTitle}</h2>
            <p className="text-lg mb-4">{translations.termsOfServiceContent.serviceLimitations}</p>
            <p className="text-lg">{translations.termsOfServiceContent.closing}</p>
        </div>
    );
};

export default TermsOfServicePage;
