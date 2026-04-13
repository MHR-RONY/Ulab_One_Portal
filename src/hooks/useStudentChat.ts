import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

// Re-export shared types from teacher hook so views can share them
export type {
	ChatConversation,
	ChatGroup,
	ChatMessage,
	GroupMember,
	ChatContact,
} from "./useTeacherChat";

import type {
	ChatConversation,
	ChatGroup,
	ChatMessage,
	ChatContact,
	GroupMember,
} from "./useTeacherChat";

export const useStudentChat = () => {
	const [conversations, setConversations] = useState<ChatConversation[]>([]);
	const [groups, setGroups] = useState<ChatGroup[]>([]);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
	const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
	const [loading, setLoading] = useState(false);
	const [conversationsLoading, setConversationsLoading] = useState(true);
	const [blockStatus, setBlockStatus] = useState<{ iBlockedThem: boolean; theyBlockedMe: boolean }>({ iBlockedThem: false, theyBlockedMe: false });
	const socketRef = useRef<Socket | null>(null);
	const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
	const refreshConversationsRef = useRef<() => void>(() => { });
	const refreshGroupsRef = useRef<() => void>(() => { });

	useEffect(() => {
		const socket = connectSocket();
		socketRef.current = socket;

		socket.on("dm:receive", (message: ChatMessage) => {
			setMessages((prev) => {
				if (prev.some((m) => m._id === message._id)) return prev;
				return [...prev, message];
			});
			refreshConversationsRef.current();
		});

		socket.on("group:receive", (data: { groupId: string; message: ChatMessage }) => {
			setMessages((prev) => {
				if (prev.some((m) => m._id === data.message._id)) return prev;
				return [...prev, data.message];
			});
			refreshGroupsRef.current();
		});

		socket.on("dm:read-receipt", () => {
			setMessages((prev) => [...prev]);
		});

		socket.on("user:online", (data: { userId: string }) => {
			setOnlineUsers((prev) => ({ ...prev, [data.userId]: true }));
		});

		socket.on("user:offline", (data: { userId: string }) => {
			setOnlineUsers((prev) => ({ ...prev, [data.userId]: false }));
		});

		socket.on("typing:start", (data: { userId: string }) => {
			setTypingUsers((prev) => ({ ...prev, [data.userId]: true }));
		});

		socket.on("typing:stop", (data: { userId: string }) => {
			setTypingUsers((prev) => ({ ...prev, [data.userId]: false }));
		});

		return () => {
			disconnectSocket();
			socketRef.current = null;
		};
	}, []);

	const fetchConversations = useCallback(async () => {
		setConversationsLoading(true);
		try {
			const { data } = await api.get("/chat/conversations");
			if (data.success) {
				setConversations(data.data);
				const contactIds = data.data.map((c: ChatConversation) => c.contactId);
				socketRef.current?.emit(
					"users:online-status",
					{ userIds: contactIds },
					(statuses: Record<string, boolean>) => {
						setOnlineUsers((prev) => ({ ...prev, ...statuses }));
					}
				);
			}
		} catch (error) {
			console.log("Failed to fetch conversations:", error);
		} finally {
			setConversationsLoading(false);
		}
	}, []);

	const fetchGroups = useCallback(async () => {
		try {
			const { data } = await api.get("/chat/groups");
			if (data.success) setGroups(data.data);
		} catch (error) {
			console.log("Failed to fetch groups:", error);
		}
	}, []);

	refreshConversationsRef.current = () => {
		fetchConversations();
	};
	refreshGroupsRef.current = () => {
		fetchGroups();
	};

	const fetchMessages = useCallback(async (type: "dm" | "group", targetId: string) => {
		setLoading(true);
		try {
			const url =
				type === "dm"
					? `/chat/conversations/${targetId}/messages`
					: `/chat/groups/${targetId}/messages`;
			const { data } = await api.get(url);
			if (data.success) {
				setMessages(data.data.messages);
				if (type === "dm") {
					socketRef.current?.emit("dm:read", { contactId: targetId });
				} else {
					socketRef.current?.emit("group:read", { groupId: targetId });
				}
			}
		} catch (error) {
			console.log("Failed to fetch messages:", error);
			setMessages([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchGroupMembers = useCallback(async (groupId: string) => {
		try {
			const { data } = await api.get(`/chat/groups/${groupId}/members`);
			if (data.success) setGroupMembers(data.data);
		} catch (error) {
			console.log("Failed to fetch group members:", error);
		}
	}, []);

	const sendDirectMessage = useCallback((receiverId: string, content: string) => {
		return new Promise<boolean>((resolve) => {
			socketRef.current?.emit(
				"dm:send",
				{ receiverId, content },
				(res: { success: boolean }) => {
					resolve(res.success);
				}
			);
		});
	}, []);

	const sendGroupMessage = useCallback((groupId: string, content: string) => {
		return new Promise<boolean>((resolve) => {
			socketRef.current?.emit(
				"group:send",
				{ groupId, content },
				(res: { success: boolean }) => {
					resolve(res.success);
				}
			);
		});
	}, []);

	const searchContacts = useCallback(async (query: string): Promise<ChatContact[]> => {
		try {
			const { data } = await api.get(`/chat/contacts/search?q=${encodeURIComponent(query)}`);
			if (data.success) return data.data;
			return [];
		} catch (error) {
			console.log("Failed to search contacts:", error);
			return [];
		}
	}, []);

	const emitTyping = useCallback((targetId: string, isGroup: boolean) => {
		socketRef.current?.emit("typing:start", { targetId, isGroup });
		if (typingTimeoutRef.current[targetId]) {
			clearTimeout(typingTimeoutRef.current[targetId]);
		}
		typingTimeoutRef.current[targetId] = setTimeout(() => {
			socketRef.current?.emit("typing:stop", { targetId, isGroup });
			delete typingTimeoutRef.current[targetId];
		}, 2000);
	}, []);

	const fetchBlockStatus = useCallback(async (targetId: string) => {
		try {
			const { data } = await api.get(`/chat/contacts/${targetId}/block`);
			if (data.success) setBlockStatus(data.data);
		} catch (error) {
			console.log("Failed to fetch block status:", error);
		}
	}, []);

	const blockUser = useCallback(async (targetId: string) => {
		try {
			await api.post(`/chat/contacts/${targetId}/block`);
			setBlockStatus((prev) => ({ ...prev, iBlockedThem: true }));
		} catch (error) {
			console.log("Failed to block user:", error);
		}
	}, []);

	const unblockUser = useCallback(async (targetId: string) => {
		try {
			await api.delete(`/chat/contacts/${targetId}/block`);
			setBlockStatus((prev) => ({ ...prev, iBlockedThem: false }));
		} catch (error) {
			console.log("Failed to unblock user:", error);
		}
	}, []);

	return {
		conversations,
		groups,
		messages,
		groupMembers,
		onlineUsers,
		typingUsers,
		loading,
		conversationsLoading,
		blockStatus,
		fetchConversations,
		fetchGroups,
		fetchMessages,
		fetchGroupMembers,
		sendDirectMessage,
		sendGroupMessage,
		searchContacts,
		emitTyping,
		fetchBlockStatus,
		blockUser,
		unblockUser,
	};
};
