import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5003";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
	if (!socket) {
		socket = io(SOCKET_URL, {
			auth: { token: getAccessToken() },
			withCredentials: true,
			autoConnect: false,
			reconnection: true,
			reconnectionAttempts: 10,
			reconnectionDelay: 1000,
		});
	}
	return socket;
};

export const connectSocket = (): Socket => {
	const s = getSocket();
	if (!s.connected) {
		s.auth = { token: getAccessToken() };
		s.connect();
	}
	return s;
};

export const disconnectSocket = (): void => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};
