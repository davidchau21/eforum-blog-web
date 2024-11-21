import axiosClient, { handleResponse } from "./axiosClient";

const staffApi = {
  getAllStaffs: (params) => {
    return handleResponse(axiosClient.get("/admin/user", { params }));
  },
  createStaff: (body) => {
    return handleResponse(axiosClient.post("/admin/user", body));
  },
  getStaffDetail: (id) => {
    return handleResponse(axiosClient.get(`/admin/user/${id}`));
  },
  updateStaff: (id, body) => {
    return handleResponse(axiosClient.post(`/admin/user/${id}`, body));
  },
};

export default staffApi;
