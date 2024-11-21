import axiosClient, { handleResponse } from "./axiosClient";

const uploadApi = {
  getUploadUrl: () => {
    return handleResponse(axiosClient.get("/get-upload-url"));
  },
};

export default uploadApi;
