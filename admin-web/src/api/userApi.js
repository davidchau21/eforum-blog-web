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
  disableUser: (id) => {
    return handleResponse(axiosClient.post(`/users/admin/disable-user/${id}`));
  },
  deleteUser: (id) => {
    return handleResponse(axiosClient.delete(`/users/admin/users/${id}`));
  },
  getMyProfile: () => {
    return handleResponse(axiosClient.get("/users/admin/me"));
  },
};

export default userApi;
