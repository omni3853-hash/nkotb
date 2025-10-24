import { logout } from "@/contexts/UserContext";
import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie";

const PUBLIC_ENDPOINTS = [
    "/auth/login",
    "/auth/signup",
    "/auth/send-otp",
    "/auth/otp/send",
    "/auth/otp/verify",
    "/auth/verify-email",
    "/auth/password/request-reset",
    "/auth/password/reset"
];

const getToken = (): string | undefined => {
    const c = Cookies.get("accessTokenCelebrityManagement");
    if (c) return c;
    if (typeof window !== "undefined") {
        try {
            return localStorage.getItem("accessTokenCelebrityManagement") || undefined;
        } catch { }
    }
    return undefined;
};

export const api = axios.create({
    baseURL: "/api",
    timeout: 20000,
});

api.interceptors.request.use(
    (config) => {
        const url = (config.url || "").replace(/^\/+/, "/");
        const isPublic = PUBLIC_ENDPOINTS.some(p => url.startsWith(p));
        if (!isPublic) {
            const accessToken = getToken();
            if (accessToken) {
                (config.headers as any).Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;

            const accessToken = getToken();
            if (!accessToken) {
                logout();
                if (typeof window !== "undefined") window.location.href = "/";
                return Promise.reject(error);
            }

            return api(originalRequest);
        }

        return Promise.reject(error);
    }
);
