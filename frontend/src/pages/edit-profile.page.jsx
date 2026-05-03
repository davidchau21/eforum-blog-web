import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import { uploadImage } from "../common/aws";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  let {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  let bioLimit = 150;

  let profileImgEle = useRef();
  let editProfileForm = useRef();

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharctersLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);

  let {
    personal_info: {
      fullname,
      username: profile_username,
      profile_img,
      email,
      bio,
    },
    social_links,
  } = profile;

  useEffect(() => {
    if (access_token) {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/users/get-profile", {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);

  const handleCharacterChange = (e) => {
    setCharctersLeft(bioLimit - e.target.value.length);
  };

  const handleImagePreview = (e) => {
    let img = e.target.files[0];

    profileImgEle.current.src = URL.createObjectURL(img);

    setUpdatedProfileImg(img);
  };

  const handleImageUpload = (e) => {
    e.preventDefault();

    if (updatedProfileImg) {
      let loadingToast = toast.loading("Uploading....");
      e.target.setAttribute("disabled", true);

      uploadImage(updatedProfileImg)
        .then((url) => {
          if (url) {
            axios
              .post(
                import.meta.env.VITE_SERVER_DOMAIN +
                  "/users/update-profile-img",
                { url },
                {
                  headers: {
                    Authorization: `Bearer ${access_token}`,
                  },
                },
              )
              .then(({ data }) => {
                let newUserAuth = {
                  ...userAuth,
                  profile_img: data.profile_img,
                };

                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);

                setUpdatedProfileImg(null);

                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                toast.success("Uploaded 👍");
              })
              .catch(({ response }) => {
                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                toast.error(response.data.error);
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let form = new FormData(editProfileForm.current);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let {
      fullname,
      username,
      bio,
      youtube,
      facebook,
      twitter,
      github,
      instagram,
      website,
    } = formData;

    if (fullname.length < 3) {
      return toast.error("Full name should be at least 3 letters long");
    }

    if (username.length < 3) {
      return toast.error("Username should be al least 3 letters long");
    }
    if (bio.length > bioLimit) {
      return toast.error(`Bio should not be more than ${bioLimit}`);
    }

    let loadingToast = toast.loading("Updating.....");
    e.target.setAttribute("disabled", true);

    axios
      .patch(
        import.meta.env.VITE_SERVER_DOMAIN + "/users/update-profile",
        {
          username,
          bio,
          fullname,
          social_links: {
            youtube,
            facebook,
            twitter,
            github,
            instagram,
            website,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(({ data }) => {
        if (
          userAuth.username != data.username ||
          userAuth.fullname != data.fullname
        ) {
          let newUserAuth = {
            ...userAuth,
            username: data.username,
            fullname: data.fullname,
          };

          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }

        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Profile Updated");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileForm}>
          <Toaster />

          <div className="mb-8">
            <h1 className="text-[24px] font-bold text-black tracking-tight">
              Edit Profile
            </h1>
            <p className="text-[14px] text-dark-grey mt-2">Update your personal details and public profile.</p>
          </div>

          <div className="flex flex-col xl:flex-row items-start gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-6 w-full xl:w-[320px] flex-none bg-black/[0.02] backdrop-blur-xl border border-grey rounded-[2rem] p-8 shadow-sm">
              <label
                htmlFor="uploadImg"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden border-4 border-white dark:border-black shadow-lg cursor-pointer group"
              >
                <div className="w-full h-full absolute top-0 left-0 flex flex-col items-center justify-center text-white bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                  <i className="fi fi-rr-camera text-2xl mb-2"></i>
                  <span className="text-[13px] font-medium">Change photo</span>
                </div>
                <img
                  ref={profileImgEle}
                  src={profile_img}
                  className="w-full h-full object-cover"
                  alt="profile"
                />
              </label>
              <input
                type="file"
                id="uploadImg"
                accept=".jpeg, .png, .jpg"
                hidden
                onChange={handleImagePreview}
              />
              <div className="text-center w-full">
                <button
                  className="w-full py-3 px-6 rounded-2xl bg-black text-white text-[14px] font-medium hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-black/10"
                  onClick={handleImageUpload}
                >
                  Upload new photo
                </button>
                <p className="text-[12px] text-dark-grey mt-4">
                  JPG, GIF or PNG. Max size of 800K.
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="flex-1 w-full space-y-8 bg-black/[0.02] backdrop-blur-xl border border-grey rounded-[2rem] p-8 md:p-10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[13px] text-black font-semibold mb-2.5 block">
                    Full name
                  </label>
                  <InputBox
                    name="fullname"
                    type="text"
                    value={fullname}
                    placeholder="Your full name"
                    icon="fi-rr-user"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-black font-semibold mb-2.5 block">
                    Email address
                  </label>
                  <InputBox
                    name="email"
                    type="email"
                    value={email}
                    placeholder="Email address"
                    icon="fi-rr-envelope"
                    disable={true}
                  />
                </div>
              </div>

              <div>
                <label className="text-[13px] text-black font-semibold mb-2.5 block">
                  Username
                </label>
                <InputBox
                  type="text"
                  name="username"
                  value={profile_username}
                  placeholder="Username"
                  icon="fi-rr-at"
                />
                <p className="text-[12px] text-dark-grey mt-2">
                  This will be your public URL and how others mention you.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-[13px] text-black font-semibold block">
                    Bio
                  </label>
                  <span className="text-[12px] text-dark-grey">
                    {charactersLeft} characters left
                  </span>
                </div>
                <textarea
                  name="bio"
                  maxLength={bioLimit}
                  defaultValue={bio}
                  className="w-full bg-white border border-grey focus:border-black rounded-2xl h-36 resize-none leading-relaxed p-5 text-[14px] text-black placeholder:text-dark-grey/50 focus:outline-none transition-all duration-200 shadow-sm"
                  placeholder="Tell us a bit about yourself..."
                  onChange={handleCharacterChange}
                ></textarea>
              </div>

              <div className="pt-8 border-t border-grey">
                <h2 className="text-[15px] text-black font-bold mb-6 flex items-center gap-2">
                  <i className="fi fi-rr-link-alt text-dark-grey"></i>
                  Social Profiles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {Object.keys(social_links).map((key, i) => {
                    let link = social_links[key];
                    return (
                      <div key={i}>
                        <label className="text-[12px] text-black font-semibold mb-2 block capitalize">
                          {key}
                        </label>
                        <InputBox
                          name={key}
                          type="text"
                          value={link}
                          placeholder="https://"
                          icon={
                            "fi " +
                            (key !== "website"
                              ? "fi-brands-" + key
                              : "fi-rr-globe")
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6">
                <button
                  className="w-full md:w-auto px-10 py-3.5 rounded-2xl bg-black text-white text-[14px] font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-black/10"
                  type="submit"
                  onClick={handleSubmit}
                >
                  Save all changes
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
