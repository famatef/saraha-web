import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : "http://localhost:3000"),
});
api.interceptors.request.use(config => {const token=localStorage.getItem("saraha_access_token");if(token) config.headers.Authorization=`Bearer ${token}`;return config;});
api.interceptors.response.use(r=>r,error=>Promise.reject(new Error(error.response?.data?.message||error.message||"Something went wrong")));
export default api;
