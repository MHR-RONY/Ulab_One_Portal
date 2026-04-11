# Schedule Builder — How It Works (Start to Finish)

## Overview

The Schedule Builder is a 5-step wizard that lets students pick courses, choose preferred sections/teachers, select optimization priorities, and receive algorithmically generated conflict-free schedule variations. The system spans the React frontend (ScheduleBuilder page) and the Express + MongoDB backend (schedule controller + generator utility).

---

## Step-by-Step Flow

### Step 1 — Course Selection (Frontend Only)

1. On mount, the frontend calls `GET /schedule/offered-courses?semester=<current>` to fetch all sections for the active semester from the `OfferedCourse` collection.
2. Sections are **grouped by `unicode`** (a unique course identifier like `0613-014-1302`). Each group represents one course with multiple available sections.
3. The student searches and selects courses they want to enroll in. Each selected course is stored in `selectedCourses` state.
4. Maximum **15 credits** allowed. The UI enforces this limit before permitting additional selections.
5. A **localStorage draft** (`schedule_builder_draft`) persists the entire wizard state so the student can resume later.

### Step 2 — Section & Teacher Preference (Frontend Only)

1. For each selected course, the student sees all available sections with details:
   - Section number, teacher name, days, time, room, available seats
2. The student **optionally picks a preferred section** per course. This is stored in `selectedSections` as `{ [unicode]: sectionId }`.
3. Clicking a selected section again **deselects** it (toggle behavior).
4. **Conflict prevention**: The frontend checks for time conflicts before allowing a selection. If the student tries to pick a section that overlaps with an already-selected section from another course, a toast error is shown and the selection is blocked. This uses the same open-interval overlap logic as the backend (`a.start < b.end AND b.start < a.end`).
5. These preferences are passed to the backend as teacher hints for the scoring algorithm.

### Step 3 — Optimization Mode Selection (Frontend Only)

The student picks **one or more** optimization modes (multi-select, at least one required):

| Mode | Key | What It Optimizes |
|---|---|---|
| **Preferred Teachers** | `teacher` | Maximize how many courses get the teacher the student chose in Step 2 |
| **Minimize Gaps** | `gap` | Reduce idle time between consecutive classes on the same day |
| **Fewer Days** | `days` | Pack all classes into the fewest weekdays possible |

- All three are selected by default.
- **Selection order matters** — modes are stored as an ordered array. The **first-selected mode gets the highest weight**, the second gets less, and so on. The UI shows a priority number badge (1, 2, 3) on each selected mode card to indicate the order.
- **Weight formula** (triangular/descending): For N selected modes, mode at position i gets weight `(N - i) / sum` where `sum = N*(N+1)/2`.
  - 1 mode: 100%
  - 2 modes: 67% / 33%
  - 3 modes: 50% / 33% / 17%
- A hint bar shows the priority order (e.g., "1. Teachers > 2. Less Gaps > 3. Fewer Days").
- Clicking **"Generate My Schedules"** triggers the backend call.

### Step 4 — Schedule Generation (Backend Algorithm + Frontend Display)

#### Frontend Request

```
POST /schedule/generate
{
  courseUnicodes: ["0613-014-1302", "0613-014-2206", ...],
  preferredSections: { "0613-014-1302": "mongoObjectId", ... },
  modes: ["teacher", "gap", "days"],   // ORDER MATTERS — first = highest priority
  semester: "Summer 2026"
}
```

The `modes` array preserves the student's selection order. The backend uses this order to assign descending weights.

#### Backend Processing (scheduleGenerator.ts)

The algorithm runs in **7 phases**:

---

**Phase 1 — Group sections by course**

All `OfferedCourse` documents matching the semester and requested unicodes are fetched from MongoDB. They are grouped into a `Map<unicode, SectionMeta[]>`. Each `SectionMeta` contains pre-parsed `startMin`/`endMin` (minutes since midnight) for fast comparison.

Time parsing: `"09:25 am"` becomes `565`, `"01:35 pm"` becomes `815`.

---

**Phase 2 — Derive preferred teachers**

For each `preferredSections` entry, the algorithm looks up which teacher belongs to that section ID. This builds a `Map<unicode, teacherName>` used later during scoring.

---

**Phase 3 — Backtracking search (conflict-free)**

A recursive backtracking function explores all possible combinations of one-section-per-course:

```
bt(courseIndex, currentPicks[]):
  if courseIndex === totalCourses:
    store currentPicks as a valid combination
    return

  for each section of course[courseIndex]:
    if section has NO time conflict with any already-picked section:
      pick it, recurse to courseIndex + 1, then unpick
```

**Conflict check**: Two sections conflict if they share at least one common day AND their time ranges overlap (`a.start < b.end AND b.start < a.end`).

**Safety caps**:
- `MAX_VALID = 500` — stop after finding 500 valid combos
- `MAX_NODES = 200,000` — stop after exploring 200K tree nodes

These caps prevent the algorithm from running too long when a student has many courses with many sections each.

---

