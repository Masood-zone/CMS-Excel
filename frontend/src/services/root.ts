import axios from "axios";

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  // In production, use the environment variable
  if (import.meta.env.PROD) {
    return (
      import.meta.env.VITE_API_BASE_URL ||
      "https://canteenapi.gerizimheights.org"
    );
  }

  // In development, use localhost
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:3400";
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Set to true if you need cookies/auth
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching issues
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject({
        message: "Network error. Please check your connection.",
        status: 0,
      });
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle server errors
    if (error.response.status >= 500) {
      console.error("Server error:", error.response.data);
      return Promise.reject({
        message: "Server error. Please try again later.",
        status: error.response.status,
      });
    }

    return Promise.reject(error);
  }
);
