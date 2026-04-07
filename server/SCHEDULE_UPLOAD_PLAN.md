# Schedule Data Upload & Extraction Plan

## 1. Understanding the Raw Excel Data

The university provides schedule data in `.xlsx` files. Each row in a cell represents a **single course section offering** at a specific time slot.

### Data Format Per Cell

Each cell entry follows this general pattern:

```
[COURSE_CODE] [UNICODE] - [SECTION] - [ROOM] - [TEACHER] [(TYPE)]
```

### Observed Variations

| Pattern                         | Example                                         | Explanation                                                                                 |
| ------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Course code + unicode           | `BUS 1101/0410-011-1101-3 - PD 202 - NNE`       | Has both course code (`BUS 1101`) and unicode (`0410-011-1101`), section `3`                |
| Unicode only (no course number) | `BUS /0411-011-1301-5 - PD 202 - EAZ`           | Department prefix `BUS` but no course number, unicode `0411-011-1301`, section `5`          |
| Teacher is TBA                  | `CSE /0613-014-1202-4 - PB205 - TBA (S)`        | Teacher not yet assigned, shows `TBA`                                                       |
| Day suffix                      | `CSE 2202 /0613-014-2202-2 - PB 206 - TSZK (S)` | `(S)` = Sunday only, `(T)` = Tuesday only, `(M)` = Monday only, `(W)` = Wednesday only      |
| Lab section                     | `EEE 1102/0713-013-1102-1L - PB 104 - MNMA (S)` | `1L` = lab section, runs on 1 day only (suffix tells which), spans 2 consecutive time slots |
| Multiple course codes           | `EEE 1302/0714-016-1302-2-PA102-MisH(CSE,I)`    | Cross-listed with department info in parentheses                                            |
| Combined entries                | `CSE 2102/0613-013-2102-1L-PB 104-MNMA (S)`     | Spacing varies, dash-separated                                                              |
| CSE & EEE LAB row               | `CSE 4462-1L-PB 103-DANT (S)`                   | Separate lab section with different time slots (Thu labs)                                   |

### Column Structure (Time Slots)

| Column | Time             |
| ------ | ---------------- |
| 1      | 8:00 - 9:20 AM   |
| 2      | 9:25 - 10:45 AM  |
| 3      | 10:50 - 12:10 PM |
| 4      | 12:15 - 1:35 PM  |
| 5      | 1:40 - 3:00 PM   |
| 6      | 3:05 - 4:25 PM   |
| 7      | 4:30 - 5:50 PM   |

### Row Groups (Days)

| Group         | Days                                                     |
| ------------- | -------------------------------------------------------- |
| Sun & Tue     | Sunday and Tuesday (same schedule for regular classes)   |
| Mon & Wed     | Monday and Wednesday (same schedule for regular classes) |
| Thu           | Thursday (standalone day, different time slots)          |
| CSE & EEE LAB | Thursday labs (separate section with wider time slots)   |

### Day Suffix Meanings

Suffixes like `(S)`, `(T)`, `(M)`, `(W)` on entries indicate the **specific day** the class runs:

| Suffix | Day            |
| ------ | -------------- |
| `(S)`  | Sunday only    |
| `(T)`  | Tuesday only   |
| `(M)`  | Monday only    |
| `(W)`  | Wednesday only |

This matters especially for **labs**: A lab marked `(S)` in the Sun & Tue group means it **only runs on Sunday**. On Tuesday, that time slot is **blocked** (no other class can be taken there).

### Lab Rules

- Labs have section suffix `L` (e.g., `1L`, `2L`)
- Labs span **2 consecutive time slots** (2 hours 45 minutes total)
- Labs run on **only 1 day** out of the day pair (indicated by suffix)
- On the **other day**, the same time slots are **blocked** — cannot schedule any class there
- Example: `CSE 4462-1L-PB 103-DANT (S)` at 10:50-12:10 means:
  - Sunday: Lab runs from 10:50 AM to 1:35 PM (slots 3+4)
  - Tuesday: Slots 3+4 are blocked (no class allowed)

### Thursday Time Slots (Different from Sun/Tue, Mon/Wed)

| Column | Time             |
| ------ | ---------------- |
| 1      | 8:00 - 10:00 AM  |
| 2      | 10:10 - 12:10 PM |
| 3      | 12:20 - 2:20 PM  |
| 4      | 2:30 - 4:30 PM   |
| 5      | 1:40 - 3:00 PM   |

### Teacher Directory (Bottom of Excel)

At the bottom of the Excel file, there is a **teacher directory** mapping initials to full names:

```
AAMM - Azaz Ahmed
DSMPH - Md. Mehadhi Haseen
KAS - Kamar Ahmad Simon
FHR - Farhan Khan
MAbr - Md.Abdullah
... (many more)
```

Format: `INITIALS - Full Name`

This data must be extracted and stored to map teacher initials in schedule entries to real teacher names.

### Extracted Fields Per Entry

