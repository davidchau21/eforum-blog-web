import React, { createContext, useEffect, useState, useContext } from "react";
import socketIOClient from "socket.io-client";
import { UserContext } from "../App";

export const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const { userAuth } = useContext(UserContext);

  useEffect(() => {
    if (userAuth) {
      const newSocket = socketIOClient("http://localhost:3000", {
        auth: {
          token: userAuth?._id,
        },
      });

      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect()
      };
    }
  }, [userAuth]);
  const value = { socket };
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
