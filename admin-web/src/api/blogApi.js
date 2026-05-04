import axiosClient, { handleResponse } from "./axiosClient";

const blogApi = {
  getAllBlogs: (params) => {
    return handleResponse(axiosClient.get("/blogs/list", { params }));
  },
  createorUpdateBlog: (body) => {
    return handleResponse(axiosClient.post("/blogs/create-blog", body));
  },
  getId: (blogId) => {
    return handleResponse(axiosClient.get(`/blogs/id/${blogId}`));
  },
  deleteBlog: (id) => {
    return handleResponse(axiosClient.delete(`/blogs/${id}`));
  },
  removeReportBlog: (id) => {
    return handleResponse(axiosClient.post(`/blogs/remove/report/${id}`));
  },
  activeBlog: (id) => {
    return handleResponse(axiosClient.post(`/blogs/activate/${id}`));
  },
};

export default blogApi;
