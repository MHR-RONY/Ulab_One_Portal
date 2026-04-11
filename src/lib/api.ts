import axios from "axios";
import { loadingStore } from "./loadingStore";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5003/api";

// In-memory token store — never persisted to localStorage (prevents XSS token theft)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
	accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

const api = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config) => {
	if (accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`;
	}
	loadingStore.increment();
	return config;
});

api.interceptors.response.use(
	(response) => {
		loadingStore.decrement();
		return response;
	},
	async (error) => {
		loadingStore.decrement();
		const originalRequest = error.config;
		const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

		if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
			originalRequest._retry = true;
			try {
				const { data } = await axios.post(
					`${BASE_URL}/auth/refresh-token`,
					{},
					{ withCredentials: true }
				);
				setAccessToken(data.data.accessToken);
				originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
				return api(originalRequest);
			} catch {
				setAccessToken(null);
				const path = window.location.pathname;
				if (path.startsWith("/admin")) {
					window.location.href = "/admin/login";
				} else if (path.startsWith("/teacher")) {
					window.location.href = "/teacher/login";
				} else {
					window.location.href = "/login";
				}
			}
		}

		return Promise.reject(error);
	}
);

export default api;
