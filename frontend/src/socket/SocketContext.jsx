/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useEffect, useState, useContext } from "react";
import socketIOClient from "socket.io-client";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";

export const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const { userAuth, setUserAuth } = useContext(UserContext);

  useEffect(() => {
    if (userAuth && userAuth.access_token) {
      // Request Notification Permission
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }

      const newSocket = socketIOClient(import.meta.env.VITE_SERVER_DOMAIN, {
        auth: {
          token: userAuth?._id,
        },
      });

      setSocket(newSocket);

      newSocket.on("newNotification", (data) => {
        setUserAuth((prev) => {
          const currentCount =
            typeof prev.new_notification_available === "number"
              ? prev.new_notification_available
              : 0;
          return { ...prev, new_notification_available: currentCount + 1 };
        });

        const notificationText = data.user
          ? `${data.user.personal_info.fullname} ${data.type === "like" ? "liked" : data.type === "comment" ? "commented" : data.type === "reply" ? "replied" : data.type === "share" ? "shared" : data.type === "follow" ? "followed" : "interacted with"} your post`
          : "New interaction received";

        // Custom In-app Toast with Close Button
        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={data.user?.personal_info.profile_img || "/logo.png"}
                      alt=""
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      🔔 New Notification
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {notificationText}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <i className="fi fi-rr-cross text-[10px]"></i>
                </button>
              </div>
            </div>
          ),
          { position: "bottom-left", duration: 5000 },
        );

        // Browser Notification
        if (
          "Notification" in window &&
          Notification.permission === "granted" &&
          document.visibilityState !== "visible"
        ) {
          const notification = new Notification("EduBlog - New Interaction", {
            body: notificationText,
            icon: data.user?.personal_info.profile_img || "/logo.png",
          });
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        }
      });

      newSocket.on("newMessage", (data) => {
        setUserAuth((prev) => {
          if (data.receiverId === prev._id) {
            const currentCount =
              typeof prev.unread_messages === "number"
                ? prev.unread_messages
                : 0;

            // Custom In-app Toast for Message
            toast.custom(
              (t) => (
                <div
                  className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <img
                          className="h-10 w-10 rounded-full"
                          src="/logo.png"
                          alt=""
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          💬 New Message
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {data.message.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-gray-200">
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <i className="fi fi-rr-cross text-[10px]"></i>
                    </button>
                  </div>
                </div>
              ),
              { position: "bottom-left", duration: 5000 },
            );

            // Browser Notification for Message
            if (
              "Notification" in window &&
              Notification.permission === "granted" &&
              document.visibilityState !== "visible"
            ) {
              const notification = new Notification("EduBlog - New Message", {
                body: data.message,
                icon: "/logo.png",
              });
              notification.onclick = () => {
                window.focus();
                notification.close();
              };
            }

            return { ...prev, unread_messages: currentCount + 1 };
          }
          return prev;
        });
      });

      newSocket.on("online-users", (users) => {
        setOnlineUsers(users);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [userAuth?.access_token, userAuth?._id, setUserAuth]);

  const value = { socket, onlineUsers };
  return (
    <SocketContext.Provider value={value}>
      <Toaster />
      {children}
    </SocketContext.Provider>
  );
};
