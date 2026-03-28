import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
	if (!socket) {
		const token = localStorage.getItem("accessToken");
		socket = io("http://localhost:5003", {
			auth: { token },
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
		const token = localStorage.getItem("accessToken");
		s.auth = { token };
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
