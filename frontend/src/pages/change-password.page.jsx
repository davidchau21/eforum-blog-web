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
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-black tracking-tight">
          Change Password
        </h1>
        <p className="text-[14px] text-dark-grey mt-2">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>

      <form ref={changePasswordForm} className="max-w-[600px] w-full bg-black/[0.02] backdrop-blur-xl border border-grey rounded-[2rem] p-8 md:p-10 shadow-sm">
        <div className="space-y-6">
          <div>
            <label className="text-[13px] text-black font-semibold mb-2.5 block">
              Current password
            </label>
            <InputBox
              name="currentPassword"
              type="password"
              placeholder="Enter current password"
              icon="fi-rr-unlock"
            />
          </div>

          <div className="pt-2">
            <label className="text-[13px] text-black font-semibold mb-2.5 block">
              New password
            </label>
            <InputBox
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              icon="fi-rr-key"
            />
            <div className="mt-3 bg-grey/50 p-4 rounded-2xl border border-grey flex items-start gap-3">
              <i className="fi fi-rr-info text-dark-grey mt-0.5"></i>
              <p className="text-[12px] text-dark-grey leading-relaxed">
                Password requirements:
                <ul className="list-disc ml-4 mt-1 space-y-0.5">
                  <li>6 to 20 characters long</li>
                  <li>At least one number</li>
                  <li>At least one uppercase and one lowercase letter</li>
                </ul>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-grey mt-2">
            <button
              className="w-full md:w-auto px-10 py-3.5 rounded-2xl bg-black text-white text-[14px] font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-black/10"
              type="submit"
              onClick={handleSubmit}
            >
              Update Password
            </button>
          </div>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
