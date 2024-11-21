import axiosClient, { handleResponse } from "./axiosClient";

const commentApi = {
  getAlls: (params) => {
    return handleResponse(axiosClient.get("/comments", { params }));
  },
  delete: (id) => {
    return handleResponse(axiosClient.delete(`/comments/${id}`));
  },
  removeReportBlog: (id) => {
    return handleResponse(axiosClient.post(`/comments/remove/report/${id}`));
  },
};

export default commentApi;
