/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useEffect, useState, useContext } from "react";
import socketIOClient from "socket.io-client";
import { UserContext } from "../App";

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
      });

      newSocket.on("newMessage", (data) => {
        setUserAuth((prev) => {
          if (data.receiverId === prev._id) {
            const currentCount =
              typeof prev.unread_messages === "number"
                ? prev.unread_messages
                : 0;
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
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
