import React, { useContext } from "react";
import { UserContext } from '../App'; // Đảm bảo bạn nhập đúng đường dẫn đến tệp App
import { getTranslations } from '../../translations'; // Đảm bảo bạn nhập đúng đường dẫn đến tệp translations

const ContactPage = () => {
    const { userAuth } = useContext(UserContext); // Lấy thông tin người dùng từ context
    const { language } = userAuth; // Lấy ngôn ngữ hiện tại
    const translations = getTranslations(language); // Lấy bản dịch theo ngôn ngữ hiện tại

    return (
        <div className="p-6 max-w-screen-lg min-h-screen mx-auto">
            <h1 className="text-2xl font-bold mb-4">{translations.contactContent.title}</h1>
            <p className="text-lg mb-4">{translations.contactContent.address}</p>
            <p className="text-lg mb-4">{translations.contactContent.phone}</p>
            <p className="text-lg mb-4">{translations.contactContent.email}</p>


            <h1 className="text-2xl font-bold mb-4">{translations.map}</h1>
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1541153724405!2d106.68682760301485!3d10.822190534585554!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528e0b8ebee03%3A0x37c0678e478a0546!2zMTIgTmd1eeG7hW4gQsOhbmcgQmFvLCBQaOG6rW5nIDQsIEdvxJBCU8O0IEhvw6BuLCBIb8O0IExhbmcgQ2hpbmlj!5e0!3m2!1svi!2s!4v1666816050585!5m2!1svi!2s"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
            ></iframe>
        </div>
    );
};

export default ContactPage;
