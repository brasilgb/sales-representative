import axios from "axios";

const appUrl =
  import.meta.env.VITE_APP_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:8000");

const apisales = axios.create({
  baseURL: new URL("/api/", appUrl).toString(),
  headers: {
    "Content-Type": "application/json"
  },
});

const appsales = axios.create({
  baseURL: new URL("/app/", appUrl).toString(),
  headers: {
    "Content-Type": "application/json"
  },
});

export { apisales, appsales};
