import commonConstants from "@/app/constant";
import { useCallback } from "react";

const useLocalStorage = () => {
  const getLocalStorage = useCallback(
    (key = commonConstants.LOCAL_STORAGE_KEY) => {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : undefined;
    },
    []
  );

  const setLocalStorage = useCallback(
    ({ value, key = commonConstants.LOCAL_STORAGE_KEY }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    []
  );

  const removeLocalStorage = useCallback(
    (key = commonConstants.LOCAL_STORAGE_KEY) => {
      localStorage.removeItem(key);
    },
    []
  );

  return {
    getLocalStorage,
    setLocalStorage,
    removeLocalStorage,
  };
};

export default useLocalStorage;
