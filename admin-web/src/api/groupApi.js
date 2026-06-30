import axiosClient, { handleResponse } from "./axiosClient";

const groupApi = {
  getAllGroups: (params) => {
    return handleResponse(axiosClient.get("/groups", { params }));
  },
  toggleGroupStatus: (id) => {
    return handleResponse(axiosClient.post(`/groups/activate/${id}`));
  },
  deleteGroup: (id) => {
    return handleResponse(axiosClient.delete(`/groups/${id}`));
  },
};

export default groupApi;
