import axiosClient, { handleResponse } from "./axiosClient";

const areaApi = {
  getAllAreas: () => {
    return handleResponse(axiosClient.get("/admin/area"));
  },
  createArea: (body) => {
    return handleResponse(axiosClient.post("/admin/area", body));
  },
  updateArea: (id, body) => {
    return handleResponse(axiosClient.post(`/admin/area/update/${id}`, body));
  },
  getAreaById: (id) => {
    return handleResponse(axiosClient.get(`/admin/area/${id}`));
  },
  createTable: (body) => {
    return handleResponse(axiosClient.post("/admin/table", body));
  },
  updateTable: (id, body) => {
    return handleResponse(axiosClient.post(`/admin/table/update/${id}`, body));
  },
  deleteTable: (id) => {
    return handleResponse(axiosClient.delete(`/admin/table/${id}`));
  },
};

export default areaApi;
