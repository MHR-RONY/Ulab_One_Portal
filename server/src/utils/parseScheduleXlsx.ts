import * as XLSX from "xlsx";
import { IScheduleUploadEntry, ITeacherDirectoryEntry } from "../types";

/**
 * Parse a time range from header text.
 * "8:00 - 9:20 am" -> { startTime: "08:00", endTime: "09:20" }
 * "12:15 - 1:35 pm" -> { startTime: "12:15", endTime: "13:35" }
 * Hours 1-7 are treated as PM (13:00-19:00) since classes run 8AM-6PM.
 */
const parseTimeRange = (
	text: string
): { startTime: string; endTime: string } | null => {
	const match = text.match(
		/(\d{1,2})\s*:\s*(\d{2})\s*[-\u2013]\s*(\d{1,2})\s*:?\s*(\d{2})/
	);
	if (!match) return null;

	const to24 = (h: number): number => (h >= 1 && h <= 7 ? h + 12 : h);

	return {
		startTime: `${String(to24(parseInt(match[1]))).padStart(2, "0")}:${match[2]}`,
		endTime: `${String(to24(parseInt(match[3]))).padStart(2, "0")}:${match[4]}`,
	};
};

/**
 * Check if a cell text looks like a time range header (e.g. "8:00 - 9:20 am")
 */
const isTimeSlotText = (text: string): boolean => {
	return /\d{1,2}\s*:\s*\d{2}\s*[-\u2013]\s*\d{1,2}\s*:?\s*\d{2}/.test(text);
};

/**
 * A dynamically detected time slot from a section header row
 */
interface IDynamicSlot {
	colIdx: number;
	startTime: string;
	endTime: string;
}

/**
 * Detect time slots from a header row by finding cells with time ranges.
 * Returns slots sorted by column index.
 */
const detectTimeSlotsFromRow = (
	row: (string | undefined)[]
): IDynamicSlot[] => {
	const slots: IDynamicSlot[] = [];
	for (let col = 0; col < row.length; col++) {
		const cell = row[col];
		if (!cell) continue;
		const parsed = parseTimeRange(String(cell).trim());
		if (parsed) {
			slots.push({ colIdx: col, ...parsed });
		}
	}
	slots.sort((a, b) => a.colIdx - b.colIdx);
	return slots;
};

/**
 * Day suffix mapping: text inside parentheses -> specific day name
 * Supports single letters (S/T/M/W) and full abbreviations (SAT/Thu)
 */
const DAY_SUFFIX_MAP: Record<string, string> = {
	S: "Sunday",
	T: "Tuesday",
	M: "Monday",
	W: "Wednesday",
	SAT: "Saturday",
	THU: "Thursday",
};

/**
 * Day group mapping - row group label to array of days
 */
const DAY_GROUPS: Record<string, string[]> = {
	"sun & tue": ["Sunday", "Tuesday"],
	"sun&tue": ["Sunday", "Tuesday"],
	"sunday & tuesday": ["Sunday", "Tuesday"],
	"mon & wed": ["Monday", "Wednesday"],
	"mon&wed": ["Monday", "Wednesday"],
	"monday & wednesday": ["Monday", "Wednesday"],
	"sat & thu": ["Saturday", "Thursday"],
	"sat&thu": ["Saturday", "Thursday"],
	"saturday & thursday": ["Saturday", "Thursday"],
	"thu & sat": ["Thursday", "Saturday"],
	"thu&sat": ["Thursday", "Saturday"],
	"thursday & saturday": ["Thursday", "Saturday"],
	thu: ["Thursday"],
	thursday: ["Thursday"],
	"eng lab & esk": ["Thursday"],
	"eng lab": ["Thursday"],
	esk: ["Thursday"],
	"cse & eee lab": ["Lab"],
	"cse&eee lab": ["Lab"],
	"cse lab": ["Lab"],
	"eee lab": ["Lab"],
};

/**
 * Convert 24-hour time string to 12-hour Dhaka format.
 * "08:00" -> "8:00 AM", "16:25" -> "4:25 PM", "12:15" -> "12:15 PM"
 */
const to12Hour = (time24: string): string => {
	const [hourStr, min] = time24.split(":");
	let hour = parseInt(hourStr);
	const ampm = hour >= 12 ? "PM" : "AM";
	if (hour === 0) hour = 12;
	else if (hour > 12) hour -= 12;
	return `${hour}:${min} ${ampm}`;
};

