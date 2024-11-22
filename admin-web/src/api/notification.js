import axiosClient, { handleResponse } from "./axiosClient";

const notificationApi = {
  getAllNotification: (params) => {
    return handleResponse(axiosClient.get("/notifications", { params }));
  },
  createNotification: (body) => {
    return handleResponse(axiosClient.post("/notifications", body));
  },
//   updateNoti: (id, body) => {
//     return handleResponse(axiosClient.put(`/notifications/${id}`, body));
//   },
  deleteNotification: (id) => {
    return handleResponse(axiosClient.delete(`/notifications/${id}`));
  },
};

export default notificationApi;
