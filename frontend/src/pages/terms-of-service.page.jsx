import React, { useContext } from "react";
import { ThemeContext, UserContext } from '../App';
import { getTranslations } from '../../translations';
import AnimationWrapper from "../common/page-animation";

const TermsOfServicePage = () => {
    const { theme } = useContext(ThemeContext);
    const { userAuth } = useContext(UserContext);
    const language = userAuth?.language || "vi";
    const translations = getTranslations(language);

    const isVi = language === "vi";
    const t = translations.termsOfServiceContent || {};

    // Dynamic fallbacks for missing translation keys
    const title = t.title || (isVi ? "Điều khoản dịch vụ" : "Terms of Service");
    const intro = t.intro || (isVi 
        ? "Các điều khoản dịch vụ này điều chỉnh việc bạn sử dụng EForum và nêu rõ các điều kiện để truy cập nền tảng của chúng tôi." 
        : "These Terms of Service govern your use of EForum and outline the conditions for accessing our platform.");
    
    const accountRegTitle = t.accountRegistrationTitle || (isVi ? "Đăng ký tài khoản" : "Account Registration");
    const accountReg = t.accountRegistration || (isVi 
        ? "Người dùng phải đăng ký tài khoản để truy cập một số tính năng nhất định. Bằng cách tạo tài khoản, bạn đồng ý cung cấp thông tin chính xác và giữ cho nó được cập nhật." 
        : "Users must register for an account to access certain features. By creating an account, you agree to provide accurate information and keep it up to date.");

    const serviceLimitTitle = t.serviceLimitationsTitle || (isVi ? "Giới hạn dịch vụ" : "Service Limitations");
    const serviceLimit = t.serviceLimitations || (isVi 
        ? "EForum có quyền sửa đổi hoặc ngừng cung cấp dịch vụ bất kỳ lúc nào mà không cần thông báo trước." 
        : "EForum reserves the right to modify or discontinue services at any time, without prior notice.");

    const closing = t.closing || (isVi 
        ? "Bằng cách tiếp tục sử dụng EForum, bạn đồng ý với các điều khoản dịch vụ này. Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi." 
        : "By continuing to use EForum, you agree to these Terms of Service. If you have any questions, please contact us.");

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
                            {isVi ? "ĐIỀU KHOẢN SỬ DỤNG" : "TERMS & CONDITIONS"}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-jakarta leading-none mb-6">
                            {title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-light text-base leading-relaxed">
                            {intro}
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-8 mb-12">
                        
                        {/* Section 1: Account Registration */}
                        <div className="bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm flex gap-5 hover:border-slate-350 dark:hover:border-slate-800 transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <i className="fi fi-rr-user-add text-lg"></i>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold font-jakarta text-slate-800 dark:text-slate-200">
                                    {accountRegTitle}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
                                    {accountReg}
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Service Limitations */}
                        <div className="bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-sm flex gap-5 hover:border-slate-350 dark:hover:border-slate-800 transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <i className="fi fi-rr-ban text-lg"></i>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold font-jakarta text-slate-800 dark:text-slate-200">
                                    {serviceLimitTitle}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light">
                                    {serviceLimit}
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

export default TermsOfServicePage;
