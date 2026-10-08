import axios from "axios";
import { getToken, clearToken } from "./token";

// Create an instance of axios
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Fallback to localhost if env var is missing
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle global errors (e.g., 401 Unauthorized)
        // A 401 from /login just means wrong credentials: let the form show the error
        // instead of reloading the page.
        const isLoginRequest = error.config?.url === "/login";
        if (error.response?.status === 401 && !isLoginRequest) {
            clearToken();
            if (!window.location.pathname.endsWith("/signin")) {
                window.location.href = "/signin";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
