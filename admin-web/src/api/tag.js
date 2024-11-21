import axiosClient, { handleResponse } from "./axiosClient";

const tagApi = {
  getAllTags: (params) => {
    return handleResponse(axiosClient.get("/tags", { params }));
  },
  createTag: (body) => {
    return handleResponse(axiosClient.post("/tags", body));
  },
  updateTag: (id, body) => {
    return handleResponse(axiosClient.put(`/tags/${id}`, body));
  },
  deleteTag: (id) => {
    return handleResponse(axiosClient.delete(`/tags/${id}`));
  },
};

export default tagApi;
