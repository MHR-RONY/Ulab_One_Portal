import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, Calendar, ArrowRight, ArrowLeft, Clock, Star, User, BookOpen, ChevronRight, CheckCircle2, Sun, Moon, Sparkles, Plus, Zap, Save, PlusCircle, Info, Check, Building2, HelpCircle, Scale, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/student/Sidebar";
import BottomNav from "@/components/student/BottomNav";
import MobileMenuDrawer from "@/components/student/MobileMenuDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import api from "@/lib/api";

interface Course {
	id: string;
	code: string;
	unicode: string;
	title: string;
	type: "Required" | "Elective";
	department: string;
	credits: number;
	category?: string;
}

interface Section {
	id: string;
	label: string;
	instructor: string;
	days: string;
	time: string;
	seats: number;
	totalSeats: number;
	status: "Available" | "Filling Fast" | "Full";
	room: string;
	building: string;
}

interface Instructor {
	name: string;
	title: string;
	department: string;
	rating: number;
	reviews: number;
	bio: string;
	avatar: string;
}

interface DbOfferedCourse {
	_id: string;
	courseCode: string;
	unicode: string;
	title: string;
	section: string;
	room: string;
	teacherInitials: string;
	teacherFullName: string;
	teacherTBA: boolean;
	isLab: boolean;
	days: string[];
	startTime: string;
	endTime: string;
	semester: string;
	teacherAvatar: string;
	teacherDepartment: string;
	teacherBio: string;
	seats: number;
	totalSeats: number;
}

type TScheduleMode = "teacher" | "gap" | "days";

interface GeneratedSection {
	sectionId: string;
	courseCode: string;
	unicode: string;
	title: string;
	section: string;
	teacher: string;
	days: string[];
	startTime: string;
	endTime: string;
	room: string;
	isLab: boolean;
	isPreferredTeacher: boolean;
}

interface ScheduleConflict {
	course1: string;
	course2: string;
	day: string;
	overlap: string;
}

interface ScheduleVariation {
	label: string;
	isBest: boolean;
	score: number;
	totalDays: number;
	daysUsed: string[];
	avgGapMinutes: number;
	teacherMatchCount: number;
	totalCourses: number;
	conflicts: ScheduleConflict[];
	sections: GeneratedSection[];
}

interface GenerateResponse {
	variations: ScheduleVariation[];
	hasConflicts: boolean;
	conflictMessages: string[];
}

const getCategory = (code: string): string => {
	const match = code.match(/^[A-Za-z]+/);
	return match ? match[0].toUpperCase() : "GEN";
};

const getDeptPrefix = (department: string): string => {
	const dept = department.toLowerCase();
	if (dept.includes("computer science") || dept.includes("cse")) return "CSE";
	if (dept.includes("electrical") || dept.includes("electronic") || dept.includes("eee")) return "EEE";
	if (dept.includes("business") || dept.includes("bba") || dept.includes("mba")) return "BBA";
	if (dept.includes("english")) return "ENG";
	if (dept.includes("pharmacy") || dept.includes("pharma")) return "PHA";
	if (dept.includes("law")) return "LAW";
	return "";
};

const STORAGE_KEY = "schedule_builder_draft";

const loadDraft = () => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as {
			step: number;
			selected: string[];
			activeTab: string;
			selectedSections: Record<string, string>;
			selectedModes: TScheduleMode[];
			scheduleVariations?: ScheduleVariation[];
			selectedSchedule?: number | null;
			generationConflicts?: string[];
		};
	} catch {
		return null;
	}
};

const clearDraft = () => localStorage.removeItem(STORAGE_KEY);

