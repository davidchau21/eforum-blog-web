import axios from "axios";

const API_BASE = import.meta.env.VITE_SERVER_DOMAIN;

const getHeaders = (token, contentType = "application/json") => {
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  return { headers };
};

// ----------------- GROUPS CATALOG SERVICES -----------------

/**
 * Fetch a paginated list of groups with a search query.
 */
export const listGroups = async (searchQuery, pageNum, limit, token, filter = "all") => {
  const { data } = await axios.get(
    `${API_BASE}/groups/list?search=${searchQuery}&page=${pageNum}&limit=${limit}&filter=${filter}`,
    getHeaders(token)
  );
  return data;
};

/**
 * Create a new learning group.
 */
export const createGroup = async (groupForm, token) => {
  const { data } = await axios.post(
    `${API_BASE}/groups/create`,
    groupForm,
    getHeaders(token)
  );
  return data;
};

// ----------------- GROUP DETAILS & SETTINGS SERVICES -----------------

/**
 * Fetch core information of a specific group.
 */
export const getGroupDetails = async (id, token) => {
  const { data } = await axios.get(
    `${API_BASE}/groups/id/${id}`,
    getHeaders(token)
  );
  return data;
};

/**
 * Update group information and permissions.
 */
export const updateGroupSettings = async (id, payload, token) => {
  const { data } = await axios.put(
    `${API_BASE}/groups/id/${id}/settings`,
    payload,
    getHeaders(token)
  );
  return data;
};

// ----------------- DISCUSSION & BLOG SERVICES -----------------

/**
 * Fetch blog posts associated with a group.
 */
export const getGroupBlogs = async (id, token, author = null, limit = null) => {
  let url = `${API_BASE}/groups/id/${id}/blogs`;
  const params = [];
  if (author) params.push(`author=${author}`);
  if (limit) params.push(`limit=${limit}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  const { data } = await axios.get(url, getHeaders(token));
  return data;
};

/**
 * Fetch the logged-in user's own blogs in a group with specific filter.
 */
export const getUserGroupBlogs = async (id, filter, page, limit, token, search = "") => {
  const { data } = await axios.get(
    `${API_BASE}/groups/id/${id}/my-blogs?filter=${filter}&page=${page}&limit=${limit}&search=${search}`,
    getHeaders(token)
  );
  return data;
};

// ----------------- MEMBERSHIP & ROLE SERVICES -----------------

/**
 * Fetch members of a group filtered by status (JOINED, PENDING, etc).
 */
export const getGroupMembers = async (id, status, token) => {
  const { data } = await axios.get(
    `${API_BASE}/groups/id/${id}/members?status=${status}`,
    getHeaders(token)
  );
  return data;
};

/**
 * Request to join a group.
 */
export const joinGroup = async (id, token) => {
  const { data } = await axios.post(
    `${API_BASE}/groups/id/${id}/join`,
    {},
    getHeaders(token)
  );
  return data;
};

/**
 * Request to leave a group.
 */
export const leaveGroup = async (id, token) => {
  const { data } = await axios.post(
    `${API_BASE}/groups/id/${id}/leave`,
    {},
    getHeaders(token)
  );
  return data;
};

/**
 * Toggle mute notifications status for a group.
 */
export const toggleMuteGroupNotifications = async (id, token) => {
  const { data } = await axios.post(
    `${API_BASE}/groups/id/${id}/toggle-mute`,
    {},
    getHeaders(token)
  );
  return data;
};

/**
 * Approve a member's pending request.
 */
export const approveRequest = async (id, userId, token) => {
  const { data } = await axios.post(
    `${API_BASE}/groups/id/${id}/members/${userId}/approve`,
    {},
    getHeaders(token)
  );
  return data;
};

/**
 * Remove a member from group or reject a join request.
 */
export const removeMember = async (id, userId, token) => {
  const { data } = await axios.delete(
    `${API_BASE}/groups/id/${id}/members/${userId}`,
    getHeaders(token)
  );
  return data;
};

/**
 * Change member role in the group.
 */
export const changeMemberRole = async (id, userId, newRole, token) => {
  const { data } = await axios.put(
    `${API_BASE}/groups/id/${id}/members/${userId}/role`,
    { role: newRole },
    getHeaders(token)
  );
  return data;
};

// ----------------- DOCUMENTS & STORAGE SERVICES -----------------

/**
 * Fetch documents list shared in the group.
 */
export const getGroupDocuments = async (id, token) => {
  const { data } = await axios.get(
    `${API_BASE}/groups/id/${id}/documents`,
    getHeaders(token)
  );
  return data;
};

/**
 * Upload a document to the group repository.
 */
export const uploadGroupDocument = async (formData, token) => {
  const { data } = await axios.post(
    `${API_BASE}/documents/`,
    formData,
    getHeaders(token, "multipart/form-data")
  );
  return data;
};

/**
 * Log a download statistic trigger for the file.
 */
export const triggerDownload = async (docId) => {
  const { data } = await axios.post(
    `${API_BASE}/documents/${docId}/download`
  );
  return data;
};

/**
 * Delete group vĩnh viễn.
 */
export const deleteGroup = async (id, token) => {
  const { data } = await axios.delete(
    `${API_BASE}/groups/id/${id}`,
    getHeaders(token)
  );
  return data;
};

/**
 * Mời thành viên mới vào nhóm.
 */
export const inviteMember = async (id, targetUserId, token) => {
  const { data } = await axios.post(
    `${API_BASE}/groups/id/${id}/invite`,
    { targetUserId },
    getHeaders(token)
  );
  return data;
};

/**
 * Fetch pending blogs in the group (waiting for approval).
 */
export const getPendingBlogs = async (id, token) => {
  const { data } = await axios.get(
    `${API_BASE}/groups/id/${id}/blogs/pending`,
    getHeaders(token)
  );
  return data;
};

/**
 * Approve a pending blog post.
 */
export const approveBlog = async (id, blogId, token) => {
  const { data } = await axios.post(
    `${API_BASE}/groups/id/${id}/blogs/${blogId}/approve`,
    {},
    getHeaders(token)
  );
  return data;
};

/**
 * Reject a pending blog post.
 */
export const rejectBlog = async (id, blogId, token) => {
  const { data } = await axios.delete(
    `${API_BASE}/groups/id/${id}/blogs/${blogId}/reject`,
    getHeaders(token)
  );
  return data;
};

/**
 * Fetch group statistics and dashboard details.
 */
export const getGroupStats = async (id, range, token, startDate = null, endDate = null) => {
  let url = `${API_BASE}/groups/id/${id}/stats?range=${range}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  const { data } = await axios.get(url, getHeaders(token));
  return data;
};