/**
 * Normalize room string: "PB205" -> "PB 205", "PD 202" stays "PD 202"
 * Validates room starts with PA/PB/PC/PD + 3 digits.
 */
const normalizeRoom = (raw: string): string => {
	const trimmed = raw.trim();
	const match = trimmed.match(/^(P[ABCDabcd])\s*(\d{3})/i);
	if (match) return `${match[1].toUpperCase()} ${match[2]}`;
	return trimmed;
};

/**
 * Extract parenthetical day suffix from entry text.
 * Returns the suffix letter (S/T/M/W) and the cleaned text.
 * Also handles compound suffixes like "(CSE,I)" or "(forSSE)" by stripping them.
 */
const extractDaySuffix = (
	text: string
): { cleaned: string; suffix: string } => {
	// Match trailing parenthetical day suffixes:
	// Single letter: (S), (T), (M), (W)
	// Multi-char: (SAT), (Thu), (Sat), (THU)
	const daySuffixMatch = text.match(/\s*\(([STMWstmw]|[Ss][Aa][Tt]|[Tt][Hh][Uu])\)\s*$/);
	if (daySuffixMatch) {
		const raw = daySuffixMatch[1].toUpperCase();
		return {
			cleaned: text.substring(0, daySuffixMatch.index).trim(),
			suffix: raw,
		};
	}

	// Strip other parenthetical suffixes like (CSE,I), (forSSE), (for EEE), (New), etc.
	const otherParenMatch = text.match(/\s*\([^)]*\)\s*$/);
	if (otherParenMatch) {
		return {
			cleaned: text.substring(0, otherParenMatch.index).trim(),
			suffix: "",
		};
	}

	return { cleaned: text.trim(), suffix: "" };
};

/**
 * Check if section indicates a lab: ends with "L" like "1L", "2L"
 */
const isLabSection = (section: string): boolean => {
	return /\d+L$/i.test(section.trim());
};

/**
 * For a given day suffix and day group pair, compute:
 * - days: the specific day(s) the class runs on
 * - blockedDays: the other day(s) in the pair that are blocked
 */
const computeDaysFromSuffix = (
	suffix: string,
	dayGroupDays: string[]
): { days: string[]; blockedDays: string[] } => {
	const normalizedSuffix = suffix ? suffix.toUpperCase() : "";

	// Special case: Lab-only row groups (e.g. "CSE & EEE LAB") give days=["Lab"].
	// Use the day suffix to resolve the actual day the lab runs on.
	if (dayGroupDays.length === 1 && dayGroupDays[0] === "Lab") {
		if (normalizedSuffix && DAY_SUFFIX_MAP[normalizedSuffix]) {
			return { days: [DAY_SUFFIX_MAP[normalizedSuffix]], blockedDays: [] };
		}
		// No suffix on a Lab-group entry — could not determine day
		return { days: ["Unknown"], blockedDays: [] };
	}

	if (!normalizedSuffix || !DAY_SUFFIX_MAP[normalizedSuffix]) {
		// No suffix — runs on both days of the pair
		return { days: [...dayGroupDays], blockedDays: [] };
	}

	const specificDay = DAY_SUFFIX_MAP[normalizedSuffix];
	if (dayGroupDays.includes(specificDay)) {
		const blocked = dayGroupDays.filter((d) => d !== specificDay);
		return { days: [specificDay], blockedDays: blocked };
	}

	// Suffix day not in this group — keep all days
	return { days: [...dayGroupDays], blockedDays: [] };
};

/**
 * Parse a single cell entry line into structured data.
 *
 * Patterns observed:
 *   "BUS 1101/0410-011-1101-3 - PD 202 - NNE"
 *   "BUS /0411-011-1301-5 - PD 202 - EAZ"
 *   "CSE 2202 /0613-014-2202-2 - PB 206 - TSZK (S)"
 *   "EEE 1102/0713-013-1102-1L - PB 104 - MNMA (S)"
 *   "BLL 2102/ 0931-017-2102-1-PB203-ARb"
 *   "EEE 1302/0714-016-1302-2-PA102-MisH(CSE,I)"
 *   "ECO 4603 - 1-PD 104 -LN"
 *   "GEO 2159 - 3 - PD 108 - AAR(forSSE)"
 */
