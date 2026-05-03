import { useContext, useEffect, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext, ThemeContext } from "../App";
import { authWithGoogle } from "../common/firebase";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const UserAuthForm = ({ type }) => {
  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  let { theme } = useContext(ThemeContext);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state]);

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        if (serverRoute === "/signup") {
          toast.success("Sign up successful. Please verify your email.");
          navigate("/verify", {
            state: { email: formData.email, password: formData.password },
          });
        } else {
          storeInSession("user", JSON.stringify(data));
          setUserAuth(data);
          toast.success("Login successful! Welcome back.");
        }
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let serverRoute = type == "sign-in" ? "/signin" : "/signup";
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    let form = new FormData(formElement.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData;

    if (fullname && fullname.length < 3) {
      return toast.error("Fullname must be at least 3 letters long");
    }
    if (!email.length) return toast.error("Enter Email");
    if (!emailRegex.test(email)) return toast.error("Email is invalid");
    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password should be 6-20 characters with numeric, lowercase and uppercase letters",
      );
    }

    userAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    authWithGoogle()
      .then((user) => {
        userAuthThroughServer("/google-auth", {
          access_token: user.accessToken,
        });
        return toast.success("Google login successful!");
      })
      .catch((err) => {
        toast.error("Trouble login through google");
        console.log(err);
      });
  };

  const formElement = useRef();

  return access_token ? (
    <Navigate to="/" />
  ) : (
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

        {/* Dynamic Theme-based overlays */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${theme === "dark" ? "bg-black/60" : "bg-white/20"}`}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-black via-transparent to-transparent opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent opacity-60"></div>

        <div className="relative z-10 p-20 mt-auto mb-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
              Empowering Minds
            </span>
            <h2 className="text-6xl font-bold text-black mb-6 tracking-tight leading-[1.1]">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 font-black">
                Academic Journey
              </span>
            </h2>
            <p className="text-dark-grey text-xl leading-relaxed max-w-lg">
              Join a community of scholars, researchers, and students sharing
              insights that shape the future.
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-emerald-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-40 left-40 w-64 h-64 bg-emerald-500/5 rounded-full blur-[120px]"></div>
      </motion.div>

      {/* Right Side: Sophisticated Auth Form */}
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
              {type === "sign-in" ? "Welcome Back" : "Join the Collective"}
            </h1>
            <p className="text-dark-grey text-lg">
              {type === "sign-in"
                ? "Sign in to continue your academic exploration."
                : "Create your account and start sharing your knowledge."}
            </p>
          </motion.div>

          <form ref={formElement} onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {type !== "sign-in" && (
                <motion.div
                  key="fullname"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <InputBox
                    name="fullname"
                    type="text"
                    placeholder="Full Name"
                    icon="fi-rr-user"
                    className="!bg-grey/30 !border-grey/50 !text-black !rounded-2xl !h-14 focus:!border-emerald-500/50 focus:!bg-white transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <InputBox
              name="email"
              type="email"
              placeholder="Email Address"
              icon="fi-rr-envelope"
              className="!bg-grey/30 !border-grey/50 !text-black !rounded-2xl !h-14 focus:!border-emerald-500/50 focus:!bg-white transition-all"
            />

            <div className="space-y-2">
              <InputBox
                name="password"
                type="password"
                placeholder="Password"
                icon="fi-rr-key"
                className="!bg-grey/30 !border-grey/50 !text-black !rounded-2xl !h-14 focus:!border-emerald-500/50 focus:!bg-white transition-all"
              />
              {type === "sign-in" && (
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    title="Recover password"
                    className="text-emerald-500 hover:text-emerald-600 text-sm font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-emerald-500/20 transition-all mt-4"
              type="submit"
            >
              {type === "sign-in" ? "Sign In" : "Get Started"}
            </motion.button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-grey/30"></div>
              <span className="flex-shrink mx-4 text-dark-grey text-xs font-bold uppercase tracking-widest bg-white px-2">
                OR
              </span>
              <div className="flex-grow border-t border-grey/30"></div>
            </div>

            <motion.button
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(16, 185, 129, 0.05)",
              }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-grey/30 border border-grey/50 text-black rounded-2xl text-lg font-semibold transition-all"
              onClick={handleGoogleAuth}
            >
              <img src={googleIcon} className="w-5" alt="Google" />
              <span>Continue with Google</span>
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            {type === "sign-in" ? (
              <p className="text-dark-grey">
                New to the platform?{" "}
                <Link
                  to="/signup"
                  className="text-black font-bold hover:text-emerald-500 transition-colors ml-1 underline underline-offset-4 decoration-emerald-500/20"
                >
                  Create an account
                </Link>
              </p>
            ) : (
              <p className="text-dark-grey">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-black font-bold hover:text-emerald-500 transition-colors ml-1 underline underline-offset-4 decoration-emerald-500/20"
                >
                  Sign in instead
                </Link>
              </p>
            )}
          </motion.div>
        </div>

        {/* Ambient background light for form */}
        <div className="absolute top-1/4 right-0 w-32 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>
      </motion.div>
    </div>
  );
};

export default UserAuthForm;
