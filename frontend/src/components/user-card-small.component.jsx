/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const UserCardSmall = ({ user }) => {
  let {
    personal_info: { fullname, username, profile_img, bio },
  } = user;

  return (
    <Link
      to={`/user/${username}`}
      className="flex gap-3.5 items-center mb-4 border-b border-grey/50 pb-4 last:border-none last:pb-0"
    >
      <img
        src={profile_img}
        className="w-10 h-10 rounded-full object-cover border border-slate-200/20"
        alt={fullname}
      />

      <div>
        <h1 className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{fullname}</h1>
        <p className="text-dark-grey text-xs">@{username}</p>
        {bio && (
          <p className="text-dark-grey mt-0.5 text-xs line-clamp-1 font-light">{bio}</p>
        )}
      </div>
    </Link>
  );
};

export default UserCardSmall;
