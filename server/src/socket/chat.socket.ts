import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { IJwtPayload } from "../types";
import { MessageModel } from "../models/Message.model";
import { ChatGroupModel } from "../models/ChatGroup.model";

interface AuthSocket extends Socket {
	user: IJwtPayload;
}

// Track online users: userId -> Set<socketId>
const onlineUsers = new Map<string, Set<string>>();

const addOnlineUser = (userId: string, socketId: string) => {
	const sockets = onlineUsers.get(userId) ?? new Set();
	sockets.add(socketId);
	onlineUsers.set(userId, sockets);
};

const removeOnlineUser = (userId: string, socketId: string) => {
	const sockets = onlineUsers.get(userId);
	if (sockets) {
		sockets.delete(socketId);
		if (sockets.size === 0) onlineUsers.delete(userId);
	}
};

const isUserOnline = (userId: string): boolean => onlineUsers.has(userId);

export const initSocketServer = (httpServer: HttpServer): Server => {
	const io = new Server(httpServer, {
		cors: {
			origin: process.env.CLIENT_URL,
			credentials: true,
		},
		pingTimeout: 60000,
		pingInterval: 25000,
	});

	// JWT authentication middleware
	io.use((socket, next) => {
		const token = socket.handshake.auth.token as string | undefined;

		if (!token) {
			return next(new Error("Authentication required"));
		}

		try {
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET as string
			) as IJwtPayload;
			(socket as AuthSocket).user = decoded;
			next();
		} catch {
			return next(new Error("Invalid token"));
		}
	});

	io.on("connection", async (rawSocket: Socket) => {
		const socket = rawSocket as AuthSocket;
		const userId = socket.user.id;

		addOnlineUser(userId, socket.id);

		// Join user to all their group rooms
		const groups = await ChatGroupModel.find({ members: userId }).select("_id");
		for (const group of groups) {
			socket.join(`group:${group._id}`);
		}

		// Join personal room
		socket.join(`user:${userId}`);

		// Broadcast online status
		io.emit("user:online", { userId });

		// ---- Direct Message ----
		socket.on("dm:send", async (data: { receiverId: string; content: string }, callback?: (res: { success: boolean; message?: unknown; error?: string }) => void) => {
			try {
				const content = typeof data.content === "string" ? data.content.trim() : "";
				if (!content || content.length > 5000) {
					callback?.({ success: false, error: "Invalid message content" });
					return;
				}

				if (!data.receiverId || data.receiverId === userId) {
					callback?.({ success: false, error: "Invalid receiver" });
					return;
				}

				const message = await MessageModel.create({
					sender: userId,
					receiver: data.receiverId,
					content,
					isGroupMessage: false,
					readBy: [userId],
				});

				const populated = await message.populate("sender", "name email role");

				// Send to receiver
				io.to(`user:${data.receiverId}`).emit("dm:receive", populated);
				// Echo back to sender (for other tabs/devices)
				socket.emit("dm:receive", populated);

				callback?.({ success: true, message: populated });
			} catch (error) {
				console.log("dm:send error:", error);
				callback?.({ success: false, error: "Failed to send message" });
			}
		});

		// ---- Mark DM as read ----
		socket.on("dm:read", async (data: { contactId: string }) => {
			try {
				await MessageModel.updateMany(
					{
						sender: data.contactId,
						receiver: userId,
						isGroupMessage: false,
						readBy: { $nin: [userId] },
					},
					{ $addToSet: { readBy: userId } }
				);

				io.to(`user:${data.contactId}`).emit("dm:read-receipt", {
					readBy: userId,
					contactId: data.contactId,
				});
			} catch (error) {
				console.log("dm:read error:", error);
			}
		});

		// ---- Group Message ----
		socket.on("group:send", async (data: { groupId: string; content: string }, callback?: (res: { success: boolean; message?: unknown; error?: string }) => void) => {
			try {
				const content = typeof data.content === "string" ? data.content.trim() : "";
				if (!content || content.length > 5000) {
					callback?.({ success: false, error: "Invalid message content" });
					return;
				}

				// Verify membership
				const group = await ChatGroupModel.findOne({
					_id: data.groupId,
					members: userId,
				});

				if (!group) {
					callback?.({ success: false, error: "Group not found or access denied" });
					return;
				}

				const message = await MessageModel.create({
					chatGroup: data.groupId,
					sender: userId,
					content,
					isGroupMessage: true,
					readBy: [userId],
				});

				const populated = await message.populate("sender", "name email role");

				io.to(`group:${data.groupId}`).emit("group:receive", {
					groupId: data.groupId,
					message: populated,
				});

				callback?.({ success: true, message: populated });
			} catch (error) {
				console.log("group:send error:", error);
				callback?.({ success: false, error: "Failed to send message" });
			}
		});

		// ---- Mark Group messages as read ----
		socket.on("group:read", async (data: { groupId: string }) => {
			try {
				await MessageModel.updateMany(
					{
						chatGroup: data.groupId,
						isGroupMessage: true,
						sender: { $ne: userId },
						readBy: { $nin: [userId] },
					},
					{ $addToSet: { readBy: userId } }
				);
			} catch (error) {
				console.log("group:read error:", error);
			}
		});

		// ---- Typing indicators ----
		socket.on("typing:start", (data: { targetId: string; isGroup: boolean }) => {
			if (data.isGroup) {
				socket.to(`group:${data.targetId}`).emit("typing:start", {
					userId,
					targetId: data.targetId,
					isGroup: true,
				});
			} else {
				io.to(`user:${data.targetId}`).emit("typing:start", {
					userId,
					targetId: data.targetId,
					isGroup: false,
				});
			}
		});

		socket.on("typing:stop", (data: { targetId: string; isGroup: boolean }) => {
			if (data.isGroup) {
				socket.to(`group:${data.targetId}`).emit("typing:stop", {
					userId,
					targetId: data.targetId,
					isGroup: true,
				});
			} else {
				io.to(`user:${data.targetId}`).emit("typing:stop", {
					userId,
					targetId: data.targetId,
					isGroup: false,
				});
			}
		});

		// ---- Get online status ----
		socket.on("users:online-status", (data: { userIds: string[] }, callback?: (res: Record<string, boolean>) => void) => {
			const statuses: Record<string, boolean> = {};
			for (const id of data.userIds) {
				statuses[id] = isUserOnline(id);
			}
			callback?.(statuses);
		});

		// ---- Disconnect ----
		socket.on("disconnect", () => {
			removeOnlineUser(userId, socket.id);
			if (!isUserOnline(userId)) {
				io.emit("user:offline", { userId });
			}
		});
	});

	return io;
};
