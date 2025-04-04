import axios from "axios";
const token = localStorage.getItem("token");

export const apiClient = axios.create({
  baseURL: "https://cms-excel.onrender.com",
  // baseURL: "http://localhost:3400",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});
