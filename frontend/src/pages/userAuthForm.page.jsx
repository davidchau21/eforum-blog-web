import { useContext, useEffect } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";
import { useLocation } from "react-router-dom";

const UserAuthForm = ({ type }) => {
  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

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
        // Điều hướng đến trang verify OTP với email
        if (serverRoute === "/signup") {
          toast.success("Sign up successful. Please verify your email.");
          navigate("/verify", { state: { email: formData.email } });
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

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    // formData
    let form = new FormData(formElement);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData;

    // form validation

    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("Fullname must be at least 3 letters long");
      }
    }
    if (!email.length) {
      return toast.error("Enter Email");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }
    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
      );
    }

    userAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();

    authWithGoogle()
      .then((user) => {
        let serverRoute = "/google-auth";

        let formData = {
          access_token: user.accessToken,
        };

        userAuthThroughServer(serverRoute, formData);
        return toast.success("Google login successful! Welcome back.");
        
      })
      .catch((err) => {
        toast.error("trouble login through google");
        return console.log(err);
      });
  };

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type == "sign-in" ? "Welcome back" : "Join us today"}
          </h1>

          {type != "sign-in" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          ) : (
            ""
          )}

          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />

          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />

          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handleSubmit}
          >
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogleAuth}
          >
            <img src={googleIcon} className="w-5" />
            continue with google
          </button>

          {type === "sign-in" && (
            <div className="mt-6 text-dark-grey text-xl text-center">
              <p>
                Forgot your password?{" "}
                <Link
                  to="/forgot-password"
                  className="underline text-black text-xl ml-1"
                >
                  Reset it here
                </Link>
              </p>
              <p className="mt-6 text-dark-grey text-xl text-center">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="underline text-black text-xl ml-1"
                >
                  Join us today
                </Link>
              </p>
            </div>
          )}

          {type === "sign-up" && (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member?{" "}
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
