import axios from "axios";

export const apiClient = axios.create({
  // baseURL: "https://cms-excel-0jrn.onrender.com",
  baseURL: "http://localhost:3400",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to set the Authorization header dynamically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete config.headers["Authorization"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);
