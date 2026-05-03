import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { useContext, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { UserContext } from "../App";

const ChangePassword = () => {
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let changePasswordForm = useRef();

  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

  const handleSubmit = (e) => {
    e.preventDefault();

    let form = new FormData(changePasswordForm.current);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { currentPassword, newPassword } = formData;

    if (!currentPassword.length || !newPassword.length) {
      return toast.error("Fill all the inputs");
    }

    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return toast.error(
        "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
      );
    }

    e.target.setAttribute("disabled", true);

    let loadingToast = toast.loading("Updating....");

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(() => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.success("Password Updated");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      <Toaster />
      <form ref={changePasswordForm} className="max-w-[500px]">
        <h1 className="hidden md:block text-[22px] font-bold text-black mb-12">Change Password</h1>

        <div className="space-y-6">
          <div>
            <label className="text-[13px] text-dark-grey font-medium mb-2 block">Current password</label>
            <InputBox
              name="currentPassword"
              type="password"
              placeholder="Enter current password"
              icon="fi-rr-unlock"
            />
          </div>

          <div>
            <label className="text-[13px] text-dark-grey font-medium mb-2 block">New password</label>
            <InputBox
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              icon="fi-rr-key"
            />
            <p className="text-[12px] text-dark-grey mt-2 leading-relaxed">
              Must be 6–20 characters with at least one number, one lowercase and one uppercase letter.
            </p>
          </div>

          <button
            className="btn-dark px-10 mt-4"
            type="submit"
            onClick={handleSubmit}
          >
            Update password
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
