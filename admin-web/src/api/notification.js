import axiosClient, { handleResponse } from "./axiosClient";

const notificationApi = {
  getAllNotification: (params) => {
    return handleResponse(axiosClient.get("/alert", { params }));
  },
  createNotification: (body) => {
    return handleResponse(axiosClient.post("/alert", body));
  },
//   updateNoti: (id, body) => {
//     return handleResponse(axiosClient.put(`/notifications/${id}`, body));
//   },
  deleteNotification: (id) => {
    return handleResponse(axiosClient.delete(`/alert/${id}`));
  },
};

export default notificationApi;
