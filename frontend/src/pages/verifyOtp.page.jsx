import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import AnimationWrapper from "../common/page-animation";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email; 

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    if (!otp || !email) {
      return toast.error("Please provide both email and OTP");
    }

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/verify", { email, otp })
      .then(({ data }) => {
        navigate("/signin", { state: { message: 'OTP Verified Successfully. Please sign in' } }); 
      })
      .catch(({ response }) => {
        toast.error(response.data.message || "Error verifying OTP");
      });
  };

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <AnimationWrapper keyValue="verify-otp">
      <Toaster />
      <section className="h-cover flex items-center justify-center">
        <form className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center">
            Verify OTP
          </h1>
          <p className="text-1xl font-gelasio text-center mb-5">
            Please enter the OTP sent to your email: {email}
          </p>

          <InputBox
            name="otp"
            type="text"
            placeholder="Enter OTP"
            icon="fi-rr-key"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            className="btn-dark center mt-8 w-38"
            onClick={handleVerifyOtp}
          >
            Verify OTP
          </button>

          <button
            className="btn-light center mt-4 w-59 text-sm"
            type="button"
            onClick={handleBack}
          >
            Back
          </button>
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default VerifyOtp;
