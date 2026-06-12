import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL as string;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default api;