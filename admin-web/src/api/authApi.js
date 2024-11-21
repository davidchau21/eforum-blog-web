import axiosClient, { handleResponse } from "./axiosClient";

const authApi = {
  login: (body) => {
    return handleResponse(axiosClient.post("/signin", body));
  },
};

export default authApi;
