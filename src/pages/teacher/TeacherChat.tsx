import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, PenSquare, Users, User, Send, ArrowLeft,
  CheckCheck, Phone, Video, Info, Smile, PlusCircle,
  UserPlus, UserMinus, GraduationCap, MessageSquare, Loader2, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherBottomNav from "@/components/teacher/TeacherBottomNav";
import {
  useTeacherChat,
  type ChatConversation,
  type ChatGroup,
  type ChatMessage,
  type GroupMember,
  type ChatContact,
} from "@/hooks/useTeacherChat";

// --- Helpers ---

const getInitials = (name: string): string =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const formatTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getCurrentUserId = (): string => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id ?? "";
  } catch {
    return "";
  }
};

// --- Sub-Components ---

const PersonalChatList = ({
  conversations,
  activeId,
  onSelect,
  searchQuery,
  onSearchChange,
  onlineUsers,
}: {
  conversations: ChatConversation[];
  activeId: string;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlineUsers: Record<string, boolean>;
}) => {
  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.studentId && c.studentId.includes(searchQuery))
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 h-9 bg-primary/5 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
            placeholder="Search by name, email, roll..."
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {searchQuery ? "No results found" : "No conversations yet"}
          </div>
        )}
        {filtered.map((c) => (
          <div
            key={c.contactId}
            onClick={() => onSelect(c.contactId)}
            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
              activeId === c.contactId
                ? "bg-primary/8 border-l-3 border-primary"
                : "hover:bg-primary/5 border-l-3 border-transparent"
            }`}
          >
            <div className="relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${
                c.role === "teacher" ? "bg-stat-blue/20 text-stat-blue" : "bg-primary/15 text-primary"
              }`}>
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
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{formatTime(c.lastMessageAt)}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${
                  c.role === "teacher" ? "bg-stat-blue/10 text-stat-blue" : "bg-primary/10 text-primary"
                }`}>
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
      </div>
    </div>
  );
};

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
      <div className="text-center py-8 text-muted-foreground text-sm">No groups yet. Create a class to get started.</div>
    )}
    {groups.map((g) => (
      <div
        key={g._id}
        onClick={() => onSelect(g._id)}
        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
          activeId === g._id
            ? "bg-primary/8 border-l-3 border-primary"
            : "hover:bg-primary/5 border-l-3 border-transparent"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-stat-purple/20 text-stat-purple flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5" />
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

const ChatThreadView = ({
  name,
  isOnline,
  isGroup,
  memberCount,
  messages,
  loading,
  onBack,
  onManageMembers,
  onSend,
  onTyping,
  typingUsers,
}: {
  name: string;
  isOnline?: boolean;
  isGroup?: boolean;
  memberCount?: number;
  messages: ChatMessage[];
  loading: boolean;
  onBack: () => void;
  onManageMembers?: () => void;
  onSend: (content: string) => void;
  onTyping: () => void;
  typingUsers: Record<string, boolean>;
}) => {
  const [message, setMessage] = useState("");
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
    <div className="flex flex-col h-full">
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${
            isGroup ? "bg-stat-purple/20 text-stat-purple" : "bg-primary/15 text-primary"
          }`}>
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
          {isGroup && onManageMembers && (
            <button onClick={onManageMembers} className="text-muted-foreground hover:text-primary transition-colors" title="Manage Members">
              <Users className="w-5 h-5" />
            </button>
          )}
          <button className="text-muted-foreground hover:text-primary transition-colors"><Phone className="w-4 h-4" /></button>
          <button className="text-muted-foreground hover:text-primary transition-colors"><Video className="w-4 h-4" /></button>
          <button className="text-muted-foreground hover:text-primary transition-colors"><Info className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isMine = msg.sender._id === userId;
              return isMine ? (
                <div key={msg._id} className="flex items-end gap-2 max-w-[80%] ml-auto flex-row-reverse">
                  <div className="flex flex-col items-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-br-none shadow-md">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
                      {msg.readBy.length > 1 && <CheckCheck className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={msg._id} className="flex items-end gap-2 max-w-[80%]">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[10px] font-semibold shrink-0 mb-4">
                    {getInitials(msg.sender.name)}
                  </div>
                  <div>
                    {isGroup && <p className="text-[10px] text-primary font-medium ml-1 mb-0.5">{msg.sender.name}</p>}
                    <div className="bg-card p-3 rounded-2xl rounded-bl-none shadow-sm border border-border">
                      <p className="text-sm text-foreground">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-1 mt-0.5 block">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {somebodyTyping && (
          <div className="flex items-center gap-2 px-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-muted-foreground">typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-card border-t border-border shrink-0">
        <div className="flex items-end gap-2 bg-primary/5 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <button className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0">
            <PlusCircle className="w-5 h-5" />
          </button>
          <textarea
            value={message}
            onChange={(e) => { setMessage(e.target.value); onTyping(); }}
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
    </div>
  );
};

