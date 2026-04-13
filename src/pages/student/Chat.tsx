import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
	Search,
	PenSquare,
	Users,
	User,
	Send,
	ArrowLeft,
	CheckCheck,
	Info,
	Smile,
	PlusCircle,
	GraduationCap,
	Loader2,
	X,
	BookOpen,
	MessageSquare,
	Ban,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/student/Sidebar";
import BottomNav from "@/components/student/BottomNav";
import { getAccessToken } from "@/lib/api";
import {
	useStudentChat,
	type ChatConversation,
	type ChatGroup,
	type ChatMessage,
	type GroupMember,
	type ChatContact,
} from "@/hooks/useStudentChat";

// --- Helpers ---

const getInitials = (name: string): string =>
	name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

const formatTime = (dateStr: string): string => {
	const d = new Date(dateStr);
	const now = new Date();
	const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
	if (diffDays === 0)
		return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getCurrentUserId = (): string => {
	try {
		const token = getAccessToken();
		if (!token) return "";
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload.id ?? "";
	} catch {
		return "";
	}
};

// --- Personal Chat List ---

const PersonalChatList = ({
	conversations,
	activeId,
	onSelect,
	onStartNew,
	searchQuery,
	onSearchChange,
	onlineUsers,
	contactResults,
	contactSearching,
	loading,
}: {
	conversations: ChatConversation[];
	activeId: string;
	onSelect: (id: string) => void;
	onStartNew: (contact: ChatContact) => void;
	searchQuery: string;
	onSearchChange: (q: string) => void;
	onlineUsers: Record<string, boolean>;
	contactResults: ChatContact[];
	contactSearching: boolean;
	loading: boolean;
}) => {
	const filtered = conversations.filter(
		(c) =>
			c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(c.studentId && c.studentId.includes(searchQuery))
	);

	const existingIds = new Set(conversations.map((c) => c.contactId));
	const newContacts = contactResults.filter((r) => !existingIds.has(String(r._id)));
	const isSearching = searchQuery.trim().length >= 2;
	const hasNoResults = filtered.length === 0 && newContacts.length === 0 && !contactSearching;

	return (
		<div className="flex flex-col h-full">
			<div className="p-3">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<input
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="w-full pl-10 pr-4 h-9 bg-primary/5 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
						placeholder="Search by name, email, ID..."
					/>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto px-2 space-y-0.5">
				{contactSearching && (
					<div className="flex justify-center py-4">
						<Loader2 className="w-4 h-4 animate-spin text-primary" />
					</div>
				)}
				{!contactSearching && isSearching && hasNoResults && (
					<div className="text-center py-8 text-muted-foreground text-sm">No results found</div>
				)}
				{!isSearching && filtered.length === 0 && (
					loading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="w-5 h-5 animate-spin text-primary" />
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground text-sm">
							No conversations yet
						</div>
					)
				)}
				{filtered.map((c) => (
					<div
						key={c.contactId}
						onClick={() => onSelect(c.contactId)}
						className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${activeId === c.contactId
							? "bg-primary/8 border-l-3 border-primary"
							: "hover:bg-primary/5 border-l-3 border-transparent"
							}`}
					>
						<div className="relative">
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${c.role === "teacher"
									? "bg-stat-blue/20 text-stat-blue"
									: "bg-primary/15 text-primary"
									}`}
							>
								{getInitials(c.name)}
							</div>
							{onlineUsers[c.contactId] && (
								<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-stat-emerald border-2 border-card rounded-full" />
							)}
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex justify-between items-baseline">
								<h3 className="text-sm font-semibold truncate">{c.name}</h3>
								{c.lastMessageAt && (
									<span className="text-[10px] text-muted-foreground shrink-0 ml-2">
										{formatTime(c.lastMessageAt)}
									</span>
								)}
							</div>
							<div className="flex items-center gap-1">
								<span
									className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${c.role === "teacher"
										? "bg-stat-blue/10 text-stat-blue"
										: "bg-primary/10 text-primary"
										}`}
								>
									{c.role === "teacher" ? "Faculty" : "Student"}
								</span>
								<p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
							</div>
						</div>
						{c.unreadCount > 0 && (
							<div className="flex items-center justify-center min-w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
								{c.unreadCount}
							</div>
						)}
					</div>
				))}
				{!contactSearching && newContacts.length > 0 && (
					<>
						<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 pt-3 pb-1">
							People
						</p>
						{newContacts.map((r) => (
							<div
								key={r._id}
								onClick={() => onStartNew(r)}
								className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors"
							>
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${r.role === "teacher"
										? "bg-stat-blue/20 text-stat-blue"
										: "bg-primary/15 text-primary"
										}`}
								>
									{getInitials(r.name)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<h3 className="text-sm font-semibold truncate">{r.name}</h3>
										<span
											className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium shrink-0 ${r.role === "teacher"
												? "bg-stat-blue/10 text-stat-blue"
												: "bg-primary/10 text-primary"
												}`}
										>
											{r.role === "teacher" ? "Faculty" : "Student"}
										</span>
									</div>
									<p className="text-[11px] text-muted-foreground truncate">
										{r.studentId ? `${r.studentId} — ` : ""}
										{r.email}
									</p>
								</div>
							</div>
						))}
					</>
				)}
			</div>
		</div>
	);
};

// --- Group Chat List ---

const GroupChatList = ({
	groups,
	activeId,
	onSelect,
}: {
	groups: ChatGroup[];
	activeId: string;
	onSelect: (id: string) => void;
}) => (
	<div className="flex-1 overflow-y-auto px-2 space-y-0.5 pt-3">
		{groups.length === 0 && (
			<div className="text-center py-8 text-muted-foreground text-sm">
				No groups yet. Your teacher will add you to course groups.
			</div>
		)}
		{groups.map((g) => (
			<div
				key={g._id}
				onClick={() => onSelect(g._id)}
				className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${activeId === g._id
					? "bg-primary/8 border-l-3 border-primary"
					: "hover:bg-primary/5 border-l-3 border-transparent"
					}`}
			>
				<div className="w-10 h-10 rounded-full bg-stat-purple/20 text-stat-purple flex items-center justify-center shrink-0">
					{g.type === "class" ? (
						<BookOpen className="w-5 h-5" />
					) : (
						<GraduationCap className="w-5 h-5" />
					)}
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex justify-between items-baseline">
						<h3 className="text-sm font-semibold truncate">{g.name}</h3>
					</div>
					<div className="flex items-center gap-1.5">
						<Users className="w-3 h-3 text-muted-foreground" />
						<span className="text-[10px] text-muted-foreground">{g.members.length}</span>
						{g.course && (
							<span className="text-[9px] px-1.5 py-0.5 rounded-md bg-stat-purple/10 text-stat-purple font-medium">
								{g.course.courseCode}
							</span>
						)}
						{g.createdBy && (
							<span className="text-[10px] text-muted-foreground truncate">
								by {g.createdBy.name}
							</span>
						)}
					</div>
				</div>
				{g.unreadCount > 0 && (
					<div className="flex items-center justify-center min-w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
						{g.unreadCount}
					</div>
				)}
			</div>
		))}
	</div>
);

