import axios from "axios";

const http = axios.create({ 
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor
http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor response
http.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            console.log("No autorizado");
        }
        return Promise.reject(error);
    }
);

export default http;