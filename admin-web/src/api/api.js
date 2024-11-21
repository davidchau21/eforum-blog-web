import axios from "axios";
import commonConstants from "@/app/constant";

class Api {
  _instance;
  _logOutFn;

  constructor() {
    this._instance = axios.create({
      baseURL: import.meta.env.VITE_SERVER_DOMAIN,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  init() {
    this._instance.interceptors.request.use((config) => {
      const value = localStorage.getItem(commonConstants.LOCAL_STORAGE_KEY);
      config.headers.Authorization = `Bearer ${
        value ? JSON.parse(value).accessToken : ""
      }`;
      return config;
    });

    this._instance.interceptors.response.use(
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

        if (data.status === 401 || data.status === 403) {
          localStorage.removeItem(commonConstants.LOCAL_STORAGE_KEY);
        }

        return Promise.reject({
          ok: false,
          errors: data,
          status,
        });
      }
    );
  }

  logOut() {
    /// remove token
    /// wipe data
    /// call api log out if needed
    /// redirect to login if needed
  }

  get instance() {
    return this._instance;
  }
}

export const api = new Api();