const ScheduleBuilder = () => {
	const navigate = useNavigate();
	const isMobile = useIsMobile();
	const { profile } = useStudentProfile();
	const draft = loadDraft();
	const [step, setStep] = useState(draft?.step ?? 1);
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<string[]>(draft?.selected ?? []);
	const [activeTab, setActiveTab] = useState<string>(draft?.activeTab ?? "");
	const [selectedSections, setSelectedSections] = useState<Record<string, string>>(draft?.selectedSections ?? {});
	const [viewingInstructor, setViewingInstructor] = useState<string | null>(null);
	const [selectedModes, setSelectedModes] = useState<TScheduleMode[]>(draft?.selectedModes ?? ["teacher", "gap", "days"]);
	const [scheduleVariations, setScheduleVariations] = useState<ScheduleVariation[]>(draft?.scheduleVariations ?? []);
	const [generationConflicts, setGenerationConflicts] = useState<string[]>(draft?.generationConflicts ?? []);
	const [isGenerating, setIsGenerating] = useState(false);
	const [selectedSchedule, setSelectedSchedule] = useState<number | null>(draft?.selectedSchedule ?? null);
	const [step4Tab, setStep4Tab] = useState<"weekly" | "list" | "conflicts">("weekly");
	const [saved, setSaved] = useState(false);
	const [mobileFilter, setMobileFilter] = useState("All Courses");
	const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
	const [sectionsData, setSectionsData] = useState<Record<string, Section[]>>({});
	const [instructorsData, setInstructorsData] = useState<Record<string, Instructor>>({});
	const [showManualAdd, setShowManualAdd] = useState(false);
	const [manualCourseId, setManualCourseId] = useState<string>("");
	const [manualSectionId, setManualSectionId] = useState<string>("");
	const [manualConflictMsg, setManualConflictMsg] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [savedMode, setSavedMode] = useState(false);
	const [isLoadingSaved, setIsLoadingSaved] = useState(true);

	const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:5003/api").replace(/\/api$/, "");

	// Fetch saved schedule on mount — if exists, show it instead of builder
	useEffect(() => {
		const fetchSavedSchedule = async () => {
			try {
				const { data } = await api.get<{ data: { sections: GeneratedSection[]; semester: string; savedAt: string } | null }>("/schedule/my-schedule?semester=Summer 2026");
				if (data.data && data.data.sections && data.data.sections.length > 0) {
					const sections = data.data.sections;
					const dayOrder = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
					const daysUsed = dayOrder.filter((d) => sections.some((s) => s.days.includes(d)));
					const variation: ScheduleVariation = {
						label: "Saved Schedule",
						isBest: true,
						score: 100,
						totalDays: daysUsed.length,
						daysUsed,
						avgGapMinutes: 0,
						teacherMatchCount: 0,
						totalCourses: sections.length,
						conflicts: [],
						sections,
					};
					setScheduleVariations([variation]);
					setSelectedSchedule(0);
					setSavedMode(true);
					setStep(4);
					clearDraft();
				}
			} catch {
				// No saved schedule or error — continue to builder
			} finally {
				setIsLoadingSaved(false);
			}
		};
		fetchSavedSchedule();
	}, []);

	// Fetch courses immediately on mount — do NOT wait for profile
	useEffect(() => {
		const fetchOfferedCourses = async () => {
			try {
				const { data } = await api.get<{ data: { courses: DbOfferedCourse[] } }>("/schedule/offered-courses?semester=Summer 2026");
				const docs = data.data.courses;

				const courseMap = new Map<string, DbOfferedCourse[]>();
				for (const doc of docs) {
					const key = doc.unicode || doc.courseCode;
					const existing = courseMap.get(key) ?? [];
					existing.push(doc);
					courseMap.set(key, existing);
				}

				const courses: Course[] = [];
				const newSectionsData: Record<string, Section[]> = {};
				const newInstructorsData: Record<string, Instructor> = {};

				for (const [key, sections] of courseMap.entries()) {
					const code = sections[0].courseCode || key;
					courses.push({
						id: key,
						code,
						unicode: sections[0].unicode || "",
						title: sections[0].title || code,
						type: "Required",
						department: "ULAB",
						credits: sections.some((s) => !s.isLab) ? 3.0 : 1.0,
						category: getCategory(code),
					});

					newSectionsData[key] = sections.map((s) => {
						const instructorName = s.teacherTBA ? "TBA" : (s.teacherFullName || s.teacherInitials || "TBA");
						if (instructorName !== "TBA" && !newInstructorsData[instructorName]) {
							newInstructorsData[instructorName] = {
								name: instructorName,
								title: "",
								department: s.teacherDepartment || "",
								rating: 4.0,
								reviews: 0,
								bio: s.teacherBio || "",
								avatar: s.teacherAvatar || "",
							};
						}
						return {
							id: s._id,
							label: `S${s.section}`,
							instructor: instructorName,
							days: s.days.join(", "),
							time: `${s.startTime} - ${s.endTime}`,
							seats: s.seats ?? 45,
							totalSeats: s.totalSeats ?? 45,
							status: (s.seats ?? 45) <= 0 ? "Full" as const : (s.seats ?? 45) <= 5 ? "Filling Fast" as const : "Available" as const,
							room: s.room,
							building: "",
						};
					});
				}

				courses.sort((a, b) => {
					const aCSE = a.code.toUpperCase().startsWith("CSE") ? 0 : 1;
					const bCSE = b.code.toUpperCase().startsWith("CSE") ? 0 : 1;
					if (aCSE !== bCSE) return aCSE - bCSE;
					return a.code.localeCompare(b.code);
				});

				setAvailableCourses(courses);
				setSectionsData(newSectionsData);
				setInstructorsData(newInstructorsData);
			} catch {
				// keep empty state on error
			} finally {
				setIsLoading(false);
			}
		};

		fetchOfferedCourses();
	}, []);

	// Re-sort courses by department prefix once profile loads (no re-fetch needed)
	useEffect(() => {
		if (!profile?.department || availableCourses.length === 0) return;
		const deptPrefix = getDeptPrefix(profile.department);
		setAvailableCourses((prev) =>
			[...prev].sort((a, b) => {
				const aMatch = a.code.toUpperCase().startsWith(deptPrefix) ? 0 : 1;
				const bMatch = b.code.toUpperCase().startsWith(deptPrefix) ? 0 : 1;
				if (aMatch !== bMatch) return aMatch - bMatch;
				return a.code.localeCompare(b.code);
			})
		);
	}, [profile?.department]);

	// Persist draft to localStorage on changes
	useEffect(() => {
		if (saved) return;
		const data = { step, selected, activeTab, selectedSections, selectedModes, scheduleVariations, selectedSchedule, generationConflicts };
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}, [step, selected, activeTab, selectedSections, selectedModes, scheduleVariations, selectedSchedule, generationConflicts, saved]);

	// On mobile, skip the variation cards step and go straight to finalize
	useEffect(() => {
		if (isMobile && step === 4 && scheduleVariations.length > 0) {
			setStep(5);
		}
	}, [isMobile, step, scheduleVariations.length]);

	const resetAll = () => {
		clearDraft();
		setStep(1); setSearch(""); setSelected([]); setActiveTab("");
		setSelectedSections({}); setViewingInstructor(null); setSelectedModes(["teacher", "gap", "days"]);
		setScheduleVariations([]); setGenerationConflicts([]);
		setSelectedSchedule(null); setStep4Tab("weekly"); setSaved(false);
		setMobileFilter("All Courses"); setSavedMode(false);
	};

	const handleSave = async () => {
		if (!activeVariation) {
			toast.error("No schedule selected to save");
			return;
		}
		try {
			const sectionIds = activeVariation.sections.map((s) => s.sectionId);
			await api.post("/schedule/save-sections", { sectionIds, semester: "Summer 2026" });
			clearDraft();
			setSaved(true);
			setSavedMode(true);
			toast.success("Schedule saved successfully");
		} catch (err) {
			const error = err as { response?: { data?: { message?: string } } };
			const msg = error.response?.data?.message || "Failed to save schedule";
			toast.error(msg);
		}
	};

	const toggleMode = (mode: TScheduleMode) => {
		setSelectedModes((prev) => {
			if (prev.includes(mode)) {
				if (prev.length === 1) return prev; // at least one must stay
				return prev.filter((m) => m !== mode);
			}
			return [...prev, mode];
		});
	};

	const handleGenerate = async () => {
		if (selectedModes.length === 0) {
			toast.error("Select at least one optimization mode.");
			return;
		}
		setIsGenerating(true);
		try {
			const { data } = await api.post<{ data: GenerateResponse }>("/schedule/generate", {
				courseUnicodes: selected,
				preferredSections: selectedSections,
				modes: selectedModes,
				semester: "Summer 2026",
			});
			const result = data.data;
			setScheduleVariations(result.variations);
			setGenerationConflicts(result.conflictMessages);
			if (result.variations.length > 0) {
				setSelectedSchedule(0);
			}
			setStep(isMobile ? 5 : 4);
		} catch {
			toast.error("Failed to generate schedules. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	const strippedSearch = search.replace(/[^a-z0-9]/gi, "").toLowerCase();
	const filtered = availableCourses.filter((c) => {
		const strippedCode = c.code.replace(/[^a-z0-9]/gi, "").toLowerCase();
		const strippedUnicode = (c.unicode || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
		const strippedCombined = (strippedCode + strippedUnicode);
		const matchesCode = strippedCode.includes(strippedSearch) || strippedUnicode.includes(strippedSearch) || strippedCombined.includes(strippedSearch);
		const matchesTitle = c.title.toLowerCase().includes(search.trim().toLowerCase());
		const matchesSearch = matchesCode || matchesTitle;
		const matchesFilter = mobileFilter === "All Courses" || c.category === mobileFilter;
		return matchesSearch && (isMobile ? matchesFilter : true);
	});

	const toggle = (id: string) =>
		setSelected((prev) => {
			if (prev.includes(id)) return prev.filter((i) => i !== id);
			const course = availableCourses.find((c) => c.id === id);
			const addedCredits = course?.credits ?? 0;
			const currentTotal = availableCourses.filter((c) => prev.includes(c.id)).reduce((sum, c) => sum + c.credits, 0);
			if (currentTotal + addedCredits > maxCredits) {
				toast.error("15 credits is the maximum allowed per semester.");
				return prev;
			}
			return [...prev, id];
		});

	const selectedCourses = availableCourses.filter((c) => selected.includes(c.id));
	const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
	const maxCredits = 15;

	const goToStep2 = () => {
		if (selected.length > 0) { setActiveTab(selected[0]); setStep(2); }
	};

	/** Parse "09:25 am" / "01:35 pm" to minutes since midnight */
	const parseTimeToMin = (raw: string): number => {
		const m = raw.trim().toLowerCase().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
		if (!m) return 0;
		let h = parseInt(m[1], 10);
		const min = parseInt(m[2], 10);
		if (m[3] === "am" && h === 12) h = 0;
		if (m[3] === "pm" && h !== 12) h += 12;
		return h * 60 + min;
	};

	/** Check if a candidate section conflicts with any already-selected section */
	const findSectionConflict = (candidateId: string, courseKey: string): string | null => {
		const candidate = (sectionsData[courseKey] || []).find((s) => s.id === candidateId);
		if (!candidate) return null;

		const candDays = candidate.days.split(",").map((d) => d.trim());
		const [candStart, candEnd] = candidate.time.split("-").map((t) => parseTimeToMin(t.trim()));

		for (const [otherKey, otherId] of Object.entries(selectedSections)) {
			if (otherKey === courseKey) continue; // same course — will be replaced, not a conflict
			const otherSection = (sectionsData[otherKey] || []).find((s) => s.id === otherId);
			if (!otherSection) continue;

			const otherDays = otherSection.days.split(",").map((d) => d.trim());
			const [otherStart, otherEnd] = otherSection.time.split("-").map((t) => parseTimeToMin(t.trim()));

			for (const cd of candDays) {
				for (const od of otherDays) {
					if (cd === od && candStart < otherEnd && otherStart < candEnd) {
						const otherCourse = availableCourses.find((c) => c.id === otherKey);
						return `Time conflict with ${otherCourse?.code || otherKey} (${otherSection.instructor}) on ${cd}`;
					}
				}
			}
		}
		return null;
	};

	/** Handle section selection with conflict check */
	const handleSectionSelect = (sectionId: string, courseKey: string) => {
		// Deselecting — always allowed
		if (selectedSections[courseKey] === sectionId) {
			setSelectedSections((prev) => { const next = { ...prev }; delete next[courseKey]; return next; });
			setViewingInstructor(null);
			return;
		}
		// Check for time conflict
		const conflict = findSectionConflict(sectionId, courseKey);
		if (conflict) {
			toast.error(conflict);
			return;
		}
		const section = (sectionsData[courseKey] || []).find((s) => s.id === sectionId);
		setViewingInstructor(section?.instructor ?? null);
		setSelectedSections((prev) => ({ ...prev, [courseKey]: sectionId }));
	};

	/** Check if a candidate section conflicts with the active variation schedule */
	const checkManualConflict = (courseKey: string, sectionId: string): string | null => {
		if (!activeVariation) return null;
		const section = (sectionsData[courseKey] || []).find((s) => s.id === sectionId);
		if (!section) return null;

		const candDays = section.days.split(",").map((d) => d.trim());
		const [candStart, candEnd] = section.time.split("-").map((t) => parseTimeToMin(t.trim()));

		for (const existing of activeVariation.sections) {
			const existStart = parseTimeToMin(existing.startTime);
			const existEnd = parseTimeToMin(existing.endTime);
			for (const cd of candDays) {
				for (const ed of existing.days) {
					const cdNorm = cd.toLowerCase();
					const edNorm = ed.toLowerCase().startsWith(cd.toLowerCase().slice(0, 3)) ? cdNorm : ed.toLowerCase();
					const dayMatches = cd.toLowerCase() === ed.toLowerCase() ||
						ed.toLowerCase().startsWith(cd.toLowerCase().slice(0, 3)) ||
						cd.toLowerCase().startsWith(ed.toLowerCase().slice(0, 3));
					if (dayMatches && candStart < existEnd && existStart < candEnd) {
						return `Time conflict with ${existing.courseCode} (${existing.teacher}) on ${ed}: ${existing.startTime}-${existing.endTime}`;
					}
				}
			}
		}
		return null;
	};

	/** Handle manual add of a course section to the active variation */
	const handleManualAdd = () => {
		if (!activeVariation || !manualCourseId || !manualSectionId) return;

		const course = availableCourses.find((c) => c.id === manualCourseId);
		const section = (sectionsData[manualCourseId] || []).find((s) => s.id === manualSectionId);
		if (!course || !section) return;

		// Check for duplicate course
		const alreadyHas = activeVariation.sections.some((s) => s.courseCode === course.code || s.unicode === course.unicode);
		if (alreadyHas) {
			toast.error(`${course.code} is already in your schedule.`);
			return;
		}

		// Check conflict
		const conflict = checkManualConflict(manualCourseId, manualSectionId);
		if (conflict) {
			toast.error(conflict);
			return;
		}

		// Parse days from "Saturday, Monday" format to full day names
		const dayMap: Record<string, string> = { sat: "Saturday", sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday" };
		const parsedDays = section.days.split(",").map((d) => {
			const trimmed = d.trim().toLowerCase();
			return dayMap[trimmed] || dayMap[trimmed.slice(0, 3)] || d.trim();
		});

		const [startTime, endTime] = section.time.split("-").map((t) => t.trim());
		const newSection: GeneratedSection = {
			sectionId: section.id,
			courseCode: course.code,
			unicode: course.unicode,
			title: course.title,
			section: section.label.replace(/^S/, ""),
			teacher: section.instructor,
			days: parsedDays,
			startTime,
			endTime,
			room: section.room,
			isLab: course.credits <= 1,
			isPreferredTeacher: false,
		};

		setScheduleVariations((prev) => {
			const updated = [...prev];
			if (selectedSchedule !== null && updated[selectedSchedule]) {
				updated[selectedSchedule] = {
					...updated[selectedSchedule],
					sections: [...updated[selectedSchedule].sections, newSection],
					totalCourses: updated[selectedSchedule].totalCourses + 1,
				};
			}
			return updated;
		});

		toast.success(`${course.code} - ${section.label} added to your schedule.`);
		setShowManualAdd(false);
		setManualCourseId("");
		setManualSectionId("");
		setManualConflictMsg("");
	};

	const currentSections = sectionsData[activeTab] || [];
	const activeCourse = availableCourses.find((c) => c.id === activeTab);
	const selectedSection = selectedSections[activeTab];
	const selectedSectionData = currentSections.find((s) => s.id === selectedSection);
	const currentInstructor = viewingInstructor
		? instructorsData[viewingInstructor]
		: selectedSectionData ? instructorsData[selectedSectionData.instructor]
			: currentSections[0] ? instructorsData[currentSections[0].instructor] : null;

	const creditPercent = Math.round((totalCredits / maxCredits) * 100);

	const priorityPrefixes = ["CSE", "BBA", "EEE"];
	const mobileFilterCategories = ["All Courses", ...Array.from(new Set(availableCourses.map((c) => c.category ?? "GEN"))).sort((a, b) => {
		const ai = priorityPrefixes.indexOf(a);
		const bi = priorityPrefixes.indexOf(b);
		if (ai !== -1 && bi !== -1) return ai - bi;
		if (ai !== -1) return -1;
		if (bi !== -1) return 1;
		return a.localeCompare(b);
	})];

	// ===================== STEP 1 =====================
	const step1Content = (
		<div className="flex-1 flex flex-col min-h-0">
			{isMobile ? (
				// ========== MOBILE STEP 1 ==========
				<>
					{/* Mobile Header */}
					<div className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border px-4 pt-5 pb-4">
						<div className="flex items-center justify-between mb-4">
							<button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-muted">
								<ArrowLeft className="w-5 h-5 text-muted-foreground" />
							</button>
							<h1 className="text-lg font-bold text-foreground">Course Selection</h1>
							<MobileMenuDrawer activePage="Schedule Builder" />
						</div>
						{/* Search */}
						<div className="relative mb-3">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search course code or name..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-10 bg-background border-border h-11 rounded-xl"
							/>
						</div>
						{/* Filter Chips */}
						<div className="flex gap-2 overflow-x-auto pb-1">
							{mobileFilterCategories.map((cat) => (
								<button
									key={cat}
									onClick={() => setMobileFilter(cat)}
									className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${mobileFilter === cat
										? "bg-schedule-accent text-primary-foreground"
										: "bg-muted text-muted-foreground"
										}`}
								>
									{cat}
								</button>
							))}
						</div>
					</div>

					{/* Course Cards */}
					<div className="flex-1 overflow-y-auto px-4 pt-3 pb-48 space-y-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
						{filtered.map((course, i) => {
							const isSelected = selected.includes(course.id);
							const badgeLabel = course.type === "Required" ? "REQUIRED" : course.type === "Elective" && course.category === "Engineering" ? "CORE" : "ELECTIVE";
							const badgeColor = badgeLabel === "REQUIRED" ? "bg-schedule-accent/15 text-schedule-accent" : badgeLabel === "CORE" ? "bg-stat-emerald/15 text-stat-emerald" : "bg-muted text-muted-foreground";
							return (
								<motion.div
									key={course.id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.03 }}
									onClick={() => toggle(course.id)}
									className={`bg-card rounded-xl border-2 px-3.5 py-4 cursor-pointer transition-all ${isSelected
										? "border-schedule-accent shadow-[0_2px_8px_-2px_hsl(var(--schedule-accent)/0.2)]"
										: "border-border"
										}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex-1 min-w-0">
											<div className="flex items-baseline gap-2">
												<p className="text-sm font-bold text-foreground">{course.code}</p>
												{course.unicode && course.unicode !== course.code && (
													<span className="text-xs text-muted-foreground">{course.unicode}</span>
												)}
											</div>
											<p className="text-xs text-muted-foreground leading-tight mt-0.5">{course.title}</p>
										</div>
										<div className="flex items-center gap-2 flex-shrink-0 ml-3">
											<span className="text-sm font-semibold text-foreground">{course.credits.toFixed(1)}</span>
											<div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
												? "bg-schedule-accent border-schedule-accent"
												: "border-muted-foreground/30 bg-transparent"
												}`}>
												{isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
											</div>
										</div>
									</div>
								</motion.div>
							);
						})}
					</div>

					{/* Bottom Summary + Next */}
					<AnimatePresence>
						{selected.length > 0 && (
							<motion.div
								initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
								className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent"
							>
								<div className="bg-card rounded-2xl border border-border shadow-xl p-4">
									<div className="flex items-center justify-between mb-3">
										<div>
											<p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Selection Summary</p>
											<p className="text-lg font-bold text-foreground">
												{selected.length} Course{selected.length > 1 ? "s" : ""}{" "}
												<span className="text-muted-foreground font-normal">| {totalCredits.toFixed(1)} Credits</span>
											</p>
										</div>
										{/* Percentage Circle */}
										<div className="relative w-12 h-12">
											<svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
												<circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
												<circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--schedule-accent))" strokeWidth="3"
													strokeDasharray={`${(creditPercent / 100) * 125.6} 125.6`} strokeLinecap="round" />
											</svg>
											<span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-schedule-accent">{creditPercent}%</span>
										</div>
									</div>
									<Button onClick={goToStep2} className="w-full gap-2 rounded-xl py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold text-base shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.4)]">
										Next Step
										<ArrowRight className="w-5 h-5" />
									</Button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</>
			) : (
				// ========== DESKTOP STEP 1 (unchanged except color) ==========
				<>
					<div className="px-8 pt-8 pb-4">
						<div className="flex items-start justify-between">
							<div>
								<h1 className="text-2xl font-bold text-foreground">Schedule Builder</h1>
								<p className="text-muted-foreground text-sm mt-1">Step 1: Select your subjects for the upcoming semester</p>
							</div>
							<Button variant="outline" className="gap-2"><Calendar className="w-4 h-4" />Academic Calendar</Button>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
							<span className="text-primary cursor-pointer hover:underline">Portal</span><span>/</span><span>Schedule Builder</span>
						</div>
					</div>
					<div className="px-8 pb-6">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input placeholder="Search subjects (e.g. Computer Science, Calculus, Marketing)" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border h-12 rounded-xl" />
						</div>
					</div>
					<div className="flex-1 overflow-y-auto px-8 pb-32">
						<h2 className="font-semibold text-foreground text-lg mb-3">Available Courses</h2>
						<div className="bg-card rounded-xl border border-border overflow-hidden">
							<div className="grid grid-cols-[48px_240px_1fr_80px] items-center px-4 py-3 border-b border-border bg-muted/50">
								<div /><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Class Code</span>
								<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course Title</span>
								<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Credits</span>
							</div>
							{filtered.map((course, i) => {
								const isSelected = selected.includes(course.id);
								return (
									<motion.div key={course.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
										onClick={() => toggle(course.id)}
										className={`cursor-pointer transition-colors border-b border-border last:border-b-0 grid grid-cols-[48px_240px_1fr_80px] items-center px-4 py-6 ${isSelected ? "bg-schedule-accent/5" : "hover:bg-muted/50"}`}>
										<Checkbox checked={isSelected} onCheckedChange={() => toggle(course.id)} />
										<span className="text-sm font-semibold text-schedule-accent">{course.unicode ? `${course.code}/${course.unicode}` : course.code}</span>
										<div><p className="text-sm font-medium text-foreground">{course.title}</p></div>
										<span className="text-sm font-bold text-foreground text-right">{course.credits.toFixed(1)}</span>
									</motion.div>
								);
							})}
							{isLoading && <div className="py-12 text-center text-muted-foreground text-sm">Loading courses...</div>}
							{!isLoading && filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">No courses match your search.</div>}
						</div>
					</div>
					<AnimatePresence>
						{selected.length > 0 && (
							<motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-0 left-72 right-0 px-8 pb-4 z-30">
								<div className="bg-card border border-border rounded-2xl shadow-lg px-6 py-4 flex items-center justify-between">
									<span className="text-sm font-medium text-schedule-accent">{selected.length} Course{selected.length > 1 ? "s" : ""} Selected</span>
									<div className="flex items-center gap-3">
										<Button variant="ghost" onClick={() => setSelected([])} className="text-muted-foreground">Clear Selection</Button>
										<motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
											<Button onClick={goToStep2} className="gap-2 rounded-xl px-7 py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold text-sm shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.55)] hover:shadow-[0_8px_32px_-4px_hsl(var(--schedule-accent)/0.7)] transition-all duration-200">
												Next Step <ArrowRight className="w-4 h-4" />
											</Button>
										</motion.div>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</>
			)}
		</div>
	);

	// ===================== STEP 2 =====================
	const sectionsSelectedCount = Object.keys(selectedSections).length;
	const step2Content = (
		<div className="flex-1 flex flex-col min-h-0">
			{isMobile ? (
				// ========== MOBILE STEP 2 ==========
				<>
					{/* Sticky Header */}
					<div className="sticky top-0 z-20 bg-card border-b border-border">
						<div className="flex items-center px-4 py-3 gap-3">
							<button onClick={() => setStep(1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
								<ArrowLeft className="w-5 h-5 text-muted-foreground" />
							</button>
							<div className="flex-1">
								<h1 className="text-lg font-bold leading-tight text-foreground">Step 2: Section Selection</h1>
								<p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Registration Summer 2026</p>
							</div>
							<MobileMenuDrawer activePage="Schedule Builder" />
						</div>
						{/* Course Tabs */}
						<div className="px-4 overflow-x-auto pb-0">
							<div className="flex gap-6">
								{selectedCourses.map((course) => {
									const isActive = activeTab === course.id;
									const hasSection = !!selectedSections[course.id];
									return (
										<button
											key={course.id}
											onClick={() => { setActiveTab(course.id); setViewingInstructor(null); }}
											className={`flex flex-col items-center justify-center pb-3 pt-2 shrink-0 border-b-2 transition-colors ${isActive ? "border-schedule-accent text-schedule-accent" : "border-transparent text-muted-foreground"
												}`}
										>
											<span className="text-sm font-bold">{course.unicode ? `${course.code}/${course.unicode}` : course.code}</span>
											<span className="text-[10px] opacity-80">{hasSection ? "Selected" : "Pending"}</span>
										</button>
									);
								})}
							</div>
						</div>
					</div>

					{/* Section Cards */}
					<div className="flex-1 overflow-y-auto px-4 pt-4 pb-52">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-semibold text-foreground text-base">Available Sections for {activeCourse?.code}</h2>
							<Badge className="bg-muted text-muted-foreground border-border text-xs font-medium">{currentSections.length} Options</Badge>
						</div>
						<div className="space-y-4">
							{currentSections.map((section, i) => {
								const isSelected = selectedSections[activeTab] === section.id;
								const isFull = section.status === "Full";
								const instructor = instructorsData[section.instructor];
								const sectionLetter = String.fromCharCode(64 + parseInt(section.label.replace("S", "")));
								return (
									<motion.div
										key={section.id}
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: i * 0.06 }}
										onClick={() => { if (isFull) return; handleSectionSelect(section.id, activeTab); }}
										className={`bg-card rounded-2xl border-2 p-4 transition-all cursor-pointer ${isSelected
											? "border-schedule-accent shadow-[0_0_0_1px_hsl(var(--schedule-accent)/0.15)]"
											: isFull
												? "border-border opacity-60 cursor-not-allowed"
												: "border-border"
											}`}
									>
										{/* Selected badge */}
										{isSelected && (
											<div className="flex justify-end mb-1">
												<span className="text-[10px] font-bold bg-schedule-accent text-primary-foreground uppercase tracking-wider px-2.5 py-1 rounded-md">Selected</span>
											</div>
										)}

										{/* Section label + Professor info */}
										<div className="flex items-start gap-3">
											<div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
												{instructor?.avatar ? (
													<img src={`${API_BASE}${instructor.avatar}`} alt={instructor.name} className="w-full h-full object-cover" />
												) : (
													<User className="w-7 h-7 text-muted-foreground" />
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-[10px] font-bold text-schedule-accent uppercase tracking-wider">Section {sectionLetter}</p>
												<p className="text-base font-bold text-foreground">{instructor?.name || section.instructor}</p>
												<div className="flex items-center gap-1 mt-0.5">
													<Star className="w-3.5 h-3.5 fill-stat-amber text-stat-amber" />
													<span className="text-sm font-bold text-foreground">{instructor?.rating || "4.0"}</span>
													<span className="text-xs text-muted-foreground">({instructor?.reviews || 0} reviews)</span>
												</div>
											</div>
										</div>

										{/* Schedule + Room info */}
										<div className="flex gap-3 mt-3 bg-muted/50 rounded-xl p-3">
											<div className="flex items-start gap-2 flex-1">
												<Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
												<div>
													<p className="text-sm font-semibold text-foreground">{section.days}</p>
													<p className="text-xs text-muted-foreground">{section.time}</p>
												</div>
											</div>
											<div className="w-px bg-border" />
											<div className="flex items-start gap-2 flex-1">
												<Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
												<div>
													<p className="text-sm font-semibold text-foreground">{section.room}</p>
													<p className="text-xs text-muted-foreground">{section.building}</p>
												</div>
											</div>
										</div>

										{/* Seats + Action */}
										<div className="flex items-center justify-between mt-3">
											<div className="flex items-center gap-1.5">
												<div className={`w-2 h-2 rounded-full ${isFull ? "bg-destructive" : section.seats <= 5 ? "bg-stat-amber" : "bg-stat-emerald"}`} />
												<span className={`text-xs font-semibold ${isFull ? "text-destructive" : section.seats <= 5 ? "text-stat-amber" : "text-stat-emerald"}`}>
													{section.seats}/{section.totalSeats} Seats Left
												</span>
											</div>
											{isSelected ? (
												<div className="flex items-center gap-1.5 bg-schedule-accent text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
													<CheckCircle2 className="w-4 h-4" />
													Confirmed
												</div>
											) : isFull ? (
												<span className="text-sm text-muted-foreground font-medium px-4 py-2">Full</span>
											) : (
												<span className="border border-schedule-accent text-schedule-accent px-4 py-2 rounded-full text-sm font-semibold">
													Select Section
												</span>
											)}
										</div>
									</motion.div>
								);
							})}
						</div>
					</div>

					{/* Bottom Progress + Next */}
					<div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-6">
						<div className="mb-3">
							<div className="flex items-center justify-between mb-1.5">
								<p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Progress</p>
							</div>
							<div className="flex items-center justify-between mb-2">
								<p className="text-sm font-bold text-foreground">{sectionsSelectedCount} of {selectedCourses.length} Courses Selected</p>
							</div>
							<Progress value={(sectionsSelectedCount / selectedCourses.length) * 100} className="h-2 [&>div]:bg-schedule-accent" />
						</div>
						<Button
							onClick={() => setStep(3)}
							className="w-full gap-2 rounded-xl py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold text-base shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.4)]"
						>
							Next Step: Course Review
							<ArrowRight className="w-5 h-5" />
						</Button>
					</div>
				</>
			) : (
				// ========== DESKTOP STEP 2 (Reference Design) ==========
				<>
					<div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-32 py-8 pb-32">
						{/* Multi-step Progress Bar */}
						<div className="w-full max-w-4xl mx-auto flex items-center justify-between relative mb-10">
							<div className="absolute top-5 left-0 w-full h-0.5 bg-border -z-10" />
							<div className="absolute top-5 left-0 w-1/2 h-0.5 bg-primary -z-10 transition-all duration-500" />
							{[
								{ num: 1, label: "Courses", done: true },
								{ num: 2, label: "Sections", done: true },
								{ num: 3, label: "Preferences", done: false },
								{ num: 4, label: "Finalize", done: false },
							].map((s) => (
								<div key={s.num} className="flex flex-col items-center gap-2">
									<div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-background ${s.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
										}`}>{s.num}</div>
									<span className={`text-xs font-semibold ${s.done ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
								</div>
							))}
						</div>

						<div className="flex flex-col lg:flex-row gap-6 items-start">
							{/* Left Sidebar: Your Selection */}
							<aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 bg-card p-5 rounded-xl border border-border shadow-sm lg:shrink-0">
								<div className="flex flex-col mb-2">
									<h3 className="text-lg font-bold text-foreground">Your Selection</h3>
									<p className="text-sm text-muted-foreground">{selectedCourses.length - sectionsSelectedCount} courses remaining</p>
								</div>
								<div className="flex flex-col gap-3">
									{selectedCourses.map((course) => {
										const isActive = activeTab === course.id;
										const hasSection = !!selectedSections[course.id];
										return (
											<button
												key={course.id}
												onClick={() => { setActiveTab(course.id); setViewingInstructor(null); }}
												className={`flex items-center justify-between p-3 rounded-lg text-left group transition-all ${isActive
													? "border-2 border-primary bg-primary/5"
													: "border border-border hover:border-primary/50"
													}`}
											>
												<div className="flex items-center gap-3">
													<div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
														}`}>
														<BookOpen className="w-4 h-4" />
													</div>
													<div className="min-w-0">
														<p className="text-[11px] font-semibold text-muted-foreground">
															{course.code}{course.unicode && course.unicode !== course.code ? `/${course.unicode}` : ""}
														</p>
														<p className="text-sm font-bold text-foreground truncate">{course.title.length > 22 ? course.title.substring(0, 22) + "…" : course.title}</p>
													</div>
												</div>
												{isActive ? (
													<ChevronRight className="w-5 h-5 text-primary" />
												) : hasSection ? (
													<CheckCircle2 className="w-5 h-5 text-primary" />
												) : (
													<div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20" />
												)}
											</button>
										);
									})}
								</div>
								<div className="mt-4 pt-4 border-t border-border">
									<Button
										onClick={() => setStep(3)}
										disabled={sectionsSelectedCount < selectedCourses.length}
										className={`w-full gap-2 rounded-lg py-3 font-bold ${sectionsSelectedCount >= selectedCourses.length
											? "bg-primary hover:bg-primary/90 text-primary-foreground"
											: "bg-muted text-muted-foreground cursor-not-allowed"
											}`}
									>
										Next: Preferences <ArrowRight className="w-4 h-4" />
									</Button>
									<p className="text-[10px] text-center mt-2 text-muted-foreground uppercase tracking-widest font-bold">
										Select all sections to continue
									</p>
								</div>
							</aside>

							{/* Main Content: Available Sections */}
							<div className="flex-1 flex flex-col gap-6 min-w-0">
								<div className="flex flex-col gap-1">
									<h2 className="text-2xl font-bold text-foreground">{activeCourse?.code}: {activeCourse?.title}</h2>
									<p className="text-muted-foreground">Available sections for Summer 2026</p>
								</div>

								{/* Section Tabs */}
								<div className="flex border-b border-border gap-8">
									<button className="border-b-2 border-primary text-primary pb-3 font-bold text-sm">Lecture Only</button>
								</div>

								{/* Section Cards */}
								<div className="grid grid-cols-1 gap-4">
									{currentSections.map((section, i) => {
										const isSelected = selectedSections[activeTab] === section.id;
										const isFull = section.status === "Full";
										const instructor = instructorsData[section.instructor];
										const sectionNum = section.label.replace("S", "");

										return (
											<motion.div
												key={section.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: i * 0.05 }}
												onClick={() => { if (!isFull) { handleSectionSelect(section.id, activeTab); } }}
												className={`bg-card rounded-xl p-5 relative group transition-all cursor-pointer ${isSelected
													? "border-2 border-primary shadow-lg ring-4 ring-primary/5"
													: isFull
														? "border border-border opacity-60 grayscale cursor-not-allowed"
														: "border border-border hover:border-primary"
													}`}
											>
												{/* Selected Badge */}
												{isSelected && (
													<div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-4 py-1 text-xs font-bold shadow-md">
														SELECTED
													</div>
												)}

												<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
													<div className="flex gap-4 flex-1 min-w-0">
														{/* Professor Avatar */}
														<div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
															{instructor?.avatar ? (
																<img src={`${API_BASE}${instructor.avatar}`} alt={instructor?.name} className="w-full h-full object-cover" />
															) : (
																<User className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
															)}
														</div>
														<div className="flex flex-col gap-1 min-w-0">
															<div className="flex flex-wrap items-center gap-2">
																<span className="text-xs font-bold px-2 py-0.5 bg-muted text-muted-foreground rounded uppercase tracking-wider shrink-0">
																	SEC-{sectionNum.padStart(3, "0")}
																</span>
																<h4 className="text-base sm:text-lg font-bold text-foreground">{instructor?.name || section.instructor}</h4>
															</div>
															<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
																<div className="flex items-center gap-1">
																	<Star className="w-4 h-4 fill-amber-500 text-amber-500" />
																	<span className="font-bold text-foreground">{instructor?.rating || "4.0"}</span>
																	<span className="text-xs">({instructor?.reviews || 0} ratings)</span>
																</div>
															</div>
														</div>
													</div>

													{/* Schedule Info + Seats row on mobile, column on larger */}
													<div className="flex items-center justify-between sm:items-start sm:gap-6">
														{/* Schedule Info */}
														<div className="flex flex-col items-start sm:items-end gap-1">
															<p className="text-sm font-bold text-foreground">{section.days}</p>
															<p className="text-xs text-muted-foreground">{section.time}</p>
															<div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
																<Building2 className="w-3.5 h-3.5" />
																<span>{section.room}, {section.building}</span>
															</div>
														</div>

														{/* Seats */}
														<div className="flex flex-col items-center justify-center px-4 border-l border-border shrink-0">
															<div className={`font-bold text-xl leading-none ${isFull ? "text-destructive" : "text-primary"}`}>
																{section.seats}
															</div>
															<div className={`text-[10px] uppercase font-bold ${isFull ? "text-destructive" : "text-muted-foreground"}`}>
																{isFull ? "FULL" : "Seats Left"}
															</div>
														</div>
													</div>
												</div>

												{/* Expandable Bio for selected */}
												{isSelected && instructor && (
													<motion.div
														initial={{ opacity: 0, height: 0 }}
														animate={{ opacity: 1, height: "auto" }}
														className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground"
													>
														<p className="line-clamp-2">{instructor.bio}</p>
														<button className="text-primary text-xs font-bold mt-2 hover:underline">
															View Professor Portfolio & Syllabi
														</button>
													</motion.div>
												)}
											</motion.div>
										);
									})}
								</div>
							</div>
						</div>
					</div>

					{/* Floating Bottom Summary Bar */}
					<div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-3 sm:px-4 z-40">
						<div className="bg-foreground text-background rounded-2xl shadow-2xl p-3 sm:p-4 flex items-center justify-between gap-3 border border-border/10">
							<div className="flex items-center gap-3 sm:gap-6 px-2 sm:px-4">
								<div className="flex flex-col">
									<span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total Credits</span>
									<span className="text-base sm:text-lg font-bold">{totalCredits.toFixed(1)}</span>
								</div>
								<div className="h-8 w-px bg-muted-foreground/20" />
								<div className="flex flex-col">
									<span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Schedule Conflict</span>
									<span className="text-base sm:text-lg font-bold text-green-400">None</span>
								</div>
							</div>
							<div className="flex gap-2 sm:gap-4 shrink-0">
								<Button
									variant="ghost"
									onClick={() => setStep(1)}
									className="px-4 sm:px-6 py-2 rounded-xl bg-muted-foreground/10 hover:bg-muted-foreground/20 text-background font-bold text-sm"
								>
									Save Draft
								</Button>
								<Button
									onClick={() => setStep(3)}
									className="px-5 sm:px-8 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 text-sm"
								>
									Review All
								</Button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);

	// ===================== STEP 3 =====================
	const modeOptions: { key: TScheduleMode; label: string; icon: React.ReactNode; desc: string; hint: string }[] = [
		{ key: "teacher", label: "Favourite Teacher", icon: <Star className="w-5 h-5" />, desc: "Prioritize sections taught by the teachers you picked in Step 2", hint: "Matches your preferred teachers first" },
		{ key: "gap", label: "Less Time Gap", icon: <Zap className="w-5 h-5" />, desc: "Minimize waiting time between back-to-back classes", hint: "Classes scheduled close together" },
		{ key: "days", label: "Less Days", icon: <Calendar className="w-5 h-5" />, desc: "Pack all classes into the fewest weekdays possible", hint: "More free days in your week" },
	];

	const step3Content = (
		<div className="flex-1 flex flex-col min-h-0">
			{isMobile ? (
				<>
					{/* Mobile Step 3 Header */}
					<div className="sticky top-0 z-20 bg-card border-b border-border">
						<div className="flex items-center px-4 py-3 gap-3">
							<button onClick={() => setStep(2)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
								<ArrowLeft className="w-5 h-5 text-muted-foreground" />
							</button>
							<div className="flex-1">
								<h1 className="text-lg font-bold leading-tight text-foreground">Optimize</h1>
							</div>
							<MobileMenuDrawer activePage="Schedule Builder" />
						</div>
					</div>

					{/* Mobile Step 3 Content */}
					<div className="flex-1 overflow-y-auto px-4 pt-6 pb-40" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
						<div className="mb-8">
							<div className="flex justify-between items-end mb-2">
								<div>
									<p className="text-schedule-accent font-semibold text-xs uppercase tracking-wider">Step 3 of 4</p>
									<h2 className="text-2xl font-bold text-foreground mt-1">Choose Priorities</h2>
								</div>
								<p className="text-muted-foreground text-sm font-medium">75% Complete</p>
							</div>
							<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
								<div className="h-full bg-schedule-accent rounded-full transition-all duration-500" style={{ width: '75%' }} />
							</div>
						</div>

						<p className="text-sm text-muted-foreground mb-4">
							Select priorities in order of importance. First selected = highest priority.
						</p>

						<div className="space-y-3">
							{modeOptions.map((mode) => {
								const isActive = selectedModes.includes(mode.key);
								const priority = isActive ? selectedModes.indexOf(mode.key) + 1 : 0;
								return (
									<motion.button
										key={mode.key}
										onClick={() => toggleMode(mode.key)}
										whileTap={{ scale: 0.98 }}
										className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isActive
											? "border-schedule-accent bg-schedule-accent/5"
											: "border-border bg-card"
											}`}
									>
										<div className="flex items-start gap-3">
											<div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isActive ? "bg-schedule-accent/10 text-schedule-accent" : "bg-muted text-muted-foreground"}`}>
												{mode.icon}
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-bold text-foreground text-sm">{mode.label}</p>
												<p className="text-xs text-muted-foreground mt-1">{mode.desc}</p>
												<p className="text-xs text-schedule-accent/80 mt-0.5">{mode.hint}</p>
											</div>
											<div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 transition-colors text-xs font-bold ${isActive ? "bg-schedule-accent text-primary-foreground" : "border-2 border-muted-foreground/30 text-muted-foreground/30"}`}>
												{isActive ? priority : ""}
											</div>
										</div>
									</motion.button>
								);
							})}
						</div>

						{selectedModes.length > 1 && (
							<div className="mt-4 p-3 bg-schedule-accent/5 border border-schedule-accent/20 rounded-xl">
								<p className="text-xs text-schedule-accent font-medium">
									<Scale className="w-3.5 h-3.5 inline mr-1" />
									Priority order: {selectedModes.map((m, i) => `${i + 1}. ${m === "teacher" ? "Teachers" : m === "gap" ? "Less Gaps" : "Fewer Days"}`).join(", ")}
								</p>
							</div>
						)}
					</div>

					{/* Bottom CTA */}
					<div className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-4 py-4 pb-6">
						<motion.div whileTap={{ scale: 0.97 }}>
							<Button
								onClick={handleGenerate}
								disabled={isGenerating || selectedModes.length === 0}
								className="w-full gap-2 rounded-xl py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold text-base shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.4)] disabled:opacity-50"
							>
								{isGenerating ? <><Clock className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate 3 Optimized Schedules</>}
							</Button>
						</motion.div>
					</div>
				</>
			) : (
				<>
					{/* Desktop Step 3 */}
					<div className="px-8 pt-6 pb-2">
						<div className="flex items-center gap-2 text-sm flex-wrap">
							<button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors">Course Selection</button>
							<ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
							<button onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground transition-colors">Section Selection</button>
							<ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
							<span className="text-schedule-accent font-semibold">Optimization</span>
						</div>
					</div>
					<div className="px-8 pb-4">
						<h1 className="text-2xl font-bold text-foreground">Step 3: Choose Your Priorities</h1>
						<p className="text-muted-foreground text-sm mt-1">Select one or more optimization priorities. We will generate 3 schedule variations based on your choices.</p>
					</div>
					<div className="flex-1 overflow-y-auto px-8 pb-28">
						<div className="grid grid-cols-3 gap-4 mb-6">
							{modeOptions.map((mode) => {
								const isActive = selectedModes.includes(mode.key);
								const priority = isActive ? selectedModes.indexOf(mode.key) + 1 : 0;
								return (
									<motion.button
										key={mode.key}
										onClick={() => toggleMode(mode.key)}
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.98 }}
										className={`text-left p-5 rounded-xl border-2 transition-all ${isActive
											? "border-schedule-accent bg-schedule-accent/5 shadow-md"
											: "border-border bg-card hover:border-muted-foreground/30"
											}`}
									>
										<div className="flex items-center justify-between mb-3">
											<div className={`p-2.5 rounded-lg ${isActive ? "bg-schedule-accent/10 text-schedule-accent" : "bg-muted text-muted-foreground"}`}>
												{mode.icon}
											</div>
											<div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors text-xs font-bold ${isActive ? "bg-schedule-accent text-primary-foreground" : "border-2 border-muted-foreground/30 text-muted-foreground/30"}`}>
												{isActive ? priority : ""}
											</div>
										</div>
										<p className={`font-bold text-sm mb-1 ${isActive ? "text-schedule-accent" : "text-foreground"}`}>{mode.label}</p>
										<p className="text-xs text-muted-foreground">{mode.desc}</p>
										<p className="text-[11px] text-schedule-accent/70 mt-1">{mode.hint}</p>
									</motion.button>
								);
							})}
						</div>

						{selectedModes.length > 1 && (
							<div className="mb-6 p-3 bg-schedule-accent/5 border border-schedule-accent/20 rounded-xl text-center">
								<p className="text-sm text-schedule-accent font-medium">
									<Scale className="w-4 h-4 inline mr-1" />
									Priority order: {selectedModes.map((m, i) => `${i + 1}. ${m === "teacher" ? "Teachers" : m === "gap" ? "Less Gaps" : "Fewer Days"}`).join(" > ")}
								</p>
							</div>
						)}

						<div className="flex justify-center mb-8">
							<motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
								<Button
									onClick={handleGenerate}
									disabled={isGenerating || selectedModes.length === 0}
									className="gap-2 rounded-xl px-8 py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.55)] hover:shadow-[0_8px_32px_-4px_hsl(var(--schedule-accent)/0.7)] transition-all duration-200 disabled:opacity-50"
								>
									{isGenerating ? <><Clock className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate 3 Optimized Schedules</>}
								</Button>
							</motion.div>
						</div>
					</div>
				</>
			)}
		</div>
	);

	// ===================== STEP 4 =====================
	const days = ["SAT", "SUN", "MON", "TUE", "WED", "THU"];
	const timeSlots = ["08:00 AM", "09:30 AM", "11:00 AM", "12:30 PM", "02:00 PM", "03:30 PM", "05:00 PM"];
	const timetableColors = [
		{ bg: "bg-stat-blue/15", border: "border-stat-blue/30", text: "text-stat-blue" },
		{ bg: "bg-stat-amber/15", border: "border-stat-amber/30", text: "text-stat-amber" },
		{ bg: "bg-stat-emerald/15", border: "border-stat-emerald/30", text: "text-stat-emerald" },
		{ bg: "bg-stat-purple/15", border: "border-stat-purple/30", text: "text-stat-purple" },
	];

	const activeVariation = selectedSchedule !== null ? scheduleVariations[selectedSchedule] : null;

	/** Parse "09:25 am" to minutes for timetable placement */
	const parseTimeMin = (raw: string): number => {
		const m = raw.trim().toLowerCase().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
		if (!m) return 0;
		let h = parseInt(m[1], 10);
		const min = parseInt(m[2], 10);
		if (m[3] === "am" && h === 12) h = 0;
		if (m[3] === "pm" && h !== 12) h += 12;
		return h * 60 + min;
	};

	const timetableEntries: Array<{ code: string; title: string; room: string; teacher: string; day: number; startRow: number; span: number; colorIdx: number }> = [];
	if (activeVariation) {
		const dayMap: Record<string, number> = { Saturday: 0, Sunday: 1, Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 5 };
		activeVariation.sections.forEach((sec, ci) => {
			const startMin = parseTimeMin(sec.startTime);
			const endMin = parseTimeMin(sec.endTime);
			const startRow = Math.max(0, Math.floor((startMin - 480) / 90)); // 480 = 8:00 AM
			const span = Math.max(1, Math.round((endMin - startMin) / 90));
			sec.days.forEach((dayStr) => {
				const dayIdx = dayMap[dayStr];
				if (dayIdx !== undefined) {
					timetableEntries.push({ code: sec.courseCode, title: sec.title, room: sec.room, teacher: sec.teacher, day: dayIdx, startRow, span, colorIdx: ci % timetableColors.length });
				}
			});
		});
	}



	const step4Content = (
		<div className="flex-1 flex flex-col min-h-0">
			{isMobile ? (
				<>
					{/* Mobile Step 4: Schedule Variations */}
					<div className="sticky top-0 z-20 bg-card border-b border-border">
						<div className="flex items-center px-4 py-3 gap-3">
							<button onClick={() => setStep(3)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
								<ArrowLeft className="w-5 h-5 text-muted-foreground" />
							</button>
							<h1 className="text-lg font-bold leading-tight text-foreground flex-1 text-center">Schedule Variations</h1>
							<MobileMenuDrawer activePage="Schedule Builder" />
						</div>
					</div>

					{/* Variation Cards */}
					<div className="flex-1 overflow-y-auto px-4 pt-4 pb-24" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
						{generationConflicts.length > 0 && (
							<div className="mb-4 p-3 bg-stat-amber/5 border border-stat-amber/30 rounded-xl">
								{generationConflicts.map((msg, i) => (
									<p key={i} className="text-xs text-stat-amber font-medium">{msg}</p>
								))}
							</div>
						)}

						{scheduleVariations.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16">
								<Info className="w-10 h-10 text-muted-foreground mb-3" />
								<p className="font-semibold text-foreground">No Schedules Generated</p>
								<p className="text-sm text-muted-foreground mt-1 text-center">Go back and click Generate to create schedule options.</p>
							</div>
						) : (
							<>
								<div className="flex items-center justify-between px-1 mb-4">
									<h3 className="text-xl font-bold text-foreground">Recommended for You</h3>
									<Badge className="bg-schedule-accent/10 text-schedule-accent border-schedule-accent/20 text-[10px] font-semibold uppercase tracking-wider">
										{scheduleVariations.length} Variations
									</Badge>
								</div>

								<div className="space-y-5">
									{scheduleVariations.map((variation, idx) => {
										const variationIcons = [
											<Sun key="sun" className="w-12 h-12 text-schedule-accent" />,
											<Scale key="scale" className="w-12 h-12 text-schedule-accent" />,
											<Moon key="moon" className="w-12 h-12 text-schedule-accent" />,
										];

										return (
											<motion.div
												key={idx}
												initial={{ opacity: 0, y: 15 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: idx * 0.1 }}
												className="bg-card rounded-xl border border-border overflow-hidden shadow-sm"
											>
												{/* Gradient hero banner */}
												<div className={`w-full h-28 flex items-center justify-center relative ${idx === 0
													? "bg-gradient-to-br from-schedule-accent/20 to-schedule-accent/5"
													: "bg-gradient-to-br from-schedule-accent/10 to-schedule-accent/5"
													}`}>
													<div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--schedule-accent)) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
													{variationIcons[idx % 3]}
													{idx === 0 && (
														<div className="absolute top-3 right-3 bg-card/90 backdrop-blur px-3 py-1 rounded-full border border-border shadow-sm">
															<p className="text-[10px] font-bold text-schedule-accent uppercase tracking-widest leading-none">Best Match</p>
														</div>
													)}
												</div>

												{/* Content */}
												<div className="p-5 space-y-4">
													<div className="space-y-1">
														<p className="text-schedule-accent text-sm font-semibold uppercase tracking-wider">{variation.label}</p>
														<div className="flex items-center gap-2 text-xs text-muted-foreground">
															<span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {variation.daysUsed.map(d => d.slice(0, 3)).join(", ")}</span>
															<span>|</span>
															<span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{variation.avgGapMinutes}min gap</span>
															<span>|</span>
															<span className="flex items-center gap-1"><Star className="w-3 h-3" /> {variation.teacherMatchCount}/{variation.totalCourses} teachers</span>
														</div>
														<p className="text-[11px] text-schedule-accent font-medium">Score: {variation.score}/100</p>
													</div>

													{variation.conflicts.length > 0 && (
														<div className="p-2 bg-destructive/5 border border-destructive/20 rounded-lg">
															<p className="text-[10px] font-bold text-destructive uppercase tracking-wider mb-1">Conflicts Found</p>
															{variation.conflicts.map((c, ci) => (
																<p key={ci} className="text-[11px] text-destructive/80">{c.course1} vs {c.course2} on {c.day}</p>
															))}
														</div>
													)}

													{/* Section list */}
													<div className="space-y-0 bg-muted/50 p-3 rounded-lg">
														{variation.sections.map((sec, si) => (
															<div key={si} className={`flex justify-between items-start ${si > 0 ? "border-t border-border pt-2.5 mt-2.5" : ""}`}>
																<div className="min-w-0 flex-1">
																	<div className="flex items-center gap-1.5">
																		<p className="text-sm font-bold text-foreground truncate">{sec.title || sec.courseCode}</p>
																		{sec.isPreferredTeacher && <Star className="w-3 h-3 text-schedule-accent shrink-0" />}
																	</div>
																	<p className="text-[11px] text-muted-foreground">S{sec.section} | {sec.teacher} | {sec.room}</p>
																</div>
																<div className="text-right ml-2 shrink-0">
																	<p className="text-xs font-bold text-foreground">{sec.startTime} - {sec.endTime}</p>
																	<p className="text-[10px] text-muted-foreground">{sec.days.map(d => d.slice(0, 3)).join(", ")}</p>
																</div>
															</div>
														))}
													</div>

													{/* Select button */}
													<motion.button
														whileTap={{ scale: 0.98 }}
														onClick={() => { setSelectedSchedule(idx); setStep(5); }}
														className={`w-full flex items-center justify-center rounded-xl h-12 text-base font-bold transition-all ${idx === 0
															? "bg-schedule-accent text-primary-foreground"
															: "bg-muted text-foreground border border-border"
															}`}
													>
														Select This Schedule
													</motion.button>
												</div>
											</motion.div>
										);
									})}
								</div>
							</>
						)}
					</div>
				</>
			) : (
				<>
					{/* Desktop Step 4 */}
					<div className="px-8 pt-6 pb-2">
						{savedMode ? (
							<div className="flex items-center gap-2 text-sm">
								<span className="text-schedule-accent font-semibold">Your Saved Schedule</span>
							</div>
						) : (
							<div className="flex items-center gap-2 text-sm flex-wrap">
								<button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors">Schedule Builder</button>
								<ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
								<button onClick={() => { setScheduleVariations([]); setSelectedSchedule(null); setStep(3); }} className="text-muted-foreground hover:text-foreground transition-colors">Step 3: Review</button>
								<ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
								<span className="text-schedule-accent font-semibold">Step 4: Final Edit & Save</span>
							</div>
						)}
					</div>
					<div className="px-8 pb-4">
						<div className="flex items-start justify-between">
							<div>
								<h1 className="text-2xl font-bold text-foreground">{savedMode ? "Your Schedule" : "Finalize Your Schedule"}</h1>
								<p className="text-muted-foreground text-sm mt-1">{savedMode ? "This is your saved schedule for Summer 2026." : "Drag sections to swap timings or manually add missing requirements."}</p>
							</div>
							{savedMode ? (
								<Button onClick={resetAll} variant="outline" className="gap-2"><Plus className="w-4 h-4" />Rebuild Schedule</Button>
							) : (
								<div className="flex items-center gap-3">
									<Button variant="outline" className="gap-2" onClick={() => { setManualCourseId(""); setManualSectionId(""); setManualConflictMsg(""); setShowManualAdd(true); }}><PlusCircle className="w-4 h-4" />Manual Add</Button>
									<motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
										<Button onClick={handleSave} className="gap-2 rounded-xl bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.55)]"><Save className="w-4 h-4" />Save Schedule</Button>
									</motion.div>
								</div>
							)}
						</div>
					</div>
					<div className="flex-1 overflow-y-auto px-8 pb-28">
						<div className="flex gap-6">
							<div className="w-48 flex-shrink-0">
								<p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Selected Courses</p>
								<div className="space-y-2">
									{activeVariation?.sections.map((sec, ci) => (
										<div key={ci} className="bg-card rounded-lg border border-border p-3">
											<p className="text-xs font-bold text-schedule-accent">{sec.courseCode}</p>
											<p className="text-sm font-medium text-foreground">{sec.title}</p>
											<p className="text-[10px] text-muted-foreground mt-0.5">S{sec.section} · {sec.teacher}</p>
										</div>
									))}
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex border-b border-border mb-4">
									{(["weekly", "list", "conflicts"] as const).map((tab) => (
										<button key={tab} onClick={() => setStep4Tab(tab)}
											className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${step4Tab === tab ? "border-schedule-accent text-schedule-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
											{tab === "weekly" ? "Weekly View" : tab === "list" ? "List View" : "Conflicts"}
										</button>
									))}
								</div>
								{step4Tab === "weekly" && (
									<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
										<div className="grid grid-cols-[70px_repeat(6,1fr)] border-b border-border"><div />{days.map((day) => (<div key={day} className="text-center py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{day}</div>))}</div>
										<div className="relative">
											{timeSlots.map((time, rowIdx) => (
												<div key={time} className="grid grid-cols-[70px_repeat(6,1fr)] border-b border-border/50">
													<div className="py-4 pr-2 text-right text-xs text-schedule-accent font-medium">{time}</div>
													{days.map((_, dayIdx) => {
														const entry = timetableEntries.find((e) => e.day === dayIdx && e.startRow === rowIdx); return (
															<div key={dayIdx} className="relative p-1 min-h-[60px]">
																{entry && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
																	className={`absolute inset-1 rounded-lg border-l-4 ${timetableColors[entry.colorIdx].bg} ${timetableColors[entry.colorIdx].border} p-2 cursor-pointer hover:shadow-md transition-shadow`}>
																	<p className={`text-[10px] font-bold ${timetableColors[entry.colorIdx].text}`}>{entry.code}</p>
																	<p className="text-xs font-semibold text-foreground leading-tight">{entry.title.length > 18 ? entry.title.substring(0, 18) + "…" : entry.title}</p>
																	<p className="text-[10px] text-muted-foreground">{entry.room}</p>
																</motion.div>)}
															</div>
														);
													})}
												</div>
											))}
										</div>
									</motion.div>
								)}
								{step4Tab === "list" && (
									<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
										{activeVariation?.sections.map((sec, ci) => (
											<div key={ci} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${timetableColors[ci % timetableColors.length].bg}`}><span className={`text-xs font-bold ${timetableColors[ci % timetableColors.length].text}`}>{sec.courseCode.slice(0, 3)}</span></div>
													<div><p className="text-sm font-semibold text-foreground">{sec.courseCode} - {sec.title}</p><p className="text-xs text-muted-foreground">{sec.room} · {sec.days.map(d => d.slice(0, 3)).join(", ")} · {sec.startTime}-{sec.endTime}</p></div>
												</div>
											</div>
										))}
									</motion.div>
								)}
								{step4Tab === "conflicts" && (
									<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
										{activeVariation && activeVariation.conflicts.length > 0 ? (
											<div className="space-y-3">
												<div className="flex items-center gap-2 mb-2">
													<AlertTriangle className="w-5 h-5 text-stat-amber" />
													<p className="font-semibold text-foreground">{activeVariation.conflicts.length} Conflict{activeVariation.conflicts.length > 1 ? "s" : ""} Found</p>
												</div>
												{activeVariation.conflicts.map((c, ci) => (
													<div key={ci} className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
														<p className="text-sm font-semibold text-destructive">{c.course1}</p>
														<p className="text-xs text-muted-foreground my-1">conflicts with</p>
														<p className="text-sm font-semibold text-destructive">{c.course2}</p>
														<p className="text-xs text-muted-foreground mt-2">{c.day} · {c.overlap}</p>
													</div>
												))}
											</div>
										) : (
											<div className="flex flex-col items-center justify-center py-12">
												<div className="w-12 h-12 rounded-full bg-stat-emerald/10 flex items-center justify-center mb-3"><CheckCircle2 className="w-6 h-6 text-stat-emerald" /></div>
												<p className="font-semibold text-foreground">No Conflicts Detected</p>
												<p className="text-sm text-muted-foreground mt-1 text-center max-w-md">Your schedule has no time overlaps. You're ready to save.</p>
											</div>
										)}
									</motion.div>
								)}
							</div>
						</div>
						{savedMode ? (
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
								className="mt-6 bg-schedule-accent/5 border border-dashed border-schedule-accent/30 rounded-2xl p-8 text-center">
								<div className="w-14 h-14 rounded-full bg-schedule-accent/10 flex items-center justify-center mx-auto mb-4"><Calendar className="w-7 h-7 text-schedule-accent" /></div>
								<h3 className="font-bold text-foreground text-lg">Want to change your schedule?</h3>
								<p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">You can rebuild your schedule from scratch. Your current schedule will be replaced when you save a new one.</p>
								<div className="flex items-center justify-center gap-3 mt-5">
									<Button onClick={resetAll} variant="outline" className="gap-2"><Plus className="w-4 h-4" />Rebuild Schedule</Button>
								</div>
							</motion.div>
						) : (
							<>
								<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
									className="mt-6 bg-schedule-accent/5 border border-dashed border-schedule-accent/30 rounded-2xl p-6 text-center">
									<div className="w-10 h-10 rounded-full bg-schedule-accent/10 flex items-center justify-center mx-auto mb-3"><Info className="w-5 h-5 text-schedule-accent" /></div>
									<h3 className="font-bold text-foreground">Checking for Conflicts</h3>
									<p className="text-sm text-muted-foreground mt-1">No schedule overlaps detected. You are ready to save and proceed to formal advising.</p>
								</motion.div>
								<AnimatePresence>
									{saved && (
										<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 bg-stat-emerald/5 border border-stat-emerald/30 rounded-2xl p-8 text-center">
											<div className="w-14 h-14 rounded-full bg-stat-emerald/10 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-7 h-7 text-stat-emerald" /></div>
											<h3 className="font-bold text-foreground text-lg">Schedule Saved Successfully!</h3>
											<p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Your schedule has been saved. You can now proceed to formal advising or create a new schedule.</p>
											<div className="flex items-center justify-center gap-3 mt-5">
												<Button variant="outline" onClick={resetAll} className="gap-2"><Plus className="w-4 h-4" />Create New Schedule</Button>
												<Button className="gap-2 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold">Proceed to Advising<ArrowRight className="w-4 h-4" /></Button>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</>
						)}
					</div>
				</>
			)}
			<div className={`border-t border-border ${isMobile ? "px-4" : "px-8"} py-3 flex items-center justify-between text-xs text-muted-foreground`}>
				<div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-stat-emerald" /><span className="font-medium text-stat-emerald">System Ready</span><span className="mx-2">|</span><span>Summer 2026 Enrollment Phase 1</span></div>
				<span>Last Auto-saved: 2 mins ago</span>
			</div>
		</div>
	);

	// ===================== STEP 5 (Mobile Finalize) =====================
	const [mobileStep5Tab, setMobileStep5Tab] = useState<"weekly" | "list" | "conflicts">("weekly");
	const [mobileListDay, setMobileListDay] = useState<string>("SAT");

	const step5Content = (
		<div className="flex-1 flex flex-col min-h-0">
			{/* Header */}
			<div className="sticky top-0 z-20 bg-card border-b border-border">
				<div className="flex items-center px-4 py-3 gap-3">
					{!savedMode && (
						<button onClick={() => setStep(3)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
							<ArrowLeft className="w-5 h-5 text-muted-foreground" />
						</button>
					)}
					<div className="flex-1">
						<h1 className="text-lg font-bold leading-tight text-foreground">{savedMode ? "Your Schedule" : "Finalize Your Schedule"}</h1>
						<p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{savedMode ? "Summer 2026" : "Step 4 of 4"}</p>
					</div>
					<button className="flex items-center justify-center w-10 h-10 rounded-full bg-schedule-accent/10 text-schedule-accent">
						<HelpCircle className="w-5 h-5" />
					</button>
				</div>
				{/* Tabs */}
				<div className="flex px-4 gap-6">
					{(["weekly", "list", "conflicts"] as const).map((tab) => (
						<button
							key={tab}
							onClick={() => setMobileStep5Tab(tab)}
							className={`pb-3 pt-2 text-sm font-medium border-b-[3px] transition-colors ${mobileStep5Tab === tab
								? "border-schedule-accent text-schedule-accent font-bold"
								: "border-transparent text-muted-foreground"
								}`}
						>
							{tab === "weekly" ? "Weekly View" : tab === "list" ? "List View" : "Conflicts"}
						</button>
					))}
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto px-4 pt-4 pb-40" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
				{mobileStep5Tab === "weekly" && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
						{/* Mobile timetable - horizontal scrollable */}
						<div className="overflow-x-auto -mx-1" style={{ scrollbarWidth: 'none' }}>
							<div className="min-w-[600px]">
								<div className="grid grid-cols-[56px_repeat(6,1fr)] border-b border-border">
									<div />
									{days.map((day) => (
										<div key={day} className="text-center py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{day}</div>
									))}
								</div>
								<div className="relative">
									{timeSlots.map((time, rowIdx) => (
										<div key={time} className="grid grid-cols-[56px_repeat(6,1fr)] border-b border-border/50">
											<div className="py-3 pr-1 text-right text-[10px] text-schedule-accent font-medium leading-tight">{time}</div>
											{days.map((_, dayIdx) => {
												const entry = timetableEntries.find((e) => e.day === dayIdx && e.startRow === rowIdx);
												return (
													<div key={dayIdx} className="relative p-0.5 min-h-[56px]">
														{entry && (
															<motion.div
																initial={{ opacity: 0, scale: 0.9 }}
																animate={{ opacity: 1, scale: 1 }}
																transition={{ delay: 0.1 }}
																className={`absolute inset-0.5 rounded-lg border-l-[3px] ${timetableColors[entry.colorIdx].bg} ${timetableColors[entry.colorIdx].border} p-1.5 overflow-hidden`}
															>
																<p className={`text-[9px] font-bold ${timetableColors[entry.colorIdx].text}`}>{entry.code}</p>
																<p className="text-[10px] font-semibold text-foreground leading-tight truncate">{entry.title}</p>
																<p className="text-[9px] text-muted-foreground truncate">{entry.room}</p>
															</motion.div>
														)}
													</div>
												);
											})}
										</div>
									))}
								</div>
							</div>
						</div>
					</motion.div>
				)}

				{mobileStep5Tab === "list" && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
						{/* Day selector */}
						<div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
							{["SAT", "SUN", "MON", "TUE", "WED", "THU"].map((day) => {
								const isActive = mobileListDay === day;
								return (
									<button
										key={day}
										onClick={() => setMobileListDay(day)}
										className={`flex items-center justify-center min-w-[52px] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isActive
											? "bg-schedule-accent text-primary-foreground shadow-md"
											: "bg-card border border-border text-muted-foreground"
											}`}
									>
										{day}
									</button>
								);
							})}
						</div>

						{/* Classes count */}
						{(() => {
							const dayFullMap: Record<string, string> = { SAT: "Saturday", SUN: "Sunday", MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday" };
							const filteredSections = (activeVariation?.sections ?? []).filter((sec) =>
								sec.days.some((d) => d.toLowerCase().startsWith(mobileListDay.toLowerCase().slice(0, 3)))
							);
							return (
								<>
									<div className="flex items-center justify-between mb-3">
										<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{dayFullMap[mobileListDay]}</p>
										<Badge className="bg-schedule-accent/10 text-schedule-accent border-schedule-accent/20 text-[10px] font-semibold">
											{filteredSections.length} Classes
										</Badge>
									</div>
									{filteredSections.length === 0 && (
										<div className="flex flex-col items-center justify-center py-10">
											<p className="text-sm font-semibold text-foreground">No classes on {dayFullMap[mobileListDay]}</p>
											<p className="text-xs text-muted-foreground mt-1">Enjoy your free day!</p>
										</div>
									)}
								</>
							);
						})()}

						{/* Compact class cards */}
						<div className="space-y-2.5">
							{(activeVariation?.sections ?? []).filter((sec) =>
								sec.days.some((d) => d.toLowerCase().startsWith(mobileListDay.toLowerCase().slice(0, 3)))
							).map((sec, ci) => {
								const color = timetableColors[ci % timetableColors.length];
								return (
									<motion.div
										key={ci}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: ci * 0.06 }}
										className="bg-card rounded-xl border border-border px-3.5 py-3 flex items-center gap-3"
									>
										{/* Time badge */}
										<div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 bg-muted text-muted-foreground">
											<Clock className="w-4 h-4" />
											<span className="text-[9px] font-bold mt-0.5">{sec.startTime.replace(/\s*(am|pm)/i, "")}</span>
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between">
												<p className={`text-[10px] font-bold uppercase tracking-wider ${color.text}`}>{sec.courseCode}</p>
												{sec.isPreferredTeacher && (
													<span className="text-[9px] font-bold text-schedule-accent bg-schedule-accent/10 px-1.5 py-0.5 rounded-full uppercase">Preferred</span>
												)}
											</div>
											<p className="text-sm font-bold text-foreground leading-tight">{sec.title}</p>
											<div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
												<span className="flex items-center gap-0.5"><User className="w-3 h-3" /> {sec.teacher}</span>
												<span>·</span>
												<span className="flex items-center gap-0.5"><Building2 className="w-3 h-3" /> {sec.room}</span>
												<span>·</span>
												<span>{sec.days.map(d => d.slice(0, 3)).join(", ")}</span>
											</div>
										</div>
									</motion.div>
								);
							})}
						</div>

						{/* End of classes */}
						<div className="flex items-center gap-3 mt-5 mb-3">
							<div className="flex-1 h-px bg-border" />
							<span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">End of Classes</span>
							<div className="flex-1 h-px bg-border" />
						</div>
					</motion.div>
				)}

				{mobileStep5Tab === "conflicts" && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
						{activeVariation && activeVariation.conflicts.length > 0 ? (
							<div className="space-y-3">
								<div className="flex items-center gap-2 mb-2">
									<AlertTriangle className="w-5 h-5 text-stat-amber" />
									<p className="font-semibold text-foreground">{activeVariation.conflicts.length} Conflict{activeVariation.conflicts.length > 1 ? "s" : ""} Found</p>
								</div>
								{activeVariation.conflicts.map((c, ci) => (
									<div key={ci} className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
										<p className="text-sm font-semibold text-destructive">{c.course1}</p>
										<p className="text-xs text-muted-foreground my-1">conflicts with</p>
										<p className="text-sm font-semibold text-destructive">{c.course2}</p>
										<p className="text-xs text-muted-foreground mt-2">{c.day} · {c.overlap}</p>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-12">
								<div className="w-12 h-12 rounded-full bg-stat-emerald/10 flex items-center justify-center mb-3">
									<CheckCircle2 className="w-6 h-6 text-stat-emerald" />
								</div>
								<p className="font-semibold text-foreground">No Conflicts Detected</p>
								<p className="text-sm text-muted-foreground mt-1 text-center">Your schedule has no time overlaps. You're ready to save.</p>
							</div>
						)}
					</motion.div>
				)}

				{savedMode ? (
					<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
						className="mt-6 bg-schedule-accent/5 border border-dashed border-schedule-accent/30 rounded-2xl p-6 text-center">
						<div className="w-12 h-12 rounded-full bg-schedule-accent/10 flex items-center justify-center mx-auto mb-3">
							<Calendar className="w-6 h-6 text-schedule-accent" />
						</div>
						<h3 className="font-bold text-foreground text-sm">Want to change your schedule?</h3>
						<p className="text-xs text-muted-foreground mt-1">Rebuild your schedule from scratch. Your current schedule will be replaced when you save a new one.</p>
						<Button onClick={resetAll} variant="outline" className="gap-2 mt-4">
							<Plus className="w-4 h-4" />Rebuild Schedule
						</Button>
					</motion.div>
				) : (
					<>
						{/* Conflict check info */}
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
							className="mt-6 bg-schedule-accent/5 border border-dashed border-schedule-accent/30 rounded-2xl p-5 text-center">
							<div className="w-10 h-10 rounded-full bg-schedule-accent/10 flex items-center justify-center mx-auto mb-3">
								<Info className="w-5 h-5 text-schedule-accent" />
							</div>
							<h3 className="font-bold text-foreground text-sm">Checking for Conflicts</h3>
							<p className="text-xs text-muted-foreground mt-1">No schedule overlaps detected. You are ready to save.</p>
						</motion.div>

						{/* Save success */}
						<AnimatePresence>
							{saved && (
								<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
									className="mt-5 bg-stat-emerald/5 border border-stat-emerald/30 rounded-2xl p-6 text-center">
									<div className="w-14 h-14 rounded-full bg-stat-emerald/10 flex items-center justify-center mx-auto mb-4">
										<CheckCircle2 className="w-7 h-7 text-stat-emerald" />
									</div>
									<h3 className="font-bold text-foreground text-lg">Schedule Saved!</h3>
									<p className="text-sm text-muted-foreground mt-2">Your schedule has been saved. Proceed to advising or create a new one.</p>
									<div className="flex flex-col gap-3 mt-5">
										<Button onClick={resetAll} variant="outline" className="w-full gap-2">
											<Plus className="w-4 h-4" />Create New Schedule
										</Button>
										<Button className="w-full gap-2 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold">
											Proceed to Advising <ArrowRight className="w-4 h-4" />
										</Button>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</>
				)}
			</div>

			{/* Bottom Save Bar */}
			{!saved && !savedMode && (
				<div className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-4 py-4 pb-6">
					<div className="flex gap-3">
						<Button variant="outline" className="flex-1 gap-2">
							<PlusCircle className="w-4 h-4" />Manual Add
						</Button>
						<motion.div whileTap={{ scale: 0.97 }} className="flex-1">
							<Button onClick={handleSave} className="w-full gap-2 rounded-xl py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold text-base shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.4)]">
								<Save className="w-4 h-4" />Save Schedule
							</Button>
						</motion.div>
					</div>
				</div>
			)}
		</div>
	);

	const manualAddDialog = (
		<Dialog open={showManualAdd} onOpenChange={setShowManualAdd}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Manually Add Course</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 pt-2">
					<div>
						<label className="text-sm font-medium text-foreground mb-1.5 block">Course</label>
						<Select value={manualCourseId} onValueChange={(val) => { setManualCourseId(val); setManualSectionId(""); setManualConflictMsg(""); }}>
							<SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
							<SelectContent className="max-h-60">
								{availableCourses.map((c) => (
									<SelectItem key={c.id} value={c.id}>{c.code} - {c.title}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{manualCourseId && (sectionsData[manualCourseId] || []).length > 0 && (
						<div>
							<label className="text-sm font-medium text-foreground mb-1.5 block">Section</label>
							<Select value={manualSectionId} onValueChange={(val) => {
								setManualSectionId(val);
								const conflict = checkManualConflict(manualCourseId, val);
								setManualConflictMsg(conflict || "");
							}}>
								<SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger>
								<SelectContent className="max-h-60">
									{(sectionsData[manualCourseId] || []).map((s) => (
										<SelectItem key={s.id} value={s.id}>
											{s.label} - {s.instructor} ({s.days}, {s.time})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					{manualSectionId && (() => {
						const sec = (sectionsData[manualCourseId] || []).find((s) => s.id === manualSectionId);
						if (!sec) return null;
						return (
							<div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
								<div className="flex justify-between"><span className="text-muted-foreground">Instructor</span><span className="font-medium">{sec.instructor}</span></div>
								<div className="flex justify-between"><span className="text-muted-foreground">Days</span><span className="font-medium">{sec.days}</span></div>
								<div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{sec.time}</span></div>
								<div className="flex justify-between"><span className="text-muted-foreground">Room</span><span className="font-medium">{sec.room}</span></div>
								<div className="flex justify-between"><span className="text-muted-foreground">Seats</span><span className="font-medium">{sec.seats}/{sec.totalSeats}</span></div>
							</div>
						);
					})()}
					{manualConflictMsg && (
						<div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
							<AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
							<p className="text-sm text-destructive">{manualConflictMsg}</p>
						</div>
					)}
					<Button
						className="w-full gap-2 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold"
						disabled={!manualCourseId || !manualSectionId || !!manualConflictMsg}
						onClick={handleManualAdd}
					>
						<PlusCircle className="w-4 h-4" />Add to Schedule
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);

	const content = step === 1 ? step1Content : step === 2 ? step2Content : step === 3 ? step3Content : step === 4 ? step4Content : step5Content;

	// Show loading while checking for saved schedule
	if (isLoadingSaved) {
		if (isMobile) {
			return (
				<div className="h-screen bg-background flex items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<div className="w-8 h-8 border-3 border-schedule-accent border-t-transparent rounded-full animate-spin" />
						<p className="text-sm text-muted-foreground">Loading your schedule...</p>
					</div>
				</div>
			);
		}
		return (
			<div className="min-h-screen bg-background flex">
				<Sidebar activePage="Schedule Builder" />
				<main className="flex-1 flex items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<div className="w-8 h-8 border-3 border-schedule-accent border-t-transparent rounded-full animate-spin" />
						<p className="text-sm text-muted-foreground">Loading your schedule...</p>
					</div>
				</main>
			</div>
		);
	}

	if (isMobile) {
		return (
			<div className="h-screen bg-background flex flex-col overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
				<style>{`
          .mobile-schedule-builder *::-webkit-scrollbar { display: none !important; }
          .mobile-schedule-builder * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        `}</style>
				<div className="mobile-schedule-builder flex-1 flex flex-col min-h-0">
					{content}
				</div>
				{manualAddDialog}
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex">
			<Sidebar activePage="Schedule Builder" />
			<main className="flex-1 flex flex-col overflow-hidden">{content}</main>
			{manualAddDialog}
		</div>
	);
};

export default ScheduleBuilder;