| Field        | Required          | Example                      | Notes                                                                       |
| ------------ | ----------------- | ---------------------------- | --------------------------------------------------------------------------- |
| `courseCode` | Sometimes present | `BUS 1101`, `CSE 2202`       | May be empty — only department prefix before `/`                            |
| `unicode`    | Always present    | `0410-011-1101`              | Unique course identifier from the university                                |
| `section`    | Always present    | `3`, `1L`, `2`               | Number, sometimes with `L` suffix for lab                                   |
| `room`       | Always present    | `PD 202`, `PB 206`, `PA 403` | Building + room number                                                      |
| `teacher`    | Sometimes `TBA`   | `NNE`, `EAZ`, `TBA`          | Teacher initials or TBA if unassigned                                       |
| `daySuffix`  | Optional          | `(S)`, `(T)`, `(M)`, `(W)`   | Specific day: S=Sunday, T=Tuesday, M=Monday, W=Wednesday. Critical for labs |
| `days`       | From row group    | `["Sunday", "Tuesday"]`      | Derived from which row group the entry is in                                |
| `startTime`  | From column       | `8:00 AM`                    | Derived from which column the entry is in                                   |
| `endTime`    | From column       | `9:20 AM`                    | Derived from which column the entry is in                                   |

---

## 2. Upload & Extraction Pipeline

### Step 1 — Upload Endpoint

Create `POST /api/admin/upload-schedule` that:

- Accepts `.xlsx` file via `multer`
- Only accessible by `admin` role
- Stores the file temporarily for processing

### Step 2 — Parse the Excel File

Use `xlsx` (SheetJS) library to:

- Read the uploaded `.xlsx` file
- Identify the header row (time slot columns)
- Identify row groups (day groups: Sun & Tue, Mon & Wed)
- Iterate through each cell and extract raw text

### Step 3 — Parse Each Cell Entry

Each cell can have **multiple entries** (one per line). For each entry, use regex to extract:

```
Regex pattern (flexible):
/^([A-Z]{2,4}\s?\d{0,4})\s*\/?\s*(\d{4}-\d{3}-\d{4})?[-\s]*(\d+L?)\s*[-–]\s*([A-Z]{2}\s?\d{3})\s*[-–]\s*(.+?)(?:\s*\(([^)]+)\))?\s*$/
```

Parsing logic:

1. Split cell text by newline to get individual entries
2. For each entry, extract: courseCode, unicode, section, room, teacher, daySuffix (S/T/M/W)
3. Map the column index to startTime/endTime
4. If section has `L` suffix (lab): mark as lab, span 2 consecutive time slots, use daySuffix for single-day assignment
5. Map the row group to days array

### Step 4 — Transform to JSON

Output format per parsed entry:

```json
{
  "courseCode": "CSE 2202",
  "unicode": "0613-014-2202",
  "section": "2",
  "room": "PB 206",
  "teacher": "TSZK",
  "teacherTBA": false,
  "isLab": false,
  "daySuffix": "S",
  "days": ["Sunday"],
  "blockedDays": ["Tuesday"],
  "startTime": "09:25",
  "endTime": "10:45"
}
```

### Step 5 — Validate & Store

- Validate all required fields are present
- Flag entries with `TBA` teachers
- Group entries by `unicode + section` (same course may appear in multiple time slots)
- Return the parsed JSON for admin review before saving to DB

---

## 3. Implementation Order

### Phase 1 — File Upload & Raw Parsing

| #   | Task                                                         | File                                                  |
| --- | ------------------------------------------------------------ | ----------------------------------------------------- |
| 1   | Install `xlsx` and `multer` packages                         | `server/package.json`                                 |
| 2   | Add `IScheduleUploadEntry` and `IRawScheduleData` interfaces | `server/src/types/index.ts`                           |
| 3   | Create `parseScheduleXlsx.ts` utility                        | `server/src/utils/parseScheduleXlsx.ts`               |
| 4   | Create upload controller `scheduleUpload.controller.ts`      | `server/src/controllers/scheduleUpload.controller.ts` |
| 5   | Create upload route `scheduleUpload.routes.ts`               | `server/src/routes/scheduleUpload.routes.ts`          |
| 6   | Register route in `server.ts`                                | `server/src/server.ts`                                |

### Phase 2 — Data Mapping & Storage

| #   | Task                                                                            | File                                       |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------ |
| 7   | Create `OfferedCourse.model.ts` (raw imported schedule data)                    | `server/src/models/OfferedCourse.model.ts` |
| 8   | Add controller to save parsed data to DB                                        | `scheduleUpload.controller.ts`             |
| 9   | Add endpoint: `GET /api/admin/offered-courses` to list imported data            | controller + route                         |
| 10  | Add endpoint: `DELETE /api/admin/offered-courses/:semester` to clear a semester | controller + route                         |

### Phase 3 — Connect to Schedule Builder

| #   | Task                                                             | File                                  |
| --- | ---------------------------------------------------------------- | ------------------------------------- |
| 11  | Update `scheduleBuilder.ts` to use `OfferedCourse` data          | `server/src/utils/scheduleBuilder.ts` |
| 12  | Endpoint for student: `GET /api/schedule/offered?semester=X`     | `schedule.controller.ts`              |
| 13  | Student selects courses, algorithm builds conflict-free schedule | existing flow                         |

