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
  createPermission: (body) => {
    return handleResponse(axiosClient.post("/roles/permissions", body));
  },
  updatePermission: (id, body) => {
    return handleResponse(axiosClient.put(`/roles/permissions/${id}`, body));
  },
  deletePermission: (id) => {
    return handleResponse(axiosClient.delete(`/roles/permissions/${id}`));
  },
};

export default roleApi;
