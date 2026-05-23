import axiosClient, { handleResponse } from "./axiosClient";

const roleApi = {
  getAllRoles: () => {
    return handleResponse(axiosClient.get("/roles"));
  },
  getAllPermissions: () => {
    return handleResponse(axiosClient.get("/roles/permissions"));
  },
  createRole: (body) => {
    return handleResponse(axiosClient.post("/roles", body));
  },
  updateRolePermissions: (id, body) => {
    return handleResponse(axiosClient.put(`/roles/${id}`, body));
  },
  deleteRole: (id) => {
    return handleResponse(axiosClient.delete(`/roles/${id}`));
  },
};

export default roleApi;
