import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import { ThemeContext } from "../App";
import { motion } from "framer-motion";

const VerifyResetOtpPage = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useContext(ThemeContext);

  const email = location.state?.email || "";

  const [resendCount, setResendCount] = useState(location.state?.initialResendCount || 1);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOtp = async () => {
    if (resendCount >= 3) {
      return toast.error("Bạn đã vượt quá giới hạn gửi lại mã OTP (tối đa 3 lần).");
    }

    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/forgot-password", { email });
      toast.success("Mã OTP mới đã được gửi vào email của bạn!");
      setResendCount(data.resendCount || (resendCount + 1));
      setTimer(data.timeLeft || 30);
      setCanResend(false);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Lỗi gửi lại mã OTP";
      if (errorMsg.includes("giới hạn")) {
        setResendCount(3);
      }
      toast.error(errorMsg);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    if (!otp || !email) {
      return toast.error("Please provide both email and OTP");
    }

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/verify-reset-otp", { email, otp })
      .then(() => {
        toast.success("OTP verified successfully!");
        setTimeout(() => {
          navigate("/new-password", { state: { email, otp } });
        }, 1000);
      })
      .catch(({ response }) => {
        toast.error(response?.data?.error || response?.data?.message || "Error verifying OTP");
      });
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-jakarta transition-colors duration-500">
      <Toaster />
      
      {/* Left Side: Immersive Hero Area */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[60%] relative overflow-hidden group"
      >
        <img 
          src="/imgs/auth-hero.png" 
          alt="Academic Hero" 
          className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-10000 ease-out"
        />
        
        {/* Dynamic theme overlays */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === 'dark' ? 'bg-black/60' : 'bg-white/20'}`}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-black via-transparent to-transparent opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent opacity-60"></div>
        
        <div className="relative z-10 p-20 mt-auto mb-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
              OTP Verification
            </span>
            <h2 className="text-6xl font-bold text-black mb-6 tracking-tight leading-[1.1]">
              Verify Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 font-black">Identity</span>
            </h2>
            <p className="text-dark-grey text-xl leading-relaxed">
              Enter the secure verification code to establish your password recovery permission.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side: OTP Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-[40%] flex flex-col justify-center items-center px-8 md:px-16 lg:px-20 bg-white relative border-l border-grey/30"
      >
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-black mb-4 tracking-tight">
              Enter Verification Code
            </h1>
            <p className="text-dark-grey text-lg">
              We have sent a 6-digit OTP code to <strong className="text-black">{email}</strong>.
            </p>
          </motion.div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-4">
              <InputBox
                name="otp"
                type="text"
                placeholder="6-Digit OTP Code"
                icon="fi-rr-shield"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="!bg-grey/30 !border-grey/50 !text-black !rounded-2xl !h-14 focus:!border-emerald-500/50 focus:!bg-white transition-all"
              />

              <div className="flex justify-between items-center text-sm px-2 mt-2">
                <span className="text-dark-grey text-xs">
                  {resendCount < 3 ? `Gửi lại tối đa: còn ${3 - resendCount} lần` : "Đã đạt giới hạn gửi lại"}
                </span>
                
                {resendCount < 3 ? (
                  canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-emerald-500 font-bold hover:underline"
                    >
                      Gửi lại OTP
                    </button>
                  ) : (
                    <span className="text-dark-grey font-medium text-xs">
                      Gửi lại sau {timer}s
                    </span>
                  )
                ) : (
                  <span className="text-red-500 font-bold text-xs">Hết lượt gửi lại</span>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-emerald-500/20 transition-all"
              type="submit"
            >
              Verify OTP
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(16, 185, 129, 0.05)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-grey/30 border border-grey/50 text-black rounded-2xl text-lg font-semibold transition-all"
              onClick={() => navigate('/forgot-password')}
            >
              Back
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyResetOtpPage;
