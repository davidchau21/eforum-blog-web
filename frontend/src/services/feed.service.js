import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";

const API_BASE = import.meta.env.VITE_SERVER_DOMAIN;

const getHeaders = (token) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};

// ─── Tags ────────────────────────────────────────────────────────────────────

/**
 * Fetch all available subject tags sorted alphabetically.
 */
export const fetchTags = async () => {
  const { data } = await axios.get(`${API_BASE}/tags?limit=0`);
  const list = data.list || [];
  return list.sort((a, b) => a.tag_name.localeCompare(b.tag_name));
};

// ─── Blog Feeds ───────────────────────────────────────────────────────────────

/**
 * Fetch paginated latest (main feed) blogs.
 */
export const fetchLatestBlogs = async (page = 1, token = null, prevState = null) => {
  const { data } = await axios.post(
    `${API_BASE}/blogs/latest-blogs`,
    { page },
    getHeaders(token)
  );
  return filterPaginationData({
    state: prevState,
    data: data.blogs,
    page,
    countRoute: "/blogs/all-latest-blogs-count",
    user: token,
  });
};

/**
 * Fetch blogs from people the user follows.
 */
export const fetchFollowingBlogs = async (page = 1, token, prevState = null) => {
  const { data } = await axios.post(
    `${API_BASE}/blogs/get-user-blogs`,
    { page },
    getHeaders(token)
  );
  return filterPaginationData({
    state: prevState,
    data: data.blogs,
    page,
    countRoute: "/blogs/following-blogs-count",
    user: token,
  });
};

/**
 * Fetch blogs filtered by a subject category tag.
 */
export const fetchBlogsByCategory = async (tag, page = 1, prevState = null) => {
  const { data } = await axios.post(`${API_BASE}/blogs/search-blogs`, {
    tag,
    page,
  });
  return filterPaginationData({
    state: prevState,
    data: data.blogs,
    page,
    countRoute: "/blogs/search-blogs-count",
    data_to_send: { tag },
  });
};

/**
 * Fetch the trending blogs list.
 */
export const fetchTrendingBlogs = async () => {
  const { data } = await axios.get(`${API_BASE}/blogs/trending-blogs`);
  return data.blogs;
};

/**
 * Fetch admin-authored pinned blog posts.
 */
export const fetchAdminBlogs = async () => {
  const { data } = await axios.get(`${API_BASE}/blogs/admin-blogs`);
  return data.blogs;
};

// ─── Sidebar Data ─────────────────────────────────────────────────────────────

/**
 * Fetch trending topic hashtags for the right sidebar.
 */
export const fetchTrendingTopics = async () => {
  const { data } = await axios.get(`${API_BASE}/blogs/trending-topics`);
  return data.topics;
};

/**
 * Fetch top-contributing users by reputation.
 */
export const fetchTopContributors = async () => {
  const { data } = await axios.get(`${API_BASE}/blogs/top-contributors`);
  return data.contributors;
};

// ─── Groups ───────────────────────────────────────────────────────────────────

/**
 * Fetch the groups the current user has joined.
 */
export const fetchJoinedGroups = async (page = 1, token) => {
  const { data } = await axios.get(
    `${API_BASE}/groups/list?joinedOnly=true&page=${page}&limit=6`,
    getHeaders(token)
  );
  return { list: data.list, totalGroups: data.totalGroups };
};

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * Fetch the admin broadcast alert message (shown once per session).
 * Returns the message string, or null if none.
 */
export const fetchAdminAlert = async (token) => {
  const { data } = await axios.get(
    `${API_BASE}/notifications/alert`,
    getHeaders(token)
  );
  return data.list && data.list.length > 0 ? data.list[0].message : null;
};
