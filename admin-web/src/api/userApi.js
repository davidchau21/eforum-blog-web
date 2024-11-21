import axiosClient, { handleResponse } from "./axiosClient";

const userApi = {
  getAllUser: (params) => {
    return handleResponse(axiosClient.get("/users/admin/users", { params }));
  },
  createUser: (body) => {
    return handleResponse(axiosClient.post("/users/admin/users", body));
  },
  getUserDetail: (id) => {
    return handleResponse(axiosClient.get(`/users/admin/users/${id}`));
  },
  updateUser: (id, body) => {
    return handleResponse(axiosClient.post(`/users/admin/users/${id}`, body));
  },
  blockComment: (id) => {
    return handleResponse(axiosClient.post(`/users/admin/block-comment/${id}`));
  },
};

export default userApi;
