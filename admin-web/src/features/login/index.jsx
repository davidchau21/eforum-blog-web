import authApi from "@/api/authApi";
import PasswordField from "@/components/form/password-field";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ConfigProvider, Form, Checkbox, Button } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ShieldCheck, Zap, ArrowRight, Sparkles, Languages } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const handleResponseError = useHandleResponseError();
  const { getLocalStorage, setLocalStorage } = useLocalStorage();

  const [isLoading, onLogin] = useHandleAsyncRequest(
    async ({ email, password }) => {
      const { ok, body, errors } = await authApi.login({ email, password });
      if (ok && body) {
        setLocalStorage({ value: { accessToken: body.access_token } });
        navigate("/");
      }
      if (errors) {
        handleResponseError(errors);
      }
    }
  );

  useEffect(() => {
    const accessToken = getLocalStorage();
    if (accessToken) {
      navigate("/");
    }
  }, [getLocalStorage, navigate]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#059669",
          borderRadius: 16,
          colorBgContainer: "rgba(255, 255, 255, 0.7)",
          colorText: "#064e3b",
          colorTextPlaceholder: "#94a3b8",
          colorBorder: "rgba(5, 150, 105, 0.1)",
        },
        components: {
          Input: {
            activeBorderColor: "#059669",
            hoverBorderColor: "rgba(5, 150, 105, 0.5)",
            controlHeight: 48,
          },
          Button: {
            colorPrimary: "#059669",
            controlHeight: 52,
          }
        }
      }}
    >
      <div className="relative h-screen w-full flex items-center justify-center bg-white overflow-hidden font-exo-2 select-none">
        {/* Language Switcher */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 right-8 z-50"
        >
          <Button 
            type="text" 
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/60 hover:bg-emerald-500/10 text-emerald-700 font-black rounded-full px-4 h-10 transition-all"
          >
            <Languages size={16} />
            <span className="text-xs uppercase tracking-widest">{i18n.language === "en" ? "Tiếng Việt" : "English"}</span>
          </Button>
        </motion.div>

        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-15%] left-[-5%] w-[70%] h-[70%] bg-emerald-100 blur-[120px] rounded-full opacity-60" 
          />
          <motion.div 
            animate={{ scale: [1.1, 1, 1.1], rotate: [0, -45, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-15%] right-[-5%] w-[70%] h-[70%] bg-teal-100 blur-[120px] rounded-full opacity-60" 
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-[440px] px-6 flex flex-col items-center"
        >
          {/* Compact Header Branding */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.05 }}
              className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4"
            >
              <Zap className="text-white" size={32} fill="currentColor" />
            </motion.div>
            <h1 className="text-4xl font-black text-emerald-900 tracking-tighter mb-2">
              EDU<span className="text-emerald-500 font-light italic">BLOG</span>
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <Sparkles size={14} className="text-emerald-600" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-700">{t('login.portal_tag')}</span>
            </div>
          </motion.div>

          {/* Compact Crystal Card */}
          <motion.div 
            variants={itemVariants}
            className="w-full bg-white/40 backdrop-blur-[30px] border border-white/60 p-8 rounded-[2.5rem] shadow-[0_30px_80px_rgba(5,150,105,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />

            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black text-emerald-900 mb-1 tracking-tight">{t('login.title')}</h2>
              <p className="text-emerald-700/60 text-xs font-medium px-4">{t('login.subtitle')}</p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onLogin}
              requiredMark={false}
              className="space-y-3"
            >
              <motion.div variants={itemVariants}>
                <TextField
                  name="email"
                  label={<span className="text-emerald-800/70 font-black text-[9px] uppercase tracking-widest ml-1">{t('login.email_label')}</span>}
                  placeholder={t('login.email_placeholder')}
                  prefix={<Mail size={18} className="text-emerald-600 mr-2" />}
                  rules={[
                    { required: true, message: t('login.email_required') },
                    { type: "email", message: t('login.email_invalid') }
                  ]}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <PasswordField
                  name="password"
                  label={<span className="text-emerald-800/70 font-black text-[9px] uppercase tracking-widest ml-1">{t('login.password_label')}</span>}
                  placeholder={t('login.password_placeholder')}
                  prefix={<Lock size={18} className="text-emerald-600 mr-2" />}
                  rules={[{ required: true, message: t('login.password_required') }]}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-between py-1">
                <Checkbox className="text-emerald-800/60 text-[11px] font-bold custom-checkbox">{t('login.remember_me')}</Checkbox>
                <a href="#" className="text-emerald-600 text-[11px] font-black hover:text-emerald-500 transition-all uppercase tracking-tighter">{t('login.forgot_password')}</a>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <SubmitButton
                  text={
                    <div className="flex items-center justify-center gap-2 w-full h-full leading-none translate-y-[1px]">
                      <span className="font-black uppercase tracking-wider">{isLoading ? t('login.authenticating') : t('login.sign_in')}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  }
                  loading={isLoading}
                  className="w-full bg-emerald-600 hover:!bg-emerald-700 border-none shadow-xl shadow-emerald-600/30 text-xs font-black transition-all active:scale-95 group rounded-xl"
                />
              </motion.div>
            </Form>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-8 text-center opacity-40">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck size={12} className="text-emerald-600" />
              <p className="text-emerald-900 text-[9px] uppercase tracking-[0.3em] font-black">
                {t('login.footer_text')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .ant-form-item {
          margin-bottom: 12px !important;
        }
        .ant-form-item-label {
          padding-bottom: 4px !important;
        }
        .ant-input-affix-wrapper {
          background: rgba(255, 255, 255, 0.4) !important;
          border: 1.5px solid rgba(5, 150, 105, 0.1) !important;
          padding: 10px 16px !important;
          border-radius: 14px !important;
        }
        .ant-input-affix-wrapper:hover {
          background: rgba(255, 255, 255, 0.6) !important;
          border-color: rgba(5, 150, 105, 0.3) !important;
        }
        .ant-input-affix-wrapper-focused {
          background: white !important;
          border-color: #059669 !important;
          box-shadow: 0 10px 20px rgba(5, 150, 105, 0.08) !important;
        }
        .ant-input {
          font-size: 14px !important;
          color: #064e3b !important;
          font-weight: 600 !important;
        }
        .ant-checkbox-inner {
          width: 16px !important;
          height: 16px !important;
          border-radius: 4px !important;
        }
        .custom-checkbox span {
          color: #064e3b !important;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default LoginPage;
