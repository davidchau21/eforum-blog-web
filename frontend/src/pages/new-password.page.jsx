import { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import InputBox from '../components/input.component';
import AnimationWrapper from '../common/page-animation';

const NewPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

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
    <AnimationWrapper keyValue="new-password">
      <Toaster />
      <section className="h-cover flex items-center justify-center">
        <form className="w-[80%] max-w-[400px]" onSubmit={handleSubmit}>
          <h1 className="text-4xl font-gelasio capitalize text-center mb-8">
            Set New Password
          </h1>

          <InputBox
            name="password"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <InputBox
            name="passwordConfirm"
            type="password"
            placeholder="Confirm New Password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />

          <button className="btn-dark center mt-8" type="submit">
            Set New Password
          </button>

          <button 
            className="btn-light center mt-4"
            onClick={() => navigate('/signin')}
          >
            Back to Sign In
          </button>
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default NewPasswordPage;
