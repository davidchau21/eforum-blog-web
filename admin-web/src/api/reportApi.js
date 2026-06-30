import axiosClient, { handleResponse } from "./axiosClient";

const reportApi = {
  totalUser: () => {
    return handleResponse(axiosClient.get("/reports/total-user"));
  },
  totalBlog: () => {
    return handleResponse(axiosClient.get("/reports/total-blog"));
  },
  totalComment: () => {
    return handleResponse(axiosClient.get("/reports/total-comment"));
  },
  userChartByDate: (startDate, endDate) => {
    return handleResponse(axiosClient.get(`/reports/user-chart-bydate`, {
      params: {
        startDate,
        endDate
      }
    }));
  },
  blogStatistic: () => {
    return handleResponse(axiosClient.get(`/reports/blog-statistic`));
  },
  weeklyInteractions: () => {
    return handleResponse(axiosClient.get(`/reports/weekly-interactions`));
  },
  blogStatisticsByDate: (startDate, endDate) => {
    return handleResponse(axiosClient.get(`/reports/blog-statistics-bydate`, {
      params: {
        startDate,
        endDate
      }
    }));
  },
  getStats: () => {
    return handleResponse(axiosClient.get(`/reports/get-stats`));
  },
  summaryByDate: (startDate, endDate) => {
    return handleResponse(axiosClient.get(`/reports/summary-by-date`, { params: { startDate, endDate } }));
  },
  interactionsByDate: (startDate, endDate) => {
    return handleResponse(axiosClient.get(`/reports/interactions-by-date`, { params: { startDate, endDate } }));
  },
};

export default reportApi;
