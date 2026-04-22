/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import Loader from "./loader.component";
import UserCardSmall from "./user-card-small.component.jsx";
import NoDataMessage from "./nodata.component";

const UserListModal = ({ type, userId, onClose, title }) => {
  const [users, setUsers] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const limit = 10; // Can be passed as prop if needed

  const observer = useRef();
  const lastUserRef = useRef();

  const fetchUsers = (pageNumber = 1) => {
    setLoading(true);
    const endpoint =
      type === "followers" ? "/users/get-followers" : "/users/get-following";

    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + endpoint, {
        params: {
          user_id: userId,
          page: pageNumber,
          limit: limit,
        },
      })
      .then(({ data }) => {
        const newList = type === "followers" ? data.followers : data.following;

        if (newList.length < limit) {
          setHasMore(false);
        }

        if (pageNumber === 1) {
          setUsers(newList);
        } else {
          setUsers((prev) => [...prev, ...newList]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers(1);
  }, [type, userId]);

  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
        fetchUsers(page + 1);
      }
    });

    if (lastUserRef.current) observer.current.observe(lastUserRef.current);
  }, [loading, hasMore]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <AnimationWrapper
        className="bg-white w-full max-w-md max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-grey flex justify-between items-center">
          <h1 className="text-xl font-bold capitalize">{title}</h1>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-grey/50 flex items-center justify-center hover:bg-grey transition-colors"
          >
            <i className="fi fi-rr-cross text-sm"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {users == null ? (
            <Loader />
          ) : users.length ? (
            <>
              {users.map((user, i) => (
                <AnimationWrapper
                  key={i}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <div onClick={onClose}>
                    <UserCardSmall user={user} />
                  </div>
                </AnimationWrapper>
              ))}
              {/* Observer Target */}
              <div ref={lastUserRef} className="h-1"></div>
            </>
          ) : (
            <NoDataMessage message={`No ${type} yet`} />
          )}

          {loading && (
            <div className="py-4">
              <Loader />
            </div>
          )}
        </div>
      </AnimationWrapper>
    </div>
  );
};

export default UserListModal;
