import axios from "axios";
import commonConstants from "@/app/constant";

const instance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_DOMAIN,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const value = localStorage.getItem(commonConstants.LOCAL_STORAGE_KEY);
  config.headers.Authorization = `Bearer ${
    value ? JSON.parse(value).accessToken : ""
  }`;
  return config;
});

instance.interceptors.response.use(
  (value) => {
    return {
      ok: true,
      body: value.data,
      status: value.status,
      total: value.headers["x-total-count"],
    };
  },
  (error) => {
    const { data, status } = error.response;
    if (
      data.status === 401 ||
      data.status === 403 ||
      data.error === "Access token is invalid"
    ) {
      localStorage.removeItem(commonConstants.LOCAL_STORAGE_KEY);
      window.location.href = "/login";
    }

    return Promise.reject({
      ok: false,
      errors: data,
      status,
    });
  }
);

export const handleResponse = (response) => {
  return response.then((res) => res).catch((res) => res);
};

export default instance;
