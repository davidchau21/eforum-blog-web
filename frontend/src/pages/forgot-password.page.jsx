import { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import InputBox from "../components/input.component";
import AnimationWrapper from "../common/page-animation";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/forgot-password`, { email });
      navigate("/signin", {
        state: { message: "Password reset link has been sent to your email" },
      });
    } catch (error) {
      toast.error(error.response?.data.message || "An error occurred");
    }
  };

  return (
    <AnimationWrapper keyValue="forgot-password">
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form className="w-[80%] max-w-[400px]" onSubmit={handleSubmit}>
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            Forgot Password
          </h1>

          <InputBox
            name="email"
            type="email"
            placeholder="Enter your email"
            icon="fi-rr-envelope"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="btn-dark center mt-14" type="submit">
            Send Reset Link
          </button>

          <button 
            className="btn-light center mt-4"
            onClick={() => navigate("/signin")}
          >
            Back to Sign In
          </button>
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default ForgotPasswordPage;
