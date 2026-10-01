import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({ baseURL: API_BASE });

// Attach the login token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token expired / missing -> go back to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
      localStorage.removeItem("adminLoggedIn");
      if (window.location.pathname !== "/") window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export const errMsg = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message ||
  (err?.request ? "Server se connect nahi ho pa raha." : fallback);

export const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const notifyCartChanged = () =>
  window.dispatchEvent(new Event("cart-updated"));

export default api;
