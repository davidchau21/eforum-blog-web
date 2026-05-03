import { useContext, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import { UserContext, ThemeContext } from "../App";
import { storeInSession } from "../common/session";
import { motion } from "framer-motion";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useContext(ThemeContext);

  const email = location.state?.email; 
  const password = location.state?.password;  

  let {
    setUserAuth,
  } = useContext(UserContext);

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    if (!otp || !email) {
      return toast.error("Please provide both email and OTP");
    }

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/verify", { email, otp })
      .then(() => {
        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/signin", { email, password })
          .then(({ data }) => {
            storeInSession("user", JSON.stringify(data));
            setUserAuth(data);
            toast.success("Login successful! Welcome back.");
            navigate("/", { state: { message: 'OTP Verified and Logged in Successfully' } });
          })
          .catch(({ response }) => {
            toast.error(response.data.message || "Error logging in");
          });
      })
      .catch(({ response }) => {
        toast.error(response.data.message || "Error verifying OTP");
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
              Verification Required
            </span>
            <h2 className="text-6xl font-bold text-black mb-6 tracking-tight leading-[1.1]">
              Secure Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 font-black">Knowledge Space</span>
            </h2>
            <p className="text-dark-grey text-xl leading-relaxed">
              Verifying your identity is the final step to joining our curated academic ecosystem.
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
              Email Verification
            </h1>
            <p className="text-dark-grey text-lg">
              We've sent a 6-digit code to <span className="text-emerald-500 font-medium">{email}</span>. Please enter it below.
            </p>
          </motion.div>

          <form className="space-y-6">
            <InputBox
              name="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              icon="fi-rr-key"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="!bg-grey/30 !border-grey/50 !text-black !rounded-2xl !h-14 focus:!border-emerald-500/50 focus:!bg-white text-center tracking-[0.5em] font-mono text-2xl transition-all"
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-emerald-500/20 transition-all"
              onClick={handleVerifyOtp}
            >
              Verify & Sign In
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(16, 185, 129, 0.05)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-grey/30 border border-grey/50 text-black rounded-2xl text-lg font-semibold transition-all"
              onClick={() => navigate(-1)}
            >
              Back
            </motion.button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-dark-grey">
              Didn't receive the code? <button className="text-emerald-500 font-bold hover:text-emerald-600 transition-colors ml-1 underline underline-offset-4 decoration-emerald-500/20">Resend OTP</button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