**Phase 4 — Fallback with pruning (allow conflicts)**

If **zero** conflict-free combos were found, the algorithm runs a second backtracking pass that allows conflicts. Unlike Phase 3, this pass does not skip conflicting sections — but it **prunes intelligently**:

```
btAll(courseIndex, currentPicks[], currentConflictCount):
  if currentConflictCount > bestFoundCount: PRUNE (skip entire branch)
  if courseIndex === totalCourses:
    store combo with its conflict count
    update bestFoundCount if this is fewer
    return

  for each section of course[courseIndex]:
    count how many conflicts this section adds vs already-picked sections
    recurse with currentConflictCount + addedConflicts
```

Key optimizations over brute-force:
- **Branch pruning**: If the current path already has more conflicts than the best complete combo found so far, the entire subtree is skipped.
- **Incremental conflict counting**: Instead of recounting all pairwise conflicts at every leaf node, conflicts are counted incrementally as each section is added.

The top 50 combos with the **fewest conflicts** proceed to scoring.

A warning message is returned: *"No conflict-free schedule exists for your selected courses. Showing options with the fewest overlaps."*

---

**Phase 5 — Priority-Weighted Scoring**

Each valid combo is scored on a 0-to-1 scale using three normalized metrics:

| Metric | Formula | Best = 1, Worst = 0 |
|---|---|---|
| **Teacher Match (tNorm)** | `matchedCourses / totalCourses` | All courses got the preferred teacher |
| **Gap Efficiency (gNorm)** | `1 - (thisGap / maxGapAcrossAllCombos)` | Zero gap between classes |
| **Day Compactness (dNorm)** | `1 - (daysUsed - 1) / 5` | All classes on 1 day (6-day week: SAT-THU, divisor = 5) |

**TBA teacher handling**: If a student's preferred section has teacher "TBA", that course is excluded from teacher match scoring. Matching "TBA" to "TBA" is meaningless since the actual teacher is unknown.

The final score is a **priority-weighted average** based on the ordered modes:

```
score = (wTeacher * tNorm) + (wGap * gNorm) + (wDays * dNorm)
```

**Weight assignment** — uses triangular (descending) weights based on selection order:

```
For N modes, position i (0-indexed) gets weight: (N - i) / sum
where sum = N * (N + 1) / 2
```

| Selection Order | Weights |
|---|---|
| 1 mode selected | 100% |
| 2 modes: [A, B] | A = 67%, B = 33% |
| 3 modes: [A, B, C] | A = 50%, B = 33%, C = 17% |

**Example**: Student selects modes in order: `["days", "teacher", "gap"]`
- `wDays = 3/6 = 0.50` (first selected, highest priority)
- `wTeacher = 2/6 = 0.33`
- `wGap = 1/6 = 0.17` (last selected, lowest priority)
- Score = `0.33 * tNorm + 0.17 * gNorm + 0.50 * dNorm`

If only `teacher` and `gap` are selected: `wTeacher = 2/3 = 0.67`, `wGap = 1/3 = 0.33`, `wDays = 0`.

**Conflict count pre-computation**: Conflict counts for each combo are computed once before sorting (not inside the sort comparator), avoiding redundant O(n^2) recalculations during the ~O(n log n) sort.

---

**Phase 6 — Pick top 3 diverse variations**

Combos are sorted by:
1. Fewest conflicts (only matters in fallback mode)
2. Highest score

The algorithm picks the top 3, but enforces **diversity**: a combo is skipped if it uses the exact same set of section IDs as an already-picked combo. This ensures the student sees meaningfully different options.

---

**Phase 7 — Build response**

Each picked combo is transformed into an `IScheduleVariation` containing:

```typescript
{
  label: "Variation 1",
  isBest: true,          // first = best
  score: 87,             // 0-100
  totalDays: 3,
  daysUsed: ["Sunday", "Tuesday", "Wednesday"],
  avgGapMinutes: 25,     // totalGap / daysUsed
  teacherMatchCount: 4,  // out of totalCourses
  totalCourses: 5,
  conflicts: [],         // empty if conflict-free
  sections: [
    {
      sectionId: "...",
      courseCode: "CSE 014",
      unicode: "0613-014-1302",
      title: "Data Structures",
      section: "3",
      teacher: "Dr. Ahmed",
      days: ["Sunday", "Tuesday"],
      startTime: "09:25 am",
      endTime: "10:45 am",
      room: "Room 501",
      isLab: false,
      isPreferredTeacher: true
    },
    // ... one per course
  ]
}
```

#### Frontend Display

- **Mobile**: Each variation is a full card showing score, gap, teacher matches, days, conflict warnings (if any), and the complete section list. Tapping "Select This Schedule" advances to Step 5.
- **Desktop**: The selected variation's weekly timetable is rendered directly with a sidebar showing the section list, plus List View and Conflicts tabs.

The timetable is built by mapping each section's days (full names like "Sunday") to column indices and parsing times to row positions on a time grid (8:00 AM to 6:00 PM).

### Step 5 — Finalize & Save

