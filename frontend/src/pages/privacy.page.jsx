import React, { useContext } from "react";
import { ThemeContext, UserContext } from '../App';
import { getTranslations } from '../../translations';
import AnimationWrapper from "../common/page-animation";

const PrivacyPage = () => {
    const { theme } = useContext(ThemeContext);
    const { userAuth } = useContext(UserContext);
    const language = userAuth?.language || "vi";
    const translations = getTranslations(language);

    const isVi = language === "vi";
    const t = translations.privacyContent || {};

    // Dynamic fallbacks for missing translation keys
    const title = t.title || (isVi ? "Chính sách bảo mật" : "Privacy Policy");
    const intro = t.intro || (isVi 
        ? "Tại EForum, chúng tôi đặc biệt tôn trọng và coi trọng quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi quản lý thông tin cá nhân của bạn." 
        : "At EForum, we highly respect and value your privacy. This privacy policy explains how we manage your personal information.");
    
    const infoCollectionTitle = t.informationCollectionTitle || (isVi ? "Thu thập thông tin" : "Information Collection");
    const infoCollection = t.informationCollection || (isVi 
        ? "Chúng tôi thu thập thông tin mà bạn cung cấp trực tiếp khi đăng ký tài khoản, chẳng hạn như tên, địa chỉ email, ảnh đại diện và sở thích cá nhân." 
        : "We collect information that you provide directly when registering for an account, such as your name, email address, profile picture, and personal interests.");

    const dataUsageTitle = t.dataUsageTitle || (isVi ? "Sử dụng dữ liệu" : "Data Usage");
    const dataUsage = t.dataUsage || (isVi 
        ? "Thông tin của bạn được sử dụng để cung cấp, duy trì và nâng cao chất lượng dịch vụ, cá nhân hóa trải nghiệm của bạn trên hệ thống, và thông báo các cập nhật quan trọng." 
        : "Your information is used to provide, maintain, and enhance our services, personalize your experience on the platform, and notify you of important updates.");

    const closing = t.closing || (isVi 
        ? "Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này hoặc cách chúng tôi xử lý dữ liệu của bạn, vui lòng liên hệ với chúng tôi qua trang hỗ trợ." 
        : "If you have any questions about this privacy policy or how we handle your data, please contact us via our support page.");

    return (
        <AnimationWrapper>
            <div className={`min-h-screen py-16 px-[6vw] md:px-[15vw] lg:px-[20vw] transition-colors duration-500 font-inter ${
                theme === "light" 
                    ? "bg-[#FCFCFC] text-slate-900" 
                    : "bg-[#09090B] text-slate-100"
            }`}>
                {/* Subtle background grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

                <div className="max-w-3xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-12">
                        <span className="text-xs font-bold uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 mb-3 block">
                            {isVi ? "AN TOÀN & BẢO MẬT" : "SECURITY & PRIVACY"}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-jakarta leading-none mb-6">
                            {title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-light text-base leading-relaxed">
                            {intro}
                        </p>
                    </div>

                    {/* Single Column Content Sections */}
                    <div className="space-y-8 mb-12">
                        
                        {/* Section 1: Information Collection */}
                        <div className="bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm flex gap-5 hover:border-slate-350 dark:hover:border-slate-800 transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <i className="fi fi-rr-data-transfer text-lg"></i>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold font-jakarta text-slate-800 dark:text-slate-200">
                                    {infoCollectionTitle}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
                                    {infoCollection}
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Data Usage */}
                        <div className="bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm flex gap-5 hover:border-slate-350 dark:hover:border-slate-800 transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <i className="fi fi-rr-shield-check text-lg"></i>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold font-jakarta text-slate-800 dark:text-slate-200">
                                    {dataUsageTitle}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
                                    {dataUsage}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Closing Banner */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center relative overflow-hidden bg-slate-50 dark:bg-[#121214]/50">
                        <div className="max-w-xl mx-auto space-y-4">
                            <p className="text-slate-550 dark:text-slate-400 text-sm font-light leading-relaxed">
                                {closing}
                            </p>
                            <div className="pt-2">
                                <a 
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white font-bold rounded-xl transition-all text-xs tracking-wider uppercase text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                                >
                                    <i className="fi fi-rr-envelope"></i>
                                    {isVi ? "Liên Hệ Hỗ Trợ" : "Contact Support"}
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AnimationWrapper>
    );
};

export default PrivacyPage;