---

## 4. New Interface Definitions

```ts
// Raw entry parsed from a single cell in the Excel file
export interface IScheduleUploadEntry {
  courseCode: string; // "CSE 2202" or "" if not present
  unicode: string; // "0613-014-2202" (always present)
  section: string; // "2", "1L"
  room: string; // "PB 206"
  teacher: string; // "TSZK" or "TBA"
  teacherTBA: boolean; // true if teacher is TBA
  isLab: boolean; // true if section ends with "L"
  daySuffix: string; // "S", "T", "M", "W", or "" if none
  days: string[]; // actual days the class runs on
  blockedDays: string[]; // days blocked by labs (no class allowed)
  startTime: string; // "09:25"
  endTime: string; // "10:45" (for labs: endTime of 2nd slot)
}

// Teacher directory entry from bottom of Excel
export interface ITeacherDirectoryEntry {
  initials: string; // "AAMM", "KAS"
  fullName: string; // "Azaz Ahmed", "Kamar Ahmad Simon"
}

// Full upload result returned to admin for review
export interface IRawScheduleData {
  semester: string; // "Summer 2025"
  totalEntries: number;
  tbaCount: number; // how many have TBA teacher
  entries: IScheduleUploadEntry[];
  errors: string[]; // any rows that failed to parse
}
```

---

## 5. New Mongoose Model: OfferedCourse

Separate from the existing `Course` model. This stores raw imported schedule data before it gets linked to actual Course/Teacher documents.

```ts
// OfferedCourse — raw schedule data imported from Excel
{
  courseCode: String,       // "CSE 2202"
  unicode: String,          // "0613-014-2202" (indexed)
  section: String,          // "2"
  room: String,             // "PB 206"
  teacherInitials: String,  // "TSZK" or "TBA"
  teacherTBA: Boolean,
  isLab: Boolean,           // true if lab section
  daySuffix: String,        // "S", "T", "M", "W"
  days: [String],           // actual running days
  blockedDays: [String],    // days blocked by this lab
  startTime: String,        // "09:25"
  endTime: String,          // "10:45" (labs: end of 2nd slot)
  semester: String,         // "Summer 2025"
  teacher: ObjectId (ref User, optional) // linked after matching
}

// TeacherDirectory — maps initials to full names (from Excel bottom)
{
  initials: String,         // "AAMM" (unique, indexed)
  fullName: String,         // "Azaz Ahmed"
  semester: String,         // "Summer 2025"
}
```

---

## 6. Parsing Edge Cases to Handle

| Edge Case                                         | Strategy                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| No course code, only department prefix            | Store department prefix in `courseCode`, full ID comes from `unicode`           |
| Multiple entries in one cell                      | Split by newline, parse each independently                                      |
| Inconsistent spacing/dashes                       | Regex with flexible whitespace matching                                         |
| `TBA` as teacher                                  | Set `teacherTBA: true`, store "TBA" as `teacherInitials`                        |
| Section with `L` suffix (lab)                     | Mark `isLab: true`, span 2 consecutive time slots, use daySuffix for single-day |
| Lab blocked day                                   | If lab runs Sunday, Tuesday is blocked for those 2 slots (and vice versa)       |
| Day suffix `(S)`, `(T)`, `(M)`, `(W)`             | Extract and store — S=Sunday, T=Tuesday, M=Monday, W=Wednesday                  |
| Cross-listed courses `(CSE,I)`                    | Strip cross-listing info, but preserve day suffixes                             |
| Teacher directory at bottom                       | Parse `INITIALS - Full Name` rows, store in TeacherDirectory collection         |
| Thursday section                                  | Separate day group with different time slots (2-hour blocks)                    |
| CSE & EEE LAB section                             | Thursday lab entries with their own time structure                              |
| Combined unicode entries `BUS 2201/0488-011-2201` | Split on `/`, first part is courseCode, second is unicode                       |
| Room names with spaces `PD 202` vs `PB205`        | Normalize to consistent format `PB 205`                                         |
| Entries spanning multiple lines in weird ways     | Robust line splitting, skip empty lines                                         |

---

## 7. API Endpoints Summary

| Method   | Endpoint                                | Role    | Description                                             |
| -------- | --------------------------------------- | ------- | ------------------------------------------------------- |
| `POST`   | `/api/admin/upload-schedule`            | admin   | Upload `.xlsx` file, returns parsed JSON for review     |
| `POST`   | `/api/admin/save-schedule`              | admin   | Save reviewed parsed data to `OfferedCourse` collection |
| `GET`    | `/api/admin/offered-courses?semester=X` | admin   | List all imported offered courses for a semester        |
| `DELETE` | `/api/admin/offered-courses/:semester`  | admin   | Clear imported data for a semester                      |
| `GET`    | `/api/schedule/offered?semester=X`      | student | Get available courses for schedule building             |

---

## 8. Dependencies to Install

```bash
cd server
npm install xlsx multer
npm install -D @types/multer
```

`xlsx` (SheetJS) handles Excel parsing. `multer` handles file upload.
