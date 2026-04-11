/**
 * Schedule Generator — Backtracking with Multi-Mode Scoring
 *
 * Given selected courses, preferred sections (teacher hints), and optimization
 * modes, finds the top 3 conflict-free schedule variations.
 *
 * Modes (multi-select):
 *   "teacher" — prefer sections whose teacher matches the student's Step 2 pick
 *   "gap"     — minimize total gap minutes between consecutive classes per day
 *   "days"    — pack classes into the fewest distinct weekdays
 */

import {
	IOfferedCourse,
	TScheduleMode,
	IGeneratedSection,
	IScheduleConflict,
	IScheduleVariation,
	IGenerateScheduleResponse,
} from "../types";

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

interface SectionMeta {
	_id: string;
	unicode: string;
	courseCode: string;
	title: string;
	section: string;
	teacher: string;
	days: string[];
	startTime: string;
	endTime: string;
	room: string;
	isLab: boolean;
	startMin: number;
	endMin: number;
}

/** Parse "09:25 am" / "01:35 pm" to minutes since midnight */
function parseTime(raw: string): number {
	const m = raw.trim().toLowerCase().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
	if (!m) return 0;
	let h = parseInt(m[1], 10);
	const min = parseInt(m[2], 10);
	if (m[3] === "am" && h === 12) h = 0;
	if (m[3] === "pm" && h !== 12) h += 12;
	return h * 60 + min;
}

/** Convert DB doc to lightweight SectionMeta */
function toMeta(doc: IOfferedCourse): SectionMeta {
	return {
		_id: String(doc._id),
		unicode: doc.unicode,
		courseCode: doc.courseCode,
		title: doc.title,
		section: doc.section,
		teacher: doc.teacherTBA
			? "TBA"
			: doc.teacherFullName || doc.teacherInitials || "TBA",
		days: doc.days,
		startTime: doc.startTime,
		endTime: doc.endTime,
		room: doc.room,
		isLab: doc.isLab,
		startMin: parseTime(doc.startTime),
		endMin: parseTime(doc.endTime),
	};
}

/** Do two sections overlap on any shared day? */
function findConflict(
	a: SectionMeta,
	b: SectionMeta,
): { hit: boolean; day: string; overlap: string } {
	for (const dA of a.days) {
		for (const dB of b.days) {
			if (dA === dB && a.startMin < b.endMin && b.startMin < a.endMin) {
				return {
					hit: true,
					day: dA,
					overlap: `${a.startTime}-${a.endTime} overlaps ${b.startTime}-${b.endTime}`,
				};
			}
		}
	}
	return { hit: false, day: "", overlap: "" };
}

/** Total gap in minutes between consecutive classes on the same day */
function totalGap(sections: SectionMeta[]): number {
	const byDay = new Map<string, SectionMeta[]>();
	for (const s of sections) {
		for (const d of s.days) {
			const arr = byDay.get(d) ?? [];
			arr.push(s);
			byDay.set(d, arr);
		}
	}
	let gap = 0;
	for (const [, arr] of byDay) {
		if (arr.length < 2) continue;
		arr.sort((a, b) => a.startMin - b.startMin);
		for (let i = 1; i < arr.length; i++) {
			const g = arr[i].startMin - arr[i - 1].endMin;
			if (g > 0) gap += g;
		}
	}
	return gap;
}

/** Unique weekdays used */
function uniqueDays(sections: SectionMeta[]): string[] {
	const order = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
	const set = new Set<string>();
	for (const s of sections) for (const d of s.days) set.add(d);
	return order.filter((d) => set.has(d));
}

/** Count how many sections match the student's preferred teacher */
function teacherMatches(
	sections: SectionMeta[],
	preferred: Map<string, string>,
): number {
	let n = 0;
	for (const s of sections) {
		const want = preferred.get(s.unicode);
		// Skip TBA — matching "TBA" to "TBA" is meaningless
		if (want && want !== "TBA" && s.teacher === want) n++;
	}
	return n;
}

/* ------------------------------------------------------------------ */
/*  Public entry point                                                 */
/* ------------------------------------------------------------------ */

export interface GenerateInput {
	courseUnicodes: string[];
	preferredSections: Record<string, string>;
	modes: TScheduleMode[];
	allSections: IOfferedCourse[];
}

