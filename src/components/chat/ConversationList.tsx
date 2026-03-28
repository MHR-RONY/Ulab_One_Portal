import { useState } from "react";
import { Search, PenSquare, Menu, CheckCheck, Users, GraduationCap, Settings, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MobileMenuDrawer from "@/components/student/MobileMenuDrawer";

interface Conversation {
	id: string;
	name: string;
	initials: string;
	lastMessage: string;
	time: string;
	online?: boolean;
	unread?: number;
	type: "personal" | "group";
	avatarColor: string;
	icon?: React.ReactNode;
	checkmark?: boolean;
}

const conversations: Conversation[] = [
	{
		id: "prof-ahmed",
		name: "Dr. Ariful Islam",
		initials: "AI",
		lastMessage: "The lecture slides for Monday are u...",
		time: "10:42 AM",
		online: true,
		unread: 2,
		type: "personal",
		avatarColor: "bg-stat-blue/20 text-stat-blue",
	},
	{
		id: "cse-401",
		name: "CSE 301 - Section 2",
		initials: "",
		lastMessage: "Alice: Has anyone finished the lab report?",
		time: "9:45 AM",
		type: "group",
		avatarColor: "bg-stat-purple/20 text-stat-purple",
		icon: <GraduationCap className="w-6 h-6" />,
	},
	{
		id: "advising",
		name: "Sarah Jenkins (Advising)",
		initials: "SJ",
		lastMessage: "Your course registration is approved.",
		time: "Yesterday",
		type: "personal",
		avatarColor: "bg-stat-emerald/20 text-stat-emerald",
		checkmark: true,
	},
	{
		id: "ieee",
		name: "IEEE Student Branch",
		initials: "",
		lastMessage: "Admin: Workshop starts at 2 PM sh...",
		time: "Yesterday",
		unread: 12,
		type: "group",
		avatarColor: "bg-stat-emerald/20 text-stat-emerald",
		icon: <Users className="w-6 h-6" />,
	},
	{
		id: "mehedi",
		name: "Tanvir Ahmed",
		initials: "TA",
		lastMessage: "See you at the library later!",
		time: "Wed",
		type: "personal",
		avatarColor: "bg-stat-amber/20 text-stat-amber",
	},
	{
		id: "ai-group",
		name: "AI Research Group",
		initials: "",
		lastMessage: "Rahat: I've found a new dataset for LLMs.",
		time: "Oct 24",
		type: "group",
		avatarColor: "bg-stat-amber/20 text-stat-amber",
		icon: <Settings className="w-6 h-6" />,
	},
];

interface ConversationListProps {
	activeId: string;
	onSelect: (id: string) => void;
}

const ConversationList = ({ activeId, onSelect }: ConversationListProps) => {
	const [activeFilter, setActiveFilter] = useState<"Personal" | "Groups">("Personal");

	const filteredConversations = conversations.filter((conv) => {
		if (activeFilter === "Personal") return conv.type === "personal";
		return conv.type === "group";
	});

	return (
		<>
			{/* Desktop Layout */}
			<div className="hidden md:flex flex-col h-full">
				<div className="p-4 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold text-primary">Messages</h2>
						<button className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
							<PenSquare className="w-4 h-4" />
						</button>
					</div>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<input
							className="w-full pl-10 pr-4 h-10 bg-primary/5 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
							placeholder="Search conversations..."
						/>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto px-2 space-y-1">
					{conversations.map((conv) => (
						<div
							key={conv.id}
							onClick={() => onSelect(conv.id)}
							className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeId === conv.id
									? "bg-primary/5 border-l-4 border-primary"
									: "hover:bg-primary/5 border-l-4 border-transparent"
								}`}
						>
							<div className="relative">
								<div className={`w-12 h-12 rounded-full ${conv.avatarColor} flex items-center justify-center font-semibold text-sm shrink-0`}>
									{conv.icon || conv.initials}
								</div>
								{conv.online && (
									<div className="absolute bottom-0 right-0 w-3 h-3 bg-stat-emerald border-2 border-card rounded-full" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex justify-between items-baseline">
									<h3 className={`text-sm truncate ${activeId === conv.id ? "font-bold" : "font-semibold"}`}>
										{conv.name}
									</h3>
									<span className={`text-[10px] shrink-0 ml-2 ${activeId === conv.id ? "text-primary font-medium" : "text-muted-foreground"}`}>
										{conv.time}
									</span>
								</div>
								<p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
							</div>
							{conv.unread && (
								<div className="flex items-center justify-center min-w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
									{conv.unread}
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Mobile Layout - Matching reference design */}
			<div className="flex flex-col h-full md:hidden">
				{/* Mobile Header */}
				<header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md">
					<div className="flex items-center p-4 justify-between">
						<h1 className="text-xl font-bold leading-tight tracking-tight text-foreground flex-1">Messages</h1>
						<div className="flex gap-2">
							<button className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-secondary transition-colors text-foreground">
								<Search className="w-5 h-5" />
							</button>
							<button className="flex w-10 h-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
								<PenSquare className="w-5 h-5" />
							</button>
							<MobileMenuDrawer activePage="Messages" />
						</div>
					</div>

					{/* Filter Tabs */}
					<div className="px-4 pb-4">
						<div className="flex h-11 items-center justify-center rounded-xl bg-secondary/50 p-1">
							{(["Personal", "Groups"] as const).map((filter) => (
								<button
									key={filter}
									onClick={() => setActiveFilter(filter)}
									className={`flex h-full flex-1 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-all ${activeFilter === filter
											? "bg-card text-primary shadow-sm"
											: "text-muted-foreground"
										}`}
								>
									{filter}
								</button>
							))}
						</div>
					</div>
				</header>

				{/* Conversation List */}
				<main className="flex-1 overflow-y-auto pb-24">
					<AnimatePresence mode="wait">
						<motion.div
							key={activeFilter}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
						>
							{filteredConversations.map((conv, index) => (
								<motion.div
									key={conv.id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.04, duration: 0.25 }}
									onClick={() => onSelect(conv.id)}
									className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors active:bg-secondary"
								>
									{/* Avatar */}
									<div className="relative">
										<div className={`flex w-14 h-14 shrink-0 items-center justify-center rounded-full ${conv.avatarColor} text-base font-bold`}>
											{conv.icon || conv.initials}
										</div>
										{conv.online && (
											<div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-stat-emerald border-2 border-card" />
										)}
									</div>

									{/* Content */}
									<div className="flex flex-1 flex-col justify-center min-w-0">
										<div className="flex justify-between items-baseline mb-0.5">
											<p className="text-foreground text-base font-bold truncate">{conv.name}</p>
											<p className="text-muted-foreground text-xs shrink-0 ml-2">{conv.time}</p>
										</div>
										<div className="flex justify-between items-center">
											<p className="text-muted-foreground text-sm truncate">
												{conv.checkmark && <CheckCheck className="w-3.5 h-3.5 inline-block mr-1 text-primary align-middle" />}
												{conv.lastMessage}
											</p>
											{conv.unread && (
												<div className="ml-2 flex items-center justify-center min-w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1.5">
													{conv.unread}
												</div>
											)}
										</div>
									</div>
								</motion.div>
							))}
						</motion.div>
					</AnimatePresence>
				</main>
			</div>
		</>
	);
};

export default ConversationList;
