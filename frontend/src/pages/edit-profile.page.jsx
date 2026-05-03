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

          <h1 className="hidden md:block text-[22px] font-bold text-black mb-12">
            Edit Profile
          </h1>

          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-16">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-5 lg:w-[200px] flex-none">
              <label
                htmlFor="uploadImg"
                className="relative block w-44 h-44 bg-grey rounded-full overflow-hidden border-2 border-grey shadow-lg cursor-pointer group"
              >
                <div className="w-full h-full absolute top-0 left-0 flex flex-col items-center justify-center text-white bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <i className="fi fi-rr-camera text-xl mb-1"></i>
                  <span className="text-[12px] font-medium">Change photo</span>
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
              <button
                className="w-full py-2 px-4 rounded-full border border-grey bg-grey text-black text-[14px] font-medium hover:bg-black hover:text-white transition-all active:scale-95"
                onClick={handleImageUpload}
              >
                Upload photo
              </button>
              <p className="text-[13px] text-dark-grey text-center leading-relaxed">
                JPG or PNG. Max 2 MB.
              </p>
            </div>

            {/* Form fields */}
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[13px] text-dark-grey font-medium mb-2 block">
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
                  <label className="text-[13px] text-dark-grey font-medium mb-2 block">
                    Email
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
                <label className="text-[13px] text-dark-grey font-medium mb-2 block">
                  Username
                </label>
                <InputBox
                  type="text"
                  name="username"
                  value={profile_username}
                  placeholder="Username"
                  icon="fi-rr-at"
                />
                <p className="text-[12px] text-dark-grey mt-1.5 px-1">
                  Used for searches and mentions.
                </p>
              </div>

              <div>
                <label className="text-[13px] text-dark-grey font-medium mb-2 block">
                  Bio
                </label>
                <textarea
                  name="bio"
                  maxLength={bioLimit}
                  defaultValue={bio}
                  className="input-box h-36 resize-none leading-6 p-4"
                  placeholder="Tell us a bit about yourself..."
                  onChange={handleCharacterChange}
                ></textarea>
                <p className="text-[12px] text-dark-grey mt-1 text-right">
                  {charactersLeft} characters left
                </p>
              </div>

              <div className="pt-4 border-t border-grey">
                <h2 className="text-[13px] text-dark-grey font-semibold mb-5">
                  Social links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {Object.keys(social_links).map((key, i) => {
                    let link = social_links[key];
                    return (
                      <div key={i}>
                        <label className="text-[12px] text-dark-grey font-medium mb-1.5 block capitalize">
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

              <button
                className="btn-dark px-10 mt-2"
                type="submit"
                onClick={handleSubmit}
              >
                Save changes
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