export function generateScheduleVariations(
	input: GenerateInput,
): IGenerateScheduleResponse {
	const { courseUnicodes, preferredSections, modes, allSections } = input;

	// 1. Group sections by course unicode
	const groups = new Map<string, SectionMeta[]>();
	for (const doc of allSections) {
		const key = doc.unicode || doc.courseCode;
		if (!courseUnicodes.includes(key)) continue;
		const arr = groups.get(key) ?? [];
		arr.push(toMeta(doc));
		groups.set(key, arr);
	}

	// 2. Derive preferred teacher per course from selectedSections
	const preferredTeachers = new Map<string, string>();
	for (const [unicode, sectionId] of Object.entries(preferredSections)) {
		const list = groups.get(unicode);
		if (!list) continue;
		const match = list.find((s) => s._id === sectionId);
		if (match) preferredTeachers.set(unicode, match.teacher);
	}

	const ordered = courseUnicodes.filter((u) => groups.has(u));
	if (ordered.length === 0) {
		return { variations: [], hasConflicts: false, conflictMessages: [] };
	}

	// 2b. When teacher is the top priority, reorder sections so preferred
	//     teacher's section comes first per course — backtracking tries it first
	const teacherIsTop = modes.length > 0 && modes[0] === "teacher";
	if (teacherIsTop) {
		for (const [unicode, list] of groups) {
			const prefTeacher = preferredTeachers.get(unicode);
			if (!prefTeacher || prefTeacher === "TBA") continue;
			list.sort((a, b) => {
				const aMatch = a.teacher === prefTeacher ? 0 : 1;
				const bMatch = b.teacher === prefTeacher ? 0 : 1;
				return aMatch - bMatch;
			});
		}
	}

	// 3. Backtracking — collect conflict-free combos
	const valid: SectionMeta[][] = [];
	const MAX_VALID = 500;
	const MAX_NODES = 200_000;
	let nodes = 0;

	function bt(idx: number, cur: SectionMeta[]) {
		if (nodes >= MAX_NODES || valid.length >= MAX_VALID) return;
		nodes++;

		if (idx === ordered.length) {
			valid.push([...cur]);
			return;
		}

		const secs = groups.get(ordered[idx]) ?? [];
		for (const sec of secs) {
			let ok = true;
			for (const picked of cur) {
				if (findConflict(sec, picked).hit) {
					ok = false;
					break;
				}
			}
			if (ok) {
				cur.push(sec);
				bt(idx + 1, cur);
				cur.pop();
			}
		}
	}

	bt(0, []);

	// 4. Fallback — allow conflicts if no clean combos
	let hasConflicts = false;
	const conflictMessages: string[] = [];

	if (valid.length === 0) {
		hasConflicts = true;
		conflictMessages.push(
			"No conflict-free schedule exists for your selected courses. Showing options with the fewest overlaps.",
		);

		nodes = 0;
		const withConflicts: { secs: SectionMeta[]; cnt: number }[] = [];
		let bestCnt = Infinity;

		function btAll(idx: number, cur: SectionMeta[], curCon: number) {
			if (nodes >= MAX_NODES || withConflicts.length >= MAX_VALID) return;
			// Prune: this path already has more conflicts than the best complete combo
			if (curCon > bestCnt) return;
			nodes++;
			if (idx === ordered.length) {
				withConflicts.push({ secs: [...cur], cnt: curCon });
				if (curCon < bestCnt) bestCnt = curCon;
				return;
			}
			const secs = groups.get(ordered[idx]) ?? [];
			for (const sec of secs) {
				// Count new conflicts this section introduces
				let added = 0;
				for (const picked of cur) {
					if (findConflict(sec, picked).hit) added++;
				}
				cur.push(sec);
				btAll(idx + 1, cur, curCon + added);
				cur.pop();
			}
		}

		btAll(0, [], 0);
		withConflicts.sort((a, b) => a.cnt - b.cnt);
		for (const c of withConflicts.slice(0, 50)) valid.push(c.secs);
	}

	if (valid.length === 0) {
		return {
			variations: [],
			hasConflicts: true,
			conflictMessages: [
				"Unable to generate any schedule for the selected courses.",
			],
		};
	}

	// 5. Score every combo — order matters: first mode = highest priority
	const orderedModes = modes.length > 0 ? modes : (["teacher", "gap", "days"] as TScheduleMode[]);
	const modeWeights = new Map<TScheduleMode, number>();
	const n_modes = orderedModes.length;
	const weightSum = (n_modes * (n_modes + 1)) / 2; // e.g. 3+2+1=6 for 3 modes
	orderedModes.forEach((m, i) => {
		modeWeights.set(m, (n_modes - i) / weightSum); // first=highest
	});
	const wTeacher = modeWeights.get("teacher") ?? 0;
	const wGap = modeWeights.get("gap") ?? 0;
	const wDays = modeWeights.get("days") ?? 0;

	const stats = valid.map((combo) => ({
		combo,
		gap: totalGap(combo),
		days: uniqueDays(combo).length,
		tm: teacherMatches(combo, preferredTeachers),
	}));

	const maxGap = Math.max(...stats.map((s) => s.gap), 1);
	const n = ordered.length;

	const scored = stats.map((s) => {
		const tNorm = n > 0 ? s.tm / n : 0;
		const gNorm = 1 - s.gap / maxGap;
		const dNorm = 1 - (s.days - 1) / 5; // 6 possible days (SAT-THU), divisor = 5
		const score = wTeacher * tNorm + wGap * gNorm + wDays * Math.max(dNorm, 0);
		const con = countConflicts(s.combo); // pre-compute once, not in sort
		return { ...s, score, con };
	});

	scored.sort((a, b) => {
		// Fewer conflicts first (only matters when hasConflicts)
		if (a.con !== b.con) return a.con - b.con;
		// When teacher is the top priority, sort by teacher match count first
		// This ensures maximum teacher matches always wins regardless of other scores
		if (teacherIsTop && a.tm !== b.tm) return b.tm - a.tm;
		return b.score - a.score;
	});

	// 6. Pick top 3 diverse combos
	const picked: typeof scored = [];
	for (const c of scored) {
		if (picked.length >= 3) break;
		const dup = picked.some((p) => {
			const ids = new Set(p.combo.map((s) => s._id));
			return c.combo.every((s) => ids.has(s._id));
		});
		if (!dup) picked.push(c);
	}

	// 7. Build response
	const variations: IScheduleVariation[] = picked.map((p, i) => {
		const conflicts: IScheduleConflict[] = [];
		for (let a = 0; a < p.combo.length; a++) {
			for (let b = a + 1; b < p.combo.length; b++) {
				const r = findConflict(p.combo[a], p.combo[b]);
				if (r.hit) {
					conflicts.push({
						course1: `${p.combo[a].courseCode} ${p.combo[a].title} (S${p.combo[a].section})`,
						course2: `${p.combo[b].courseCode} ${p.combo[b].title} (S${p.combo[b].section})`,
						day: r.day,
						overlap: r.overlap,
					});
				}
			}
		}

		const sections: IGeneratedSection[] = p.combo.map((s) => ({
			sectionId: s._id,
			courseCode: s.courseCode,
			unicode: s.unicode,
			title: s.title,
			section: s.section,
			teacher: s.teacher,
			days: s.days,
			startTime: s.startTime,
			endTime: s.endTime,
			room: s.room,
			isLab: s.isLab,
			isPreferredTeacher: preferredTeachers.get(s.unicode) === s.teacher,
		}));

		const daysUsed = uniqueDays(p.combo);

		return {
			label: `Variation ${i + 1}`,
			isBest: i === 0,
			score: Math.round(p.score * 100),
			totalDays: daysUsed.length,
			daysUsed,
			avgGapMinutes: Math.round(p.gap / Math.max(daysUsed.length, 1)),
			teacherMatchCount: p.tm,
			totalCourses: n,
			conflicts,
			sections,
		};
	});

	return { variations, hasConflicts, conflictMessages };
}

/* ------------------------------------------------------------------ */
/*  Small internal util                                                */
/* ------------------------------------------------------------------ */
function countConflicts(combo: SectionMeta[]): number {
	let c = 0;
	for (let a = 0; a < combo.length; a++)
		for (let b = a + 1; b < combo.length; b++)
			if (findConflict(combo[a], combo[b]).hit) c++;
	return c;
}