const ManageMembersPanel = ({
  groupName,
  groupId,
  members,
  onClose,
  onAdd,
  onRemove,
  onSearch,
}: {
  groupName: string;
  groupId: string;
  members: GroupMember[];
  onClose: () => void;
  onAdd: (groupId: string, memberId: string) => Promise<boolean>;
  onRemove: (groupId: string, memberId: string) => Promise<boolean>;
  onSearch: (q: string) => Promise<ChatContact[]>;
}) => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ChatContact[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.studentId && m.studentId.includes(search)) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSearch = (q: string) => {
    setAddSearch(q);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (q.length < 2) { setSearchResults([]); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await onSearch(q);
      const memberIds = new Set(members.map((m) => m._id));
      setSearchResults(results.filter((r) => !memberIds.has(r._id)));
    }, 300);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-background z-20 flex flex-col"
    >
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-foreground">{groupName}</h3>
            <p className="text-[11px] text-muted-foreground">{members.length} members</p>
          </div>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Student
        </button>
      </header>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="p-3 bg-primary/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={addSearch}
                  onChange={(e) => handleAddSearch(e.target.value)}
                  className="w-full pl-10 pr-10 h-9 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                  placeholder="Search students to add..."
                  autoFocus
                />
                <button onClick={() => { setShowSearch(false); setAddSearch(""); setSearchResults([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {searchResults.map((r) => (
                    <div key={r._id} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border">
                      <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-semibold">
                        {getInitials(r.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{r.studentId ?? r.email}</p>
                      </div>
                      <button
                        onClick={async () => {
                          await onAdd(groupId, r._id);
                          setSearchResults((prev) => prev.filter((x) => x._id !== r._id));
                        }}
                        className="h-7 px-2.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold hover:bg-primary/90 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div key={m._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors group">
            <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
              {getInitials(m.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold truncate">{m.name}</h4>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${
                  m.role === "teacher"
                    ? "bg-stat-blue/10 text-stat-blue"
                    : "bg-stat-emerald/10 text-stat-emerald"
                }`}>
                  {m.role === "teacher" ? "Teacher" : "Student"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {m.studentId ? `${m.studentId} | ` : ""}{m.email}
              </p>
            </div>
            {m.role !== "teacher" && (
              <button
                onClick={() => onRemove(groupId, m._id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 p-1.5 rounded-lg"
                title="Remove"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Main Page ---

const TeacherChat = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "groups" ? "groups" : "personal";
  const [activeTab, setActiveTab] = useState<"personal" | "groups">(initialTab);
  const [activeConversation, setActiveConversation] = useState("");
  const [showThread, setShowThread] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [personalSearch, setPersonalSearch] = useState("");

  const {
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
  } = useTeacherChat();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "groups" || tab === "personal") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch data on tab change
  useEffect(() => {
    if (activeTab === "personal") fetchConversations();
    else fetchGroups();
  }, [activeTab, fetchConversations, fetchGroups]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!activeConversation) return;
    if (activeTab === "personal") {
      fetchMessages("dm", activeConversation);
    } else {
      fetchMessages("group", activeConversation);
      fetchGroupMembers(activeConversation);
    }
  }, [activeConversation, activeTab, fetchMessages, fetchGroupMembers]);

  const activeGroup = groups.find((g) => g._id === activeConversation);
  const activeContact = conversations.find((c) => c.contactId === activeConversation);

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

  const totalPersonalUnread = conversations.reduce((a, c) => a + c.unreadCount, 0);
  const totalGroupUnread = groups.reduce((a, g) => a + g.unreadCount, 0);

  return (
    <div className="flex h-screen overflow-hidden teacher-theme">
      <div className="hidden md:block">
        <TeacherSidebar activePage="Messages" />
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Panel */}
        <div className={`${showThread ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-border bg-card flex-col shrink-0`}>
          <div className="p-4 pb-0 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Messages</h2>
              <button className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <PenSquare className="w-4 h-4" />
              </button>
            </div>
            <div className="flex h-10 items-center justify-center rounded-xl bg-secondary/50 p-1">
              {(["personal", "groups"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setActiveConversation(""); setShowThread(false); }}
                  className={`flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab === "personal" ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  <span className="capitalize">{tab}</span>
                  <span className={`min-w-4 h-4 rounded-full text-[9px] font-bold px-1 flex items-center justify-center ${
                    activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
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
                    onSelect={(id) => { setActiveConversation(id); setShowThread(true); }}
                    searchQuery={personalSearch}
                    onSearchChange={setPersonalSearch}
                    onlineUsers={onlineUsers}
                  />
                ) : (
                  <GroupChatList
                    groups={groups}
                    activeId={activeConversation}
                    onSelect={(id) => { setActiveConversation(id); setShowThread(true); setShowMembers(false); }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel */}
        <div className={`${showThread ? "flex" : "hidden md:flex"} flex-1 flex-col bg-background relative`}>
          {activeConversation && (activeContact || activeGroup) ? (
            <>
              <ChatThreadView
                name={activeContact?.name ?? activeGroup?.name ?? ""}
                isOnline={activeContact ? onlineUsers[activeContact.contactId] : undefined}
                isGroup={!!activeGroup}
                memberCount={activeGroup?.members.length}
                messages={messages}
                loading={loading}
                onBack={() => setShowThread(false)}
                onManageMembers={activeGroup ? () => { setShowMembers(true); fetchGroupMembers(activeConversation); } : undefined}
                onSend={handleSend}
                onTyping={handleTyping}
                typingUsers={typingUsers}
              />

              <AnimatePresence>
                {showMembers && activeGroup && (
                  <ManageMembersPanel
                    groupName={activeGroup.name}
                    groupId={activeGroup._id}
                    members={groupMembers}
                    onClose={() => setShowMembers(false)}
                    onAdd={addGroupMember}
                    onRemove={removeGroupMember}
                    onSearch={searchContacts}
                  />
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Select a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Choose a personal chat or class group from the left to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="md:hidden">
        <TeacherBottomNav />
      </div>
    </div>
  );
};

export default TeacherChat;
