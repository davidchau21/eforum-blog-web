/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const UserCardSmall = ({ user }) => {
  let {
    personal_info: { fullname, username, profile_img, bio },
  } = user;

  return (
    <Link
      to={`/user/${username}`}
      className="flex gap-5 items-center mb-5 border-b border-grey pb-5 last:border-none"
    >
      <img
        src={profile_img}
        className="w-14 h-14 rounded-full object-cover"
        alt={fullname}
      />

      <div>
        <h1 className="font-medium text-xl line-clamp-1">{fullname}</h1>
        <p className="text-dark-grey text-sm">@{username}</p>
        {bio && (
          <p className="text-dark-grey mt-1 text-sm line-clamp-1">{bio}</p>
        )}
      </div>
    </Link>
  );
};

export default UserCardSmall;
