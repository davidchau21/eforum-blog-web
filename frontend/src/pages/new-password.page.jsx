import { useState, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import InputBox from '../components/input.component';
import { motion } from 'framer-motion';
import { ThemeContext } from '../App';

const NewPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const token = new URLSearchParams(location.search).get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return toast.error("Passwords don't match");
    }

    try {
      await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/reset-password', { token, password, passwordConfirm });
      navigate('/signin', { state: { message: 'Password reset successful. Please sign in' } });
    } catch (error) {
      toast.error(error.response?.data.message || 'An error occurred');
    }
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
              Security Update
            </span>
            <h2 className="text-6xl font-bold text-black mb-6 tracking-tight leading-[1.1]">
              Regain Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 font-black">Creative Access</span>
            </h2>
            <p className="text-dark-grey text-xl leading-relaxed">
              Define a new secure password to continue sharing your academic insights with the world.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side: New Password Form */}
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
              Set New Password
            </h1>
            <p className="text-dark-grey text-lg">
              Choose a strong, unique password to keep your academic profile secure.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <InputBox
                name="password"
                type="password"
                placeholder="New Password"
                icon="fi-rr-key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!bg-grey/30 !border-grey/50 !text-black !rounded-2xl !h-14 focus:!border-emerald-500/50 focus:!bg-white transition-all"
              />

              <InputBox
                name="passwordConfirm"
                type="password"
                placeholder="Confirm New Password"
                icon="fi-rr-key"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="!bg-grey/30 !border-grey/50 !text-black !rounded-2xl !h-14 focus:!border-emerald-500/50 focus:!bg-white transition-all"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-emerald-500/20 transition-all"
              type="submit"
            >
              Reset Password
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(16, 185, 129, 0.05)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-grey/30 border border-grey/50 text-black rounded-2xl text-lg font-semibold transition-all"
              onClick={() => navigate('/signin')}
            >
              Back to Sign In
            </motion.button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-dark-grey">
              Need assistance? <Link to="/contact" className="text-black font-bold hover:text-emerald-500 transition-colors ml-1 underline underline-offset-4 decoration-emerald-500/20">Contact Support</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewPasswordPage;
