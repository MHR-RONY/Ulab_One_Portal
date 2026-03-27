import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:5003/api",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("accessToken");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

		if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
			originalRequest._retry = true;
			try {
				const { data } = await axios.post(
					"http://localhost:5003/api/auth/refresh-token",
					{},
					{ withCredentials: true }
				);
				localStorage.setItem("accessToken", data.data.accessToken);
				originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
				return api(originalRequest);
			} catch {
				localStorage.removeItem("accessToken");
				// Redirect to the correct login portal based on the current path
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
