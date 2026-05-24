import axiosClient, { handleResponse } from "./axiosClient";

const activityLogApi = {
  getAllActivityLogs: (params) => {
    return handleResponse(axiosClient.get("/logs", { params }));
  },
};

export default activityLogApi;
