import React, { useContext } from "react";
import { ThemeContext, UserContext } from "../App";
import { getTranslations } from "../../translations";
import AnimationWrapper from "../common/page-animation";

const ContactPage = () => {
  const { theme } = useContext(ThemeContext);
  const { userAuth } = useContext(UserContext);
  const language = userAuth?.language || "vi";
  const translations = getTranslations(language);

  const isVi = language === "vi";

  return (
    <AnimationWrapper>
      <div
        className={`min-h-screen py-16 px-[6vw] md:px-[12vw] transition-colors duration-500 font-inter ${
          theme === "light"
            ? "bg-[#FCFCFC] text-slate-900"
            : "bg-[#09090B] text-slate-100"
        }`}
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 mb-3 block">
              {isVi ? "KẾT NỐI VỚI EFORUM" : "CONNECT WITH US"}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-jakarta leading-none">
              {translations.contactContent?.title ||
                (isVi ? "Liên Hệ" : "Contact")}
            </h1>
          </div>

          {/* Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
            {/* Info cards (Left) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Address Card */}
              <div className="bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <i className="fi fi-rr-marker text-lg"></i>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isVi ? "Địa Chỉ" : "Address"}
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {translations.contactContent?.address}
                  </p>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <i className="fi fi-rr-phone-call text-lg"></i>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isVi ? "Điện Thoại" : "Phone"}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {translations.contactContent?.phone}
                  </p>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <i className="fi fi-rr-envelope text-lg"></i>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isVi ? "Email" : "Email"}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {translations.contactContent?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Map Container (Right) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <i className="fi fi-rr-map"></i>
                  {translations.map || (isVi ? "Bản đồ" : "Map")}
                </span>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md bg-white dark:bg-[#121214] p-2">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1541153724405!2d106.68682760301485!3d10.822190534585554!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528e0b8ebee03%3A0x37c0678e478a0546!2zMTIgTmd1eeG7hW4gQsOhbmcgQmFvLCBQaOG6rW5nIDQsIEdvxJBCU8O0IEhvw6BuLCBIb8O0IExhbmcgQ2hpbmlj!5e0!3m2!1svi!2s!4v1666816050585!5m2!1svi!2s"
                  width="100%"
                  height="380"
                  style={{ border: 0, borderRadius: "1.25rem" }}
                  allowFullScreen=""
                  loading="lazy"
                  title="EForum Location Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default ContactPage;