1. The student reviews the selected variation in weekly/list/conflicts views.
2. Clicking **"Save Schedule"** calls:

```
POST /schedule/save-sections
{ sectionIds: ["mongoId1", "mongoId2", ...], semester: "Summer 2026" }
```

3. The backend performs several safety checks before committing:

   **a. Double-save prevention**: Queries `ScheduleModel` for an existing schedule by this student for this semester. If found, returns `409 Conflict` — a student can only save one schedule per semester.

   **b. Atomic seat decrement**: Each section is updated using:
   ```
   findOneAndUpdate({ _id: id, seats: { $gt: 0 } }, { $inc: { seats: -1 } })
   ```
   The `seats > 0` filter is **atomic** — the check and decrement happen in a single database operation. This prevents seats from going negative, even under concurrent requests.

   **c. Rollback on partial failure**: If any section fails (full or not found), all previously decremented seats are restored using `$inc: { seats: 1 }`. The response returns `409` with a message indicating which sections were full. No partial saves occur.

   **d. Student record creation**: On success, a `Schedule` document is created linking the student to their saved section IDs and semester. This serves as the enrollment record and enables the double-save check.

4. On success, the localStorage draft is cleared and a success message is shown.
5. On failure, the backend error message (e.g., "2 section(s) are full") is displayed to the student via toast.

---

## Data Flow Diagram

```
Student (Browser)
  |
  |-- Step 1: GET /schedule/offered-courses?semester=...
  |            Returns all OfferedCourse docs for semester
  |
  |-- Step 2: (frontend-only, user picks sections)
  |
  |-- Step 3: (frontend-only, user picks modes)
  |
  |-- Step 4: POST /schedule/generate
  |            Body: { courseUnicodes, preferredSections, modes, semester }
  |            |
  |            +-- Controller validates input
  |            +-- Queries OfferedCourseModel.find({ semester, unicode/courseCode in list })
  |            +-- Calls generateScheduleVariations()
  |            |     |
  |            |     +-- Phase 1: Group sections by unicode
  |            |     +-- Phase 2: Map preferred teachers
  |            |     +-- Phase 3: Backtrack (conflict-free)
  |            |     +-- Phase 4: Fallback (if needed)
  |            |     +-- Phase 5: Score all combos
  |            |     +-- Phase 6: Pick top 3 diverse
  |            |     +-- Phase 7: Build response
  |            |
  |            Returns: { variations: [...], hasConflicts, conflictMessages }
  |
  |-- Step 5: POST /schedule/save-sections
  |            Body: { sectionIds: [...], semester: "Summer 2026" }
  |            |
  |            +-- Check: student already saved this semester? --> 409
  |            +-- Atomic decrement seats (only if seats > 0)
  |            +-- If any section full --> rollback all, return 409
  |            +-- Create Schedule record (student + sections + semester)
  |            +-- Return success
  |
  Done.
```

---

## Key Database Model: OfferedCourse

```typescript
{
  courseCode: "CSE 014",
  unicode: "0613-014-1302",       // unique course identifier, used for grouping
  title: "Data Structures",
  section: "3",
  room: "Room 501",
  teacherFullName: "Dr. Ahmed",
  teacherInitials: "AH",
  teacherTBA: false,
  isLab: false,
  days: ["Sunday", "Tuesday"],     // full day names
  startTime: "09:25 am",           // 12-hour format with am/pm
  endTime: "10:45 am",
  semester: "Summer 2025",
  seats: 30,
  totalSeats: 40
}
```

---

## Conflict Detection Logic

Two sections **conflict** if and only if:
1. They share **at least one common day** (e.g., both have "Sunday")
2. Their time ranges **overlap** on that day: `A.start < B.end AND B.start < A.end`

This is checked pairwise between every already-picked section and the candidate section during backtracking, providing aggressive pruning (entire branches are skipped as soon as one conflict is found).

---

## Performance Characteristics

| Factor | Bound |
|---|---|
| Max valid combos explored | 500 |
| Max tree nodes explored | 200,000 |
| Worst-case time complexity | O(S^C) where S = max sections per course, C = number of courses |
| Typical execution | < 100ms for 5-6 courses with ~10 sections each |
| Fallback pass | Only runs if zero conflict-free combos found |
| Fallback pruning | Skips branches exceeding best-found conflict count |
| Sort optimization | Conflict counts pre-computed once, not inside comparator |

The 200K node cap ensures the algorithm always returns in bounded time, even if a student selects many courses with dozens of sections each.

---

## Safety & Data Integrity

| Protection | How |
|---|---|
| Seats can't go negative | Atomic `seats > 0` filter in MongoDB update |
| No double-save | `ScheduleModel.findOne({ student, semester })` check before save |
| Partial failure rollback | If any section is full, all previously decremented seats are restored |
| Student record created | `Schedule` document links student to sections and semester |
| TBA teacher excluded | "TBA" preferences are ignored in scoring to prevent false matches |
| Frontend conflict guard | Step 2 blocks section picks that time-conflict with existing selections |
