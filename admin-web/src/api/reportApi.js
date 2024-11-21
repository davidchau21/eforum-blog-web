import axiosClient, { handleResponse } from "./axiosClient";

const reportApi = {
  totalUser: () => {
    return handleResponse(axiosClient.get("/reports/total-user"));
  },
  totalBlog: () => {
    return handleResponse(axiosClient.get("/reports/total-blog"));
  },
  totalComment: () => {
    return handleResponse(axiosClient.get("/reports/total-comment"));
  },
};

export default reportApi;
