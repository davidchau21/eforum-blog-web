/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { getTranslations } from "../../translations";
import { motion } from "framer-motion";

const WritePostCard = ({ openModal }) => {
  const {
    userAuth: { access_token, profile_img, language },
  } = useContext(UserContext);
  const translations = getTranslations(language);

  if (!access_token) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-page-secondary border border-subtle rounded-3xl p-5 mb-8 shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative cursor-pointer"
      onClick={openModal}
    >
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors" />

      <div className="flex items-center gap-4">
        <img
          src={profile_img}
          className="w-12 h-12 rounded-full object-cover flex-none border-2 border-emerald-500/20"
          alt="User profile"
        />

        <div className="flex-grow bg-grey/50 dark:bg-zinc-800/50 rounded-full py-3 px-6 text-body/70 text-sm font-medium hover:bg-grey dark:hover:bg-zinc-800 transition-colors text-left">
          {translations.whatsOnYourMind}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-transparent hover:bg-emerald-500/5 hover:border-emerald-500/10 text-body text-xs font-bold transition-all">
          <i className="fi fi-rr-picture text-emerald-500 text-lg"></i>
          <span>Photo</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-transparent hover:bg-emerald-500/5 hover:border-emerald-500/10 text-body text-xs font-bold transition-all">
          <i className="fi fi-rr-play-alt text-emerald-500 text-lg"></i>
          <span>Video</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-transparent hover:bg-emerald-500/5 hover:border-emerald-500/10 text-body text-xs font-bold transition-all ml-auto">
          <i className="fi fi-rr-grin text-emerald-500 text-lg"></i>
          <span>Feeling</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WritePostCard;