const parseCellEntry = (raw: string): IScheduleUploadEntry | null => {
	const line = raw.trim();
	if (!line || line.length < 5) return null;

	// Extract day suffix before cleaning
	const { cleaned, suffix: daySuffix } = extractDaySuffix(line);

	let courseCode = "";
	let unicode = "";
	let section = "";
	let room = "";
	let teacher = "";

	// Check if the entry contains a "/" (unicode separator)
	if (cleaned.includes("/")) {
		const slashIdx = cleaned.indexOf("/");
		const beforeSlash = cleaned.substring(0, slashIdx).trim();
		const afterSlash = cleaned.substring(slashIdx + 1).trim();

		courseCode = beforeSlash.trim();

		const unicodeMatch = afterSlash.match(
			/(\d{4}[-/]\d{3}[-/]\d{4})/
		);

		if (unicodeMatch) {
			unicode = unicodeMatch[1].replace(/\//g, "-");
			const afterUnicode = afterSlash.substring(
				afterSlash.indexOf(unicodeMatch[1]) + unicodeMatch[1].length
			);

			const parts = splitByDash(afterUnicode);

			if (parts.length >= 3) {
				section = parts[0].trim();
				room = normalizeRoom(parts[1].trim());
				teacher = parts.slice(2).join("").trim();
			} else if (parts.length === 2) {
				section = parts[0].trim();
				const lastPart = parts[1].trim();
				const roomTeacher = splitRoomTeacher(lastPart);
				room = normalizeRoom(roomTeacher.room);
				teacher = roomTeacher.teacher;
			} else if (parts.length === 1) {
				section = parts[0].trim();
			}
		} else {
			const parts = splitByDash(afterSlash);
			if (parts.length >= 3) {
				unicode = parts[0].trim();
				section = parts[1].trim();
				room = normalizeRoom(parts[2].trim());
				if (parts.length >= 4) teacher = parts[3].trim();
			}
		}
	} else {
		const parts = splitByDash(cleaned);
		if (parts.length >= 4) {
			courseCode = parts[0].trim();
			section = parts[1].trim();
			room = normalizeRoom(parts[2].trim());
			teacher = parts[3].trim();
		} else if (parts.length === 3) {
			courseCode = parts[0].trim();
			section = parts[1].trim();
			const roomTeacher = splitRoomTeacher(parts[2].trim());
			room = normalizeRoom(roomTeacher.room);
			teacher = roomTeacher.teacher;
		}
	}

	// Post-processing: if teacher is empty but room has trailing letters
	// (e.g., "PB 205FK" -> room "PB 205" + teacher "FK"), separate them
	if (!teacher && room) {
		const rtMatch = room.match(/^(P[ABCDabcd]\s*\d{3})\s*([A-Za-z]{2,})$/i);
		if (rtMatch) {
			room = normalizeRoom(rtMatch[1]);
			teacher = rtMatch[2];
		}
	}

	// Clean up teacher - strip any remaining parens or whitespace
	const teacherExtracted = extractDaySuffix(teacher);
	teacher = teacherExtracted.cleaned.trim();

	// Validate minimum required fields
	if (!section && !unicode && !courseCode) return null;

	const teacherTBA =
		!teacher || teacher.toUpperCase() === "TBA" || teacher === "";

	// Clean section: strip leading dashes/spaces, keep only digits + optional trailing L
	let sectionClean = section.replace(/^[-\s]+/, "").trim();
	const sectionMatch = sectionClean.match(/(\d+L?)/i);
	if (sectionMatch) {
		sectionClean = sectionMatch[1].toUpperCase();
	}
	const isLab = isLabSection(sectionClean);

	// Clean courseCode: normalize whitespace
	courseCode = courseCode.replace(/\s+/g, " ").trim();

	// Clean unicode: keep only digits and dashes (e.g. "0613-014-2202")
	if (unicode) {
		unicode = unicode.replace(/[^\d-]/g, "").trim();
	}

	return {
		courseCode: courseCode.trim(),
		unicode: unicode.trim(),
		section: sectionClean,
		room: room.trim(),
		teacher: teacherTBA ? "TBA" : teacher.trim(),
		teacherTBA,
		isLab,
		daySuffix,
		days: [], // filled in by caller
		blockedDays: [], // filled in by caller
		startTime: "", // filled in by caller
		endTime: "", // filled in by caller
		hasConflict: false,
		conflictReason: "",
	};
};

/**
 * Smart split by dash separators.
 * Handles " - ", "-", " -", "- " but preserves room names like "PD 202"
 * and unicode like "0613-014-2202"
 */
const splitByDash = (text: string): string[] => {
	// First try splitting on " - " (space-dash-space) which is most reliable
	const spaceDashParts = text.split(/\s+-\s+/);
	if (spaceDashParts.length >= 3) return spaceDashParts;

	// If that doesn't give enough parts, try splitting more aggressively
	// But avoid splitting inside unicode (digits-digits-digits)
	// Replace unicode dashes with a placeholder
	let temp = text;
	const unicodes: string[] = [];
	temp = temp.replace(/\d{4}-\d{3}-\d{4}/g, (match) => {
		unicodes.push(match);
		return `__UNICODE${unicodes.length - 1}__`;
	});

	// Also preserve room codes like "PB205" or "PD 202"
	const parts = temp.split(/\s*-\s*/);

	// Restore unicodes and filter empty strings (leading dashes cause empty parts)
	return parts
		.map((p) =>
			p.replace(/__UNICODE(\d+)__/g, (_, idx) => unicodes[parseInt(idx)])
		)
		.filter((p) => p.trim().length > 0);
};

/**
 * Split a string that might contain "room teacher" or "room-teacher"
 * Room is letter+number pattern, teacher is remaining text
 */
const splitRoomTeacher = (
	text: string
): { room: string; teacher: string } => {
	// Strict room pattern: PA/PB/PC/PD + optional space + 3 digits
	const match = text.match(/^(P[ABCDabcd]\s*\d{3})\s*[-\u2013]?\s*(.*)$/i);
	if (match) {
		return { room: match[1], teacher: match[2] || "" };
	}
	return { room: text, teacher: "" };
};

/**
 * Detect which day group a row belongs to by scanning the first column
 * for day group labels like "Sun & Tue", "Mon & Wed"
 */
const detectDayGroup = (cellValue: string): string[] | null => {
	const lower = cellValue.toLowerCase().trim();
	for (const [key, days] of Object.entries(DAY_GROUPS)) {
		if (lower.includes(key)) return days;
	}
	return null;
};

export interface IParseResult {
	entries: IScheduleUploadEntry[];
	teacherDirectory: ITeacherDirectoryEntry[];
	errors: string[];
	totalParsed: number;
	tbaCount: number;
	conflictCount: number;
}

/**
 * Deduplicate parsed entries.
 * Key: (unicode||courseCode) + section + startTime + sorted days.
 * Keeps the first occurrence when duplicates are found.
 */
const deduplicateEntries = (
	entries: IScheduleUploadEntry[]
): IScheduleUploadEntry[] => {
	const seen = new Set<string>();
	const result: IScheduleUploadEntry[] = [];
	for (const entry of entries) {
		const id = entry.unicode || entry.courseCode;
		const key = `${id}|${entry.section}|${entry.startTime}|${[...entry.days].sort().join(",")}`;
		if (!seen.has(key)) {
			seen.add(key);
			result.push(entry);
		}
	}
	return result;
};

/**
 * Detect teacher and room conflicts across all entries.
 * Marks entries in-place with hasConflict=true and conflictReason string.
 */
const markConflicts = (entries: IScheduleUploadEntry[]): void => {
	// Build maps keyed by "day|startTime" for teacher and room
	const teacherMap = new Map<string, number[]>();
	const roomMap = new Map<string, number[]>();

	entries.forEach((entry, i) => {
		entry.days.forEach((day) => {
			if (!entry.teacherTBA && entry.teacher && entry.teacher !== "TBA") {
				const tk = `${entry.teacher}|${day}|${entry.startTime}`;
				if (!teacherMap.has(tk)) teacherMap.set(tk, []);
				teacherMap.get(tk)!.push(i);
			}
			if (entry.room) {
				const rk = `${entry.room}|${day}|${entry.startTime}`;
				if (!roomMap.has(rk)) roomMap.set(rk, []);
				roomMap.get(rk)!.push(i);
			}
		});
	});

	const addConflict = (idx: number, reason: string) => {
		const entry = entries[idx];
		entry.hasConflict = true;
		entry.conflictReason = entry.conflictReason
			? `${entry.conflictReason}; ${reason}`
			: reason;
	};

	teacherMap.forEach((indices, key) => {
		if (indices.length > 1) {
			const [teacher, day, time] = key.split("|");
			const courseIds = indices.map((i) => {
				const e = entries[i];
				return `${e.courseCode || e.unicode} Sec-${e.section}`;
			});
			const reason = `Teacher ${teacher} double-booked on ${day} at ${time}: ${courseIds.join(" vs ")}`;
			indices.forEach((i) => addConflict(i, reason));
		}
	});

	roomMap.forEach((indices, key) => {
		if (indices.length > 1) {
			const [room, day, time] = key.split("|");
			const courseIds = indices.map((i) => {
				const e = entries[i];
				return `${e.courseCode || e.unicode} Sec-${e.section}`;
			});
			const reason = `Room ${room} double-booked on ${day} at ${time}: ${courseIds.join(" vs ")}`;
			indices.forEach((i) => addConflict(i, reason));
		}
	});
};

/**
 * Parse teacher directory rows from the bottom of the sheet.
 * Format: "INITIALS - Full Name" or "INITIALS -Full Name"
 */
const parseTeacherDirectory = (
	data: (string | undefined)[][]
): ITeacherDirectoryEntry[] => {
	const directory: ITeacherDirectoryEntry[] = [];
	const seen = new Set<string>();

	for (let r = 0; r < data.length; r++) {
		const row = data[r];
		if (!row) continue;

		for (let c = 0; c < row.length; c++) {
			const cell = row[c];
			if (!cell) continue;
			const text = String(cell).trim();

			// Match pattern: ALL_CAPS_INITIALS - Full Name
			// Initials: 2-6 uppercase letters (may contain lowercase like "ARb")
			const match = text.match(/^([A-Za-z]{2,8})\s*[-–]\s*(.{3,})$/);
			if (match) {
				const initials = match[1].trim();
				const fullName = match[2].trim();

				// Validate: initials should be mostly uppercase, fullName should have spaces (multi-word name)
				if (
					/^[A-Z]/.test(initials) &&
					fullName.length > 3 &&
					!seen.has(initials)
				) {
					seen.add(initials);
					directory.push({ initials, fullName });
				}
			}
		}
	}

	return directory;
};

/**
 * Rows containing these patterns are informational notes, not schedule data.
 * Skip them entirely during parsing.
 */
const SKIP_ROW_PATTERNS: RegExp[] = [
	/^note\s+about/i,
	/^these\s+courses\s+will/i,
	/^thursday\s+and\s+saturday\s+is/i,
	/^blended\s+class/i,
	/^class\s+schedule/i,
];

const isSkippableRow = (firstCell: string): boolean => {
	const text = firstCell.trim();
	return SKIP_ROW_PATTERNS.some((p) => p.test(text));
};

/**
 * Check if a cell looks like a teacher directory entry: "INITIALS - Full Name"
 */
const isTeacherEntry = (text: string): boolean => {
	const t = text.trim();
	if (!t || t.length < 5) return false;
	// Must start with letters, then dash, then a capitalized name
	return /^[A-Za-z]{1,8}\s*[-\u2013]\s*[A-Z][a-z]/.test(t);
};

/**
 * Check if a row is part of the teacher directory by counting how many
 * cells match the "INITIALS - Full Name" pattern.
 */
const isTeacherDirectoryRow = (row: (string | undefined)[]): boolean => {
	let matchCount = 0;
	for (let c = 0; c < Math.min(row.length, 12); c++) {
		const cell = row[c];
		if (!cell) continue;
		if (isTeacherEntry(String(cell))) matchCount++;
	}
	return matchCount >= 2;
};

/**
 * Main parser: reads an Excel buffer and extracts all schedule entries
 */
export const parseScheduleXlsx = (
	fileBuffer: Buffer,
	semester: string
): IParseResult => {
	const workbook = XLSX.read(fileBuffer, { type: "buffer" });
	const entries: IScheduleUploadEntry[] = [];
	const errors: string[] = [];
	let teacherDirectory: ITeacherDirectoryEntry[] = [];

	for (const sheetName of workbook.SheetNames) {
		const sheet = workbook.Sheets[sheetName];
		if (!sheet) continue;

		const data: (string | undefined)[][] = XLSX.utils.sheet_to_json(
			sheet,
			{
				header: 1,
				defval: undefined,
				raw: false,
			}
		);

		if (data.length < 2) continue;

		// Find the first header row with time slot info
		let currentSlots: IDynamicSlot[] = [];
		let headerRowIdx = -1;

		for (let r = 0; r < Math.min(10, data.length); r++) {
			const row = data[r];
			if (!row) continue;
			const detected = detectTimeSlotsFromRow(row);
			if (detected.length >= 3) {
				headerRowIdx = r;
				currentSlots = detected;
				break;
			}
		}

		if (headerRowIdx === -1) {
			// Could not find any header row — skip this sheet
			errors.push(`Sheet "${sheetName}": No time slot header found`);
			continue;
		}

		// Process data rows after header
		let currentDays: string[] = [];

		for (let r = headerRowIdx + 1; r < data.length; r++) {
			const row = data[r];
			if (!row || row.every((c) => !c)) continue;

			// Detect teacher directory section (entries spread across multiple columns)
			if (isTeacherDirectoryRow(row)) {
				teacherDirectory = parseTeacherDirectory(data.slice(r));
				break;
			}

			const firstCell = String(row[0] || "").trim();
			if (firstCell) {
				// Skip informational note rows
				if (isSkippableRow(firstCell)) continue;

				const dayGroup = detectDayGroup(firstCell);
				if (dayGroup) {
					currentDays = dayGroup;

					// Check if this row also contains time slot headers
					// (each section has its own header row with time ranges)
					const rowSlots = detectTimeSlotsFromRow(row);
					if (rowSlots.length >= 3) {
						currentSlots = rowSlots;
						// This entire row is a section header — skip data processing
						continue;
					}
				}
			}

			// Check if entire row is a repeated time-slot header row
			// (sometimes the header spans a row right after the day group label)
			const rowSlots = detectTimeSlotsFromRow(row);
			if (rowSlots.length >= 3) {
				currentSlots = rowSlots;
				continue;
			}

			if (currentDays.length === 0 || currentSlots.length === 0) continue;

			// Process each time slot column
			for (let si = 0; si < currentSlots.length; si++) {
				const slot = currentSlots[si];
				const cellValue = row[slot.colIdx];
				if (!cellValue) continue;

				const cellText = String(cellValue).trim();
				if (!cellText) continue;

				// Skip cells that look like time headers (safety check)
				if (isTimeSlotText(cellText)) continue;

				// Split cell by newlines (multiple entries per cell)
				const lines = cellText.split(/\n|\r\n?/);

				for (const line of lines) {
					const trimmedLine = line.trim();
					if (!trimmedLine || trimmedLine.length < 3) continue;

					// Skip lines that are just time text
					if (isTimeSlotText(trimmedLine)) continue;

					try {
						const parsed = parseCellEntry(trimmedLine);
						if (parsed) {
							const { days, blockedDays } =
								computeDaysFromSuffix(
									parsed.daySuffix,
									currentDays
								);
							parsed.days = days;
							parsed.blockedDays = blockedDays;

							// Assign time from the dynamic slot
							parsed.startTime = slot.startTime;

							// Labs span 2 consecutive time slots
							if (parsed.isLab && si + 1 < currentSlots.length) {
								parsed.endTime =
									currentSlots[si + 1].endTime;
							} else {
								parsed.endTime = slot.endTime;
							}

							entries.push(parsed);
						} else {
							errors.push(
								`Row ${r + 1}, Col ${slot.colIdx + 1}: Could not parse "${trimmedLine.substring(0, 60)}"`
							);
						}
					} catch (err) {
						errors.push(
							`Row ${r + 1}, Col ${slot.colIdx + 1}: Error parsing "${trimmedLine.substring(0, 40)}"`
						);
					}
				}
			}
		}
	}

	const tbaCount = entries.filter((e) => e.teacherTBA).length;

	// Deduplicate (removes same course/lab parsed from multiple sections)
	const deduped = deduplicateEntries(entries);

	// Mark teacher and room conflicts
	markConflicts(deduped);
	const conflictCount = deduped.filter((e) => e.hasConflict).length;

	// Convert times from 24h to 12h Dhaka format
	for (const entry of deduped) {
		entry.startTime = to12Hour(entry.startTime);
		entry.endTime = to12Hour(entry.endTime);
	}

	return {
		entries: deduped,
		teacherDirectory,
		errors,
		totalParsed: deduped.length,
		tbaCount,
		conflictCount,
	};
};