// --- Chat Thread View ---

const ChatThreadView = ({
	name,
	isOnline,
	isGroup,
	memberCount,
	messages,
	loading,
	onBack,
	onViewMembers,
	onSend,
	onTyping,
	typingUsers,
	isBlocked,
	isBlockedBy,
	onToggleBlock,
}: {
	name: string;
	isOnline?: boolean;
	isGroup?: boolean;
	memberCount?: number;
	messages: ChatMessage[];
	loading: boolean;
	onBack: () => void;
	onViewMembers?: () => void;
	onSend: (content: string) => void;
	onTyping: () => void;
	typingUsers: Record<string, boolean>;
	isBlocked?: boolean;
	isBlockedBy?: boolean;
	onToggleBlock?: () => void;
	contactEmail?: string;
	contactStudentId?: string;
	contactRole?: string;
}) => {
	const [message, setMessage] = useState("");
	const [showInfo, setShowInfo] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const userId = getCurrentUserId();

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	const handleSend = () => {
		const content = message.trim();
		if (!content) return;
		onSend(content);
		setMessage("");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const somebodyTyping = Object.values(typingUsers).some(Boolean);

	return (
		<div className="flex flex-col h-full relative">
			<header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 z-10 shrink-0">
				<div className="flex items-center gap-3">
					<button
						onClick={onBack}
						className="md:hidden text-muted-foreground hover:text-primary transition-colors"
					>
						<ArrowLeft className="w-5 h-5" />
					</button>
					<div
						className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${isGroup
							? "bg-stat-purple/20 text-stat-purple"
							: "bg-primary/15 text-primary"
							}`}
					>
						{isGroup ? <GraduationCap className="w-5 h-5" /> : getInitials(name)}
					</div>
					<div>
						<h3 className="text-sm font-bold leading-none text-foreground">{name}</h3>
						<p className="text-[11px] mt-0.5">
							{isGroup ? (
								<span className="text-muted-foreground">{memberCount} members</span>
							) : isOnline ? (
								<span className="text-stat-emerald font-medium">Online</span>
							) : (
								<span className="text-muted-foreground">Offline</span>
							)}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					{isGroup && onViewMembers && (
						<button
							onClick={onViewMembers}
							className="text-muted-foreground hover:text-primary transition-colors"
							title="View Members"
						>
							<Users className="w-5 h-5" />
						</button>
					)}
					{!isGroup && (
						<button
							onClick={() => setShowInfo((v) => !v)}
							className={`transition-colors ${showInfo
								? "text-primary"
								: "text-muted-foreground hover:text-primary"
								}`}
							title="Contact info"
						>
							<Info className="w-4 h-4" />
						</button>
					)}
				</div>
			</header>

			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{loading ? (
					<div className="flex items-center justify-center h-full">
						<Loader2 className="w-6 h-6 animate-spin text-primary" />
					</div>
				) : messages.length === 0 ? (
					<div className="flex items-center justify-center h-full">
						<p className="text-sm text-muted-foreground">
							No messages yet. Start the conversation!
						</p>
					</div>
				) : (
					<>
						{messages.map((msg) => {
							const isMine = msg.sender._id === userId;
							return isMine ? (
								<div
									key={msg._id}
									className="flex items-end gap-2 max-w-[80%] ml-auto flex-row-reverse"
								>
									<div className="flex flex-col items-end">
										<div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-br-none shadow-md">
											<p className="text-sm">{msg.content}</p>
										</div>
										<div className="flex items-center gap-1 mt-0.5">
											<span className="text-[10px] text-muted-foreground">
												{formatTime(msg.createdAt)}
											</span>
											{msg.readBy.length > 1 && (
												<CheckCheck className="w-3.5 h-3.5 text-primary" />
											)}
										</div>
									</div>
								</div>
							) : (
								<div key={msg._id} className="flex items-end gap-2 max-w-[80%]">
									<div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[10px] font-semibold shrink-0 mb-4">
										{getInitials(msg.sender.name)}
									</div>
									<div>
										{isGroup && (
											<p className="text-[10px] text-primary font-medium ml-1 mb-0.5">
												{msg.sender.name}
											</p>
										)}
										<div className="bg-card p-3 rounded-2xl rounded-bl-none shadow-sm border border-border">
											<p className="text-sm text-foreground">{msg.content}</p>
										</div>
										<span className="text-[10px] text-muted-foreground ml-1 mt-0.5 block">
											{formatTime(msg.createdAt)}
										</span>
									</div>
								</div>
							);
						})}
					</>
				)}

				{somebodyTyping && (
					<div className="flex items-center gap-2 px-2">
						<div className="flex gap-1">
							<div
								className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
								style={{ animationDelay: "0ms" }}
							/>
							<div
								className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
								style={{ animationDelay: "150ms" }}
							/>
							<div
								className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
								style={{ animationDelay: "300ms" }}
							/>
						</div>
						<span className="text-xs text-muted-foreground">typing...</span>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{isBlockedBy ? (
				<div className="p-4 bg-card border-t border-border shrink-0 flex items-center justify-center gap-2 text-muted-foreground text-sm">
					<Ban className="w-4 h-4 shrink-0" />
					<span>You cannot send messages to this person.</span>
				</div>
			) : isBlocked ? (
				<div className="p-4 bg-card border-t border-border shrink-0 flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<Ban className="w-4 h-4 shrink-0 text-destructive" />
						<span>You have blocked <strong>{name}</strong>.</span>
					</div>
					<button
						onClick={onToggleBlock}
						className="text-xs font-semibold text-primary hover:underline shrink-0"
					>
						Unblock
					</button>
				</div>
			) : (
				<div className="p-3 bg-card border-t border-border shrink-0">
					<div className="flex items-end gap-2 bg-primary/5 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
						<button className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0">
							<PlusCircle className="w-5 h-5" />
						</button>
						<textarea
							value={message}
							onChange={(e) => {
								setMessage(e.target.value);
								onTyping();
							}}
							onKeyDown={handleKeyDown}
							className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2 resize-none text-foreground placeholder:text-muted-foreground"
							placeholder={`Message ${name}...`}
							rows={1}
						/>
						<div className="flex items-center gap-1 shrink-0">
							<button className="hidden md:flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-primary transition-colors">
								<Smile className="w-5 h-5" />
							</button>
							<button
								onClick={handleSend}
								disabled={!message.trim()}
								className="h-9 w-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
							>
								<Send className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			)}

			<AnimatePresence>
				{showInfo && !isGroup && (
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className="absolute inset-0 bg-background z-20 flex flex-col"
					>
						<header className="h-14 border-b border-border bg-card flex items-center gap-3 px-4 shrink-0">
							<button
								onClick={() => setShowInfo(false)}
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								<ArrowLeft className="w-5 h-5" />
							</button>
							<h3 className="text-sm font-bold text-foreground">Contact Info</h3>
						</header>

						<div className="flex-1 overflow-y-auto p-6 space-y-5">
							<div className="flex flex-col items-center gap-3">
								<div className="w-20 h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold shrink-0">
									{getInitials(name)}
								</div>
								<div className="text-center">
									<h2 className="text-lg font-bold text-foreground">{name}</h2>
									<p
										className={`text-xs font-medium mt-0.5 ${isOnline ? "text-stat-emerald" : "text-muted-foreground"
											}`}
									>
										{isOnline ? "Online" : "Offline"}
									</p>
								</div>
							</div>

							<div className="bg-card rounded-2xl border border-border divide-y divide-border">
								{contactRole && (
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-sm text-muted-foreground">Role</span>
										<span
											className={`text-xs px-2 py-1 rounded-md font-semibold ${contactRole === "teacher"
												? "bg-stat-blue/10 text-stat-blue"
												: "bg-primary/10 text-primary"
												}`}
										>
											{contactRole === "teacher" ? "Faculty" : "Student"}
										</span>
									</div>
								)}
								{contactStudentId && (
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-sm text-muted-foreground">Student ID</span>
										<span className="text-sm font-medium text-foreground">
											{contactStudentId}
										</span>
									</div>
								)}
								{contactEmail && (
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-sm text-muted-foreground">Email</span>
										<span className="text-sm font-medium text-foreground truncate max-w-[60%] text-right">
											{contactEmail}
										</span>
									</div>
								)}
							</div>

							{onToggleBlock && (
								<div className="bg-card rounded-2xl border border-border overflow-hidden">
									<button
										onClick={onToggleBlock}
										className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${isBlocked
											? "text-destructive hover:bg-destructive/5"
											: "text-destructive/70 hover:bg-destructive/5 hover:text-destructive"
											}`}
									>
										<Ban className="w-4 h-4 shrink-0" />
										<span className="text-sm font-medium">
											{isBlocked ? `Unblock ${name}` : `Block ${name}`}
										</span>
									</button>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

// --- View Members Panel (read-only for students) ---

const ViewMembersPanel = ({
	groupName,
	members,
	onClose,
}: {
	groupName: string;
	members: GroupMember[];
	onClose: () => void;
}) => {
	const [search, setSearch] = useState("");

	const filtered = members.filter(
		(m) =>
			m.name.toLowerCase().includes(search.toLowerCase()) ||
			(m.studentId && m.studentId.includes(search)) ||
			m.email.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<motion.div
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			exit={{ x: "100%" }}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			className="absolute inset-0 bg-background z-20 flex flex-col"
		>
			<header className="h-14 border-b border-border bg-card flex items-center gap-3 px-4 shrink-0">
				<button
					onClick={onClose}
					className="text-muted-foreground hover:text-primary transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>
				<div>
					<h3 className="text-sm font-bold text-foreground">{groupName}</h3>
					<p className="text-[11px] text-muted-foreground">{members.length} members</p>
				</div>
			</header>

			<div className="p-3">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full pl-10 pr-4 h-9 bg-primary/5 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
						placeholder="Search members..."
					/>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-3 space-y-1">
				{filtered.map((m) => (
					<div
						key={m._id}
						className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
					>
						<div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
							{getInitials(m.name)}
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<h4 className="text-sm font-semibold truncate">{m.name}</h4>
								<span
									className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${m.role === "teacher"
										? "bg-stat-blue/10 text-stat-blue"
										: "bg-stat-emerald/10 text-stat-emerald"
										}`}
								>
									{m.role === "teacher" ? "Teacher" : "Student"}
								</span>
							</div>
							<p className="text-[11px] text-muted-foreground">
								{m.studentId ? `${m.studentId} | ` : ""}
								{m.email}
							</p>
						</div>
					</div>
				))}
			</div>
		</motion.div>
	);
};

// --- New Message Modal ---

const NewMessageModal = ({
	onClose,
	onSelect,
	onSearch,
}: {
	onClose: () => void;
	onSelect: (contact: ChatContact) => void;
	onSearch: (q: string) => Promise<ChatContact[]>;
}) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<ChatContact[]>([]);
	const [searching, setSearching] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleSearch = (q: string) => {
		setQuery(q);
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		if (q.length < 2) {
			setResults([]);
			return;
		}
		setSearching(true);
		timeoutRef.current = setTimeout(async () => {
			const r = await onSearch(q);
			setResults(r);
			setSearching(false);
		}, 300);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 flex items-start justify-center pt-16 px-4"
			onClick={onClose}
		>
			<motion.div
				initial={{ scale: 0.95, y: -10 }}
				animate={{ scale: 1, y: 0 }}
				exit={{ scale: 0.95, y: -10 }}
				className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-4 py-3 border-b border-border">
					<h3 className="text-sm font-bold text-foreground">New Message</h3>
					<button
						onClick={onClose}
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
				<div className="p-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<input
							value={query}
							onChange={(e) => handleSearch(e.target.value)}
							className="w-full pl-10 pr-4 h-9 bg-primary/5 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
							placeholder="Search students, teachers..."
							autoFocus
						/>
					</div>
				</div>
				<div className="max-h-64 overflow-y-auto px-3 pb-3 space-y-1">
					{searching && (
						<div className="flex justify-center py-4">
							<Loader2 className="w-5 h-5 animate-spin text-primary" />
						</div>
					)}
					{!searching && query.length >= 2 && results.length === 0 && (
						<p className="text-center text-sm text-muted-foreground py-4">No results found</p>
					)}
					{!searching && query.length < 2 && (
						<p className="text-center text-xs text-muted-foreground py-4">
							Type at least 2 characters to search
						</p>
					)}
					{results.map((r) => (
						<div
							key={r._id}
							onClick={() => onSelect(r)}
							className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors"
						>
							<div
								className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${r.role === "teacher"
									? "bg-stat-blue/20 text-stat-blue"
									: "bg-primary/15 text-primary"
									}`}
							>
								{getInitials(r.name)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<h4 className="text-sm font-semibold truncate">{r.name}</h4>
									<span
										className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${r.role === "teacher"
											? "bg-stat-blue/10 text-stat-blue"
											: "bg-primary/10 text-primary"
											}`}
									>
										{r.role === "teacher" ? "Faculty" : "Student"}
									</span>
								</div>
								<p className="text-[11px] text-muted-foreground truncate">
									{r.studentId ? `${r.studentId} — ` : ""}
									{r.email}
								</p>
							</div>
						</div>
					))}
				</div>
			</motion.div>
		</motion.div>
	);
};

// --- Main Page ---

const StudentChat = () => {
	const [searchParams] = useSearchParams();
	const initialTab = searchParams.get("tab") === "groups" ? "groups" : "personal";
	const [activeTab, setActiveTab] = useState<"personal" | "groups">(initialTab);
	const [activeConversation, setActiveConversation] = useState("");
	const [showThread, setShowThread] = useState(false);
	const [showMembers, setShowMembers] = useState(false);
	const [showNewMessage, setShowNewMessage] = useState(false);
	const [personalSearch, setPersonalSearch] = useState("");
	const [contactResults, setContactResults] = useState<ChatContact[]>([]);
	const [contactSearching, setContactSearching] = useState(false);
	const contactSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [pendingContact, setPendingContact] = useState<ChatContact | null>(null);

	const {
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
	} = useStudentChat();

	useEffect(() => {
		const tab = searchParams.get("tab");
		if (tab === "groups" || tab === "personal") setActiveTab(tab);
	}, [searchParams]);

	useEffect(() => {
		if (activeTab === "personal") fetchConversations();
		else fetchGroups();
	}, [activeTab, fetchConversations, fetchGroups]);

	useEffect(() => {
		if (!activeConversation) return;
		if (activeTab === "personal") {
			fetchMessages("dm", activeConversation);
			fetchBlockStatus(activeConversation);
		} else {
			fetchMessages("group", activeConversation);
			fetchGroupMembers(activeConversation);
		}
	}, [activeConversation, activeTab, fetchMessages, fetchGroupMembers, fetchBlockStatus]);

	useEffect(() => {
		if (contactSearchTimeoutRef.current) clearTimeout(contactSearchTimeoutRef.current);
		if (personalSearch.trim().length < 2) {
			setContactResults([]);
			setContactSearching(false);
			return;
		}
		setContactSearching(true);
		contactSearchTimeoutRef.current = setTimeout(async () => {
			const results = await searchContacts(personalSearch.trim());
			setContactResults(results);
			setContactSearching(false);
		}, 300);
	}, [personalSearch, searchContacts]);

	const activeGroup = groups.find((g) => g._id === activeConversation);
	const activeContact = conversations.find((c) => c.contactId === activeConversation);
	const resolvedContactName = activeContact?.name ?? pendingContact?.name ?? "";
	const resolvedIsOnline = activeContact ? onlineUsers[activeContact.contactId] : undefined;

	const handleSend = async (content: string) => {
		if (activeTab === "personal") {
			await sendDirectMessage(activeConversation, content);
		} else {
			await sendGroupMessage(activeConversation, content);
		}
	};

	const handleTyping = () => {
		emitTyping(activeConversation, activeTab === "groups");
	};

	const handleNewContact = (contact: ChatContact) => {
		setShowNewMessage(false);
		setActiveTab("personal");
		setActiveConversation(contact._id);
		setPendingContact(contact);
		setPersonalSearch("");
		setShowThread(true);
		fetchMessages("dm", contact._id);
		fetchConversations();
	};

	const handleToggleBlock = async () => {
		if (!activeConversation) return;
		if (blockStatus.iBlockedThem) {
			await unblockUser(activeConversation);
		} else {
			await blockUser(activeConversation);
		}
	};

	const totalPersonalUnread = conversations.reduce((a, c) => a + c.unreadCount, 0);
	const totalGroupUnread = groups.reduce((a, g) => a + g.unreadCount, 0);

	return (
		<div className="flex h-screen overflow-hidden">
			<div className="hidden md:block">
				<Sidebar activePage="Messages" />
			</div>

			<main className="flex-1 flex overflow-hidden relative">
				{/* Left Panel */}
				<div
					className={`${showThread ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-border bg-card flex-col shrink-0`}
				>
					<div className="p-4 pb-0 space-y-3 shrink-0">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-bold text-foreground">Messages</h2>
							<button
								onClick={() => setShowNewMessage(true)}
								className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
								title="New message"
							>
								<PenSquare className="w-4 h-4" />
							</button>
						</div>
						<div className="flex h-10 items-center justify-center rounded-xl bg-secondary/50 p-1">
							{(["personal", "groups"] as const).map((tab) => (
								<button
									key={tab}
									onClick={() => {
										setActiveTab(tab);
										setActiveConversation("");
										setShowThread(false);
									}}
									className={`flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-semibold transition-all ${activeTab === tab
										? "bg-card text-primary shadow-sm"
										: "text-muted-foreground"
										}`}
								>
									{tab === "personal" ? (
										<User className="w-4 h-4" />
									) : (
										<Users className="w-4 h-4" />
									)}
									<span className="capitalize">{tab}</span>
									<span
										className={`min-w-4 h-4 rounded-full text-[9px] font-bold px-1 flex items-center justify-center ${activeTab === tab
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground"
											}`}
									>
										{tab === "personal" ? totalPersonalUnread : totalGroupUnread}
									</span>
								</button>
							))}
						</div>
					</div>

					<div className="flex-1 overflow-hidden">
						<AnimatePresence mode="wait">
							<motion.div
								key={activeTab}
								initial={{ opacity: 0, x: activeTab === "personal" ? -20 : 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="h-full"
							>
								{activeTab === "personal" ? (
									<PersonalChatList
										conversations={conversations}
										activeId={activeConversation}
										onSelect={(id) => {
											setActiveConversation(id);
											setShowThread(true);
										}}
										onStartNew={handleNewContact}
										searchQuery={personalSearch}
										onSearchChange={setPersonalSearch}
										onlineUsers={onlineUsers}
										contactResults={contactResults}
										contactSearching={contactSearching}
										loading={conversationsLoading}
									/>
								) : (
									<GroupChatList
										groups={groups}
										activeId={activeConversation}
										onSelect={(id) => {
											setActiveConversation(id);
											setShowThread(true);
											setShowMembers(false);
										}}
									/>
								)}
							</motion.div>
						</AnimatePresence>
					</div>
				</div>

				{/* Right Panel */}
				<div
					className={`${showThread ? "flex" : "hidden md:flex"} flex-1 flex-col bg-background relative`}
				>
					{activeConversation && (activeContact || activeGroup || pendingContact) ? (
						<>
							<ChatThreadView
								name={activeGroup?.name ?? resolvedContactName}
								isOnline={resolvedIsOnline}
								isGroup={!!activeGroup}
								memberCount={activeGroup?.members.length}
								messages={messages}
								loading={loading}
								onBack={() => setShowThread(false)}
								onViewMembers={
									activeGroup
										? () => {
											setShowMembers(true);
											fetchGroupMembers(activeConversation);
										}
										: undefined
								}
								onSend={handleSend}
								onTyping={handleTyping}
								typingUsers={typingUsers}
								isBlocked={!activeGroup ? blockStatus.iBlockedThem : undefined}
								isBlockedBy={!activeGroup ? blockStatus.theyBlockedMe : undefined}
								onToggleBlock={!activeGroup ? handleToggleBlock : undefined}
								contactEmail={!activeGroup ? (activeContact?.email ?? pendingContact?.email) : undefined}
								contactStudentId={!activeGroup ? (activeContact?.studentId ?? pendingContact?.studentId) : undefined}
								contactRole={!activeGroup ? (activeContact?.role ?? pendingContact?.role) : undefined}
							/>

							<AnimatePresence>
								{showMembers && activeGroup && (
									<ViewMembersPanel
										groupName={activeGroup.name}
										members={groupMembers}
										onClose={() => setShowMembers(false)}
									/>
								)}
							</AnimatePresence>
						</>
					) : (
						<div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
							<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
								<MessageSquare className="w-8 h-8 text-primary" />
							</div>
							<div>
								<h3 className="text-base font-bold text-foreground">Your Messages</h3>
								<p className="text-sm text-muted-foreground mt-1">
									{activeTab === "personal"
										? "Select a conversation or start a new message"
										: "Select a group to view messages"}
								</p>
							</div>
							{activeTab === "personal" && (
								<button
									onClick={() => setShowNewMessage(true)}
									className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
								>
									New Message
								</button>
							)}
						</div>
					)}
				</div>

				{/* New Message Modal */}
				<AnimatePresence>
					{showNewMessage && (
						<NewMessageModal
							onClose={() => setShowNewMessage(false)}
							onSelect={handleNewContact}
							onSearch={searchContacts}
						/>
					)}
				</AnimatePresence>
			</main>

			{!showThread && <BottomNav />}
		</div>
	);
};

export default StudentChat;
