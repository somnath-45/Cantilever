import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api/v1";

export const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("cantilever_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

// FastAPI's validation handler returns { Validation: [{field, message}] };
// plain HTTPExceptions return { detail: "..." }. Normalize both.
export function extractErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.Validation)) {
    return data.Validation.map((v) => `${v.field}: ${v.message}`).join(" · ");
  }
  return fallback;
}

export default client;
