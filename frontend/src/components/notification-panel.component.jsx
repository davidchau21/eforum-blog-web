/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { UserContext } from "../App";
import { SocketContext } from "../socket/SocketContext";
import axios from "axios";
import NotificationCardCompact from "./notification-card-compact.component";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getTranslations } from "../../translations";
import Loader from "./loader.component";

const NotificationPanel = ({ closePanel }) => {
  const {
    userAuth,
    userAuth: { access_token, language },
    setUserAuth,
  } = useContext(UserContext);
  const { socket } = useContext(SocketContext);
  const [notifications, setNotifications] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);

  const translations = getTranslations(language);

  const fetchNotifications = useCallback(
    async (pageNum) => {
      if (loading || (!hasMore && pageNum !== 1)) return;
      setLoading(true);
      try {
        const { data } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/notifications",
          { page: pageNum, filter: "all", deletedDocCount: 0 },
          { headers: { Authorization: `Bearer ${access_token}` } },
        );

        const newNotifs = data.notifications;

        if (pageNum === 1) {
          setNotifications(newNotifs);
          // Clear the indicator count when opening the panel
          setUserAuth((prev) => ({ ...prev, new_notification_available: 0 }));
        } else {
          setNotifications((prev) => [...prev, ...newNotifs]);
        }

        setHasMore(newNotifs.length === 10);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    },
    [access_token, loading, hasMore],
  );

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  // Socket Listener for Real-time prepending
  useEffect(() => {
    if (socket) {
      const handleNewNotif = (data) => {
        // If the panel is open, we can prepend it directly
        // We might need to fetch the full notification object if the socket only sends IDs
        // But usually, we just refresh the first page or use the data sent.
        // For high-fidelity, let's just refresh page 1 if a new one arrives
        fetchNotifications(1);
      };
      socket.on("newNotification", handleNewNotif);
      return () => socket.off("newNotification", handleNewNotif);
    }
  }, [socket, fetchNotifications]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (
        scrollTop + clientHeight >= scrollHeight - 20 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => {
          const nextPage = prev + 1;
          fetchNotifications(nextPage);
          return nextPage;
        });
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      // Assuming there's an endpoint to mark all as read
      // If not, we just update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
      // Optional: call API to mark as read on server
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute top-16 right-0 w-[380px] max-w-[95vw] bg-page-secondary border border-subtle rounded-2xl shadow-2xl z-[100] overflow-hidden flex flex-col shadow-emerald-500/5"
    >
      {/* Header */}
      <div className="p-5 border-b border-subtle flex items-center justify-between bg-page-secondary/50">
        <h3 className="font-outfit font-bold text-sm text-title tracking-tight">
          {translations.recentNotifications}
        </h3>
        <button
          onClick={markAllAsRead}
          className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest"
        >
          {translations.markAllAsRead || "Mark Read"}
        </button>
      </div>

      {/* List */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="max-h-[450px] overflow-y-auto scrollbar-hide py-2"
      >
        {notifications === null ? (
          <div className="p-10 flex flex-col items-center gap-4">
            <Loader />
            <p className="text-body text-sm font-medium animate-pulse">
              Fetching updates...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-body text-sm font-medium">
              No notifications yet.
            </p>
          </div>
        ) : (
          <>
            {notifications.map((notif, i) => (
              <NotificationCardCompact
                key={notif._id + i}
                data={notif}
                onClick={closePanel}
              />
            ))}
            {loading && (
              <div className="p-4 flex justify-center">
                <Loader />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <Link
        to="/dashboard/notifications"
        onClick={closePanel}
        className="p-4 border-t border-subtle text-center text-sm font-bold text-title hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest bg-page-secondary/50"
      >
        {translations.seeAllNotifications || "See all notifications"}
      </Link>
    </motion.div>
  );
};

export default NotificationPanel;
