import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

// ---- Types ----

export interface ChatConversation {
	contactId: string;
	name: string;
	email: string;
	role: string;
	studentId?: string;
	lastMessage: string;
	lastMessageAt: string;
	lastMessageIsMine: boolean;
	unreadCount: number;
}

export interface ChatGroup {
	_id: string;
	name: string;
	type: string;
	course?: { _id: string; courseCode: string; name: string; section: string };
	createdBy: { _id: string; name: string; email: string };
	members: Array<{ _id: string; name: string; email: string; role: string }>;
	unreadCount: number;
}

export interface ChatMessage {
	_id: string;
	sender: { _id: string; name: string; email: string; role: string };
	receiver?: string;
	chatGroup?: string;
	content: string;
	isGroupMessage: boolean;
	readBy: string[];
	createdAt: string;
}

export interface GroupMember {
	_id: string;
	name: string;
	email: string;
	role: string;
	studentId?: string;
	department?: string;
}

export interface ChatContact {
	_id: string;
	name: string;
	email: string;
	role: string;
	studentId?: string;
	department?: string;
}

// ---- Hook ----

export const useTeacherChat = () => {
	const [conversations, setConversations] = useState<ChatConversation[]>([]);
	const [groups, setGroups] = useState<ChatGroup[]>([]);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
	const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
	const [loading, setLoading] = useState(false);
	const socketRef = useRef<Socket | null>(null);
	const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
	const refreshConversationsRef = useRef<() => void>(() => { });
	const refreshGroupsRef = useRef<() => void>(() => { });

	// Connect socket on mount
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

	// ---- Data fetching ----

	const fetchConversations = useCallback(async () => {
		try {
			const { data } = await api.get("/chat/conversations");
			if (data.success) {
				setConversations(data.data);
				// Request online status for all contacts
				const contactIds = data.data.map((c: ChatConversation) => c.contactId);
				socketRef.current?.emit("users:online-status", { userIds: contactIds }, (statuses: Record<string, boolean>) => {
					setOnlineUsers((prev) => ({ ...prev, ...statuses }));
				});
			}
		} catch (error) {
			console.log("Failed to fetch conversations:", error);
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

	// Keep refs in sync so socket handlers can call latest versions
	refreshConversationsRef.current = () => { fetchConversations(); };
	refreshGroupsRef.current = () => { fetchGroups(); };

	const fetchMessages = useCallback(async (type: "dm" | "group", targetId: string) => {
		setLoading(true);
		try {
			const url = type === "dm"
				? `/chat/conversations/${targetId}/messages`
				: `/chat/groups/${targetId}/messages`;

			const { data } = await api.get(url);
			if (data.success) {
				setMessages(data.data.messages);

				// Mark as read
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

	// ---- Actions ----

	const sendDirectMessage = useCallback((receiverId: string, content: string) => {
		return new Promise<boolean>((resolve) => {
			socketRef.current?.emit("dm:send", { receiverId, content }, (res: { success: boolean }) => {
				resolve(res.success);
			});
		});
	}, []);

	const sendGroupMessage = useCallback((groupId: string, content: string) => {
		return new Promise<boolean>((resolve) => {
			socketRef.current?.emit("group:send", { groupId, content }, (res: { success: boolean }) => {
				resolve(res.success);
			});
		});
	}, []);

	const addGroupMember = useCallback(async (groupId: string, memberId: string) => {
		try {
			const { data } = await api.post(`/chat/groups/${groupId}/members`, { memberId });
			if (data.success) {
				await fetchGroupMembers(groupId);
				return true;
			}
			return false;
		} catch (error) {
			console.log("Failed to add member:", error);
			return false;
		}
	}, [fetchGroupMembers]);

	const removeGroupMember = useCallback(async (groupId: string, memberId: string) => {
		try {
			const { data } = await api.delete(`/chat/groups/${groupId}/members/${memberId}`);
			if (data.success) {
				await fetchGroupMembers(groupId);
				return true;
			}
			return false;
		} catch (error) {
			console.log("Failed to remove member:", error);
			return false;
		}
	}, [fetchGroupMembers]);

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

		// Clear existing timeout
		if (typingTimeoutRef.current[targetId]) {
			clearTimeout(typingTimeoutRef.current[targetId]);
		}

		typingTimeoutRef.current[targetId] = setTimeout(() => {
			socketRef.current?.emit("typing:stop", { targetId, isGroup });
			delete typingTimeoutRef.current[targetId];
		}, 2000);
	}, []);

	return {
		conversations,
		groups,
		messages,
		groupMembers,
		onlineUsers,
		typingUsers,
		loading,
		fetchConversations,
		fetchGroups,
		fetchMessages,
		fetchGroupMembers,
		sendDirectMessage,
		sendGroupMessage,
		addGroupMember,
		removeGroupMember,
		searchContacts,
		emitTyping,
	};
};
