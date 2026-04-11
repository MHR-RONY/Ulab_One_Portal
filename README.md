 <div align="center">

# ULAB One Portal

**A unified academic management platform for the University of Liberal Arts Bangladesh (ULAB)**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?logo=socket.io&logoColor=white)](https://socket.io)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Report Bug](https://github.com/MHR-RONY/Ulab_One_Portal/issues) · [Request Feature](https://github.com/MHR-RONY/Ulab_One_Portal/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Student Portal](#-student-portal)
  - [Teacher Portal](#-teacher-portal)
  - [Admin Panel](#-admin-panel)
- [Tech Stack](#tech-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Infrastructure & Deployment](#infrastructure--deployment)
- [Architecture](#architecture)
  - [System Design](#system-design)
  - [Authentication Flow](#authentication-flow)
  - [Role System](#role-system)
  - [Real-Time Messaging](#real-time-messaging)
  - [Schedule Builder Algorithm](#schedule-builder-algorithm)
  - [Theme System](#theme-system)
  - [Route Guards](#route-guards)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Database Models](#database-models)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Security](#security)
- [Author](#author)
- [License](#license)

---

## Overview

**ULAB One Portal** is a production-grade, full-stack academic management system built for the University of Liberal Arts Bangladesh. It provides three separate role-specific portals — Student, Teacher, and Admin — each with its own layout, navigation, data layer, and feature set.

The platform is deployed on a **self-managed VPS** with a Node.js/Express REST API backend, MongoDB database, and Socket.io real-time engine. The frontend is served via Vite and communicates with the backend through an Axios-based API client with automatic JWT refresh.

### What each role gets

- **Students** register via OTP email verification, build conflict-free semester schedules from admin-uploaded offered courses, track their real attendance per subject, access crowd-sourced course notes, and message teachers and peers via real-time chat.
- **Teachers** manage their assigned courses end-to-end: enrol students, mark daily attendance, declare holidays, upload a profile photo, and monitor per-course statistics. A real-time Socket.io connection powers instant messaging.
- **Admins** control the entire platform: create teacher/admin accounts, seed the schedule catalogue by uploading Excel files, manage the student and teacher directories, monitor upload logs, and configure granular per-admin permissions.

**Created by:** [Mhr Rony](https://mhrrony.com)

---

## Features

### Student Portal

| Feature                | Description                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OTP Registration**   | Students sign up by entering their name, student ID, department, semester, and email. A 6-digit OTP is sent to their email (5-minute expiry) and verified before the account is created                                                                                                                                                                               |
| **Dashboard**          | Personalized welcome screen with a stats grid (GPA, attendance, assignments), today's classes panel, an attendance summary card, recent academic resources, and a quick-task widget                                                                                                                                                                                   |
| **Schedule Builder**   | 5-step wizard: browse offered courses → pick preferred sections/teachers per course (with real-time conflict prevention) → select priority-ordered optimization modes (Preferred Teachers, Minimize Gaps, Fewer Days) → review 3 algorithmically generated schedule variations on a 6-day timetable (SAT–THU) → save with atomic seat reservation and rollback safety |
| **Attendance Tracker** | Subject-wise attendance progress bars, overall stats (classes attended / total, overall %), a month-view calendar with color-coded day cells (present, absent, holiday, no class), and a recent activity log table. Data is live from the backend                                                                                                                     |
| **Notes Library**      | Searchable, department-filtered library of crowd-sourced course notes. Filter by subject department, search by course name or code                                                                                                                                                                                                                                    |
| **Course Notes**       | Per-course note feed with a community upvote/downvote system. Notes re-rank live after each vote. Top 3 notes receive gold/silver/bronze trophy badges                                                                                                                                                                                                                |
| **Real-Time Chat**     | Conversation list + message thread view powered by Socket.io. Direct messages to teachers and peers, course group chats (auto-synced from enrolled courses), block/unblock contacts, online presence indicators                                                                                                                                                       |
| **Profile**            | Student ID, degree program, CGPA, credits completed, enrolled subjects with per-subject attendance bars                                                                                                                                                                                                                                                               |
| **Settings**           | Edit name/email, toggle dark mode, change language (English/Bengali), configure email/push notifications, toggle two-factor authentication, change password                                                                                                                                                                                                           |
| **Mobile Layout**      | Dedicated mobile UI: sticky MobileHeader, BottomNav, slide-out MobileMenuDrawer, MobileSchedule, MobileTasks, MobileAcademicOverview                                                                                                                                                                                                                                  |

---

### Teacher Portal

| Feature                | Description                                                                                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**          | KPI overview (total students, avg attendance, quiz pass rate, engagement score), Recharts attendance area chart (16-week trend), student engagement radar chart, section performance bars, top-performer list, and at-risk student panel |
| **Profile & Avatar**   | Teachers can update their name, email, bio, and upload a profile photo. Photos are stored on the server and served as static files                                                                                                       |
| **My Courses**         | Course card grid: per-course stats (student count, avg grade, attendance %), animated syllabus completion progress bar. Create new courses, link them to a section and time slot                                                         |
| **Student Enrolment**  | Search students by name or student ID and add them to a course. Remove students from courses. View the full enrolled student list per course                                                                                             |
| **Attendance Marking** | Desktop: paginated student table with multi-session history columns, mark-all-present button, save button, color-coded attendance % badges. Mobile: full-screen tap-to-toggle card list with fixed Save Attendance bar                   |
| **Holiday Management** | Mark specific dates as holidays for a course so they are excluded from student attendance calculations                                                                                                                                   |
| **Course Detail**      | Deep-dive per course: animated stats cards, 6-week attendance sparkline, grade distribution bar chart, full student list table with grade badges and attendance %                                                                        |
| **Analytics**          | KPIs + Recharts attendance area chart with a 90% target reference line + animated grade distribution bars + engagement heatmap + at-risk student cards                                                                                   |
| **Real-Time Chat**     | Same Socket.io-backed chat as students — direct messages and course group chats, with teacher-specific layout (TeacherSidebar, TeacherBottomNav)                                                                                         |
| **Settings**           | Profile edit (name, email), dark mode toggle, notification preferences, and security options                                                                                                                                             |
| **Mobile Layout**      | MobileTeacherDashboard provides full feature parity on small screens                                                                                                                                                                     |

---

### Admin Panel

| Feature                   | Description                                                                                                                                                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **First-Time Setup**      | A one-time setup endpoint (`/api/auth/admin/check-setup` + `/api/auth/admin/setup`) creates the initial super-admin account before the portal goes live                                                                                                               |
| **Dashboard**             | Platform KPIs (live student/teacher counts from DB), 7-day platform traffic area chart, enrollment growth card, pending approvals queue, and a color-coded system log feed                                                                                            |
| **Student Directory**     | Full student table with department filter, search, status badges, and pagination. Row actions: View, Edit, Reset Password. Clicking a row opens a detailed student profile                                                                                            |
| **Teacher Directory**     | Teacher table with department filter, status, photo thumbnails, and pagination. Row actions: View, Edit, View Schedule. Clicking a row opens a detailed teacher profile with Overview, Performance, Settings, and Account Management tabs                             |
| **Admin Role Management** | Create new admin accounts (name, email, password), view all admins with status and join date, delete admins, and configure granular per-module permissions (Read / Write / Delete / Full Access) per admin                                                            |
| **Schedule Upload**       | Upload an Excel file containing the offered courses catalogue for a semester. Preview parsed rows before committing. Confirm saves all courses to the database. Manage individual offered courses (edit/delete), clear a full semester, and view detailed upload logs |
| **Schedule Stats**        | Aggregate stats on offered courses — total sections, unique courses, departments, and per-semester breakdowns                                                                                                                                                         |
| **Schedules View**        | Full timetable manager: Grid view (time-slot x day table with color-coded class cards) and List view (data table). Mobile day-selector with per-day card list. Filters: semester, department, campus                                                                  |
| **Analytics**             | 30-day platform traffic area chart, user distribution donut chart, department engagement bar chart, and a timestamped system alerts table with CRITICAL / WARNING / INFO severity levels                                                                              |
| **Department Notes**      | Cross-department notes review and publishing control                                                                                                                                                                                                                  |
| **Resources**             | University resource library with per-department filtering and upload/edit/delete per resource                                                                                                                                                                         |
| **Messenger**             | Admin broadcast messaging to students, teachers, or all users                                                                                                                                                                                                         |
| **Settings**              | 4-tab configuration panel: General, Branding (logo, color picker, fonts), Security (session timeout, 2FA, IP whitelist, force HTTPS), API & Integrations (webhook URL, LMS/SMS/Analytics toggles)                                                                     |
| **Maintenance**           | Server maintenance mode toggle and related controls                                                                                                                                                                                                                   |
| **Infrastructure**        | Server and infrastructure health monitoring                                                                                                                                                                                                                           |

---

## Tech Stack

### Frontend

| Category            | Technology                      | Version    |
| ------------------- | ------------------------------- | ---------- |
| UI Framework        | React                           | 18.3.x     |
| Language            | TypeScript                      | 5.x        |
| Build Tool          | Vite with SWC compiler          | 5.x        |
| Styling             | Tailwind CSS                    | 3.x        |
| Component System    | shadcn/ui (Radix UI primitives) | latest     |
| Routing             | React Router DOM                | 6.30.x     |
| Server State        | TanStack React Query            | 5.83.x     |
| HTTP Client         | Axios (with JWT interceptors)   | 1.13.x     |
| Real-Time           | Socket.io Client                | 4.8.x      |
| Forms               | React Hook Form                 | 7.61.x     |
| Validation          | Zod                             | 3.25.x     |
| Charts              | Recharts                        | 2.15.x     |
| Animations          | Framer Motion                   | 12.35.x    |
| Icons               | Lucide React                    | 0.462.x    |
| Toast Notifications | Sonner                          | 1.7.x      |
| Date Utilities      | date-fns                        | 3.6.x      |
| Carousel            | Embla Carousel React            | 8.6.x      |
| Command Palette     | cmdk                            | 1.1.x      |
| Drawer / Sheets     | Vaul                            | 0.9.x      |
| Testing             | Vitest + Testing Library        | 3.x / 16.x |
| Linting             | ESLint 9 flat config            | 9.x        |

### Backend

| Category           | Technology                                   | Version |
| ------------------ | -------------------------------------------- | ------- |
| Runtime            | Node.js                                      | 20.x    |
| Framework          | Express                                      | 4.18.x  |
| Language           | TypeScript                                   | 5.3.x   |
| Database           | MongoDB (via Mongoose)                       | 8.0.x   |
| Real-Time          | Socket.io                                    | 4.8.x   |
| Authentication     | JWT (access token + httpOnly refresh cookie) | 9.0.x   |
| Password Hashing   | bcryptjs                                     | 2.4.x   |
| Email (OTP)        | Nodemailer / custom SMTP                     | —       |
| File Uploads       | Multer (teacher avatars, Excel schedules)    | 2.1.x   |
| Excel Parsing      | XLSX (SheetJS)                               | 0.18.x  |
| Validation         | express-validator                            | 7.0.x   |
| Rate Limiting      | express-rate-limit                           | 8.3.x   |
| Security Headers   | Helmet                                       | 8.1.x   |
| Cookie Parsing     | cookie-parser                                | 1.4.x   |
| Environment Config | dotenv                                       | 16.3.x  |
| Dev Server         | ts-node-dev                                  | 2.0.x   |

### Infrastructure & Deployment

| Component           | Technology                                   |
| ------------------- | -------------------------------------------- |
| Hosting             | Self-managed VPS (Linux)                     |
| Process Manager     | PM2                                          |
| Reverse Proxy       | Nginx                                        |
| SSL/TLS             | Let's Encrypt (Certbot)                      |
| Database            | MongoDB (self-hosted or MongoDB Atlas)       |
| Static File Serving | Nginx / Express static                       |
| Domain              | Custom domain with DNS managed independently |

> This project is **not** deployed on Vercel, Heroku, Netlify, or any PaaS. All production infrastructure is managed directly on a VPS for full control over performance, security, and costs.

---

## Architecture

### System Design

```
Client (Vite + React)
       │
       │  HTTPS REST  ──────────────────────────────────┐
       │  WebSocket (Socket.io)                         │
       ▼                                                │
Nginx Reverse Proxy (SSL termination)                  │
       │                                                │
       ▼                                                │
Express API Server (Node.js + TypeScript)              │
  ├── /api/auth        → JWT auth, OTP registration    │
  ├── /api/student     → profile, attendance, schedule │
  ├── /api/teacher     → courses, attendance, avatar   │
  ├── /api/admin       → user mgmt, admin creation     │
  ├── /api/schedule    → schedule builder              │
  ├── /api/admin/schedule → Excel upload, offered courses
  ├── /api/chat        → conversations, groups, DMs    │
  └── /uploads         → static teacher photos        │
       │                                                │
       ▼                                                │
MongoDB (Mongoose ODM)                                  │
  ├── Users (discriminator base)                        │
  │   ├── Students                                      │
  │   ├── Teachers                                      │
  │   └── Admins                                        │
  ├── Courses                                           │
  ├── OfferedCourses                                    │
  ├── Schedules                                         │
  ├── AttendanceRecords                                 │
  ├── Holidays                                          │
  ├── ChatGroups                                        │
  ├── Messages                                          │
  ├── TeacherDirectory                                  │
  └── UploadLogs                                        │
       │                                                │
       └────────────────────────────────────────────────┘
              Socket.io namespace on same HTTP server
```

### Authentication Flow

1. **Student registration** — Client → `POST /api/auth/register/student/send-otp` → server generates 6-digit OTP, sends branded HTML email via SMTP, stores hashed OTP in memory with 5-minute TTL → Client submits OTP → `POST /api/auth/register/student/verify-otp` → account created, JWT access token returned + refresh token set in httpOnly cookie.
2. **Login (all roles)** — `POST /api/auth/login/:role` → validate credentials → issue short-lived JWT access token (15 min) + long-lived refresh token in httpOnly cookie.
3. **Token refresh** — Axios interceptor automatically hits `POST /api/auth/refresh-token` on any 401 response, receives a new access token, retries the original request — invisible to the user.
4. **Logout** — `POST /api/auth/logout` → refresh token cleared from DB + cookie deleted.

All tokens carry `{ id, role, email }` in the payload. The `protect` middleware verifies the Bearer token on every protected route. The `authorizeRole(...roles)` middleware enforces role-level access.

### Role System

```ts
type TRole = "student" | "teacher" | "admin";
```

- Roles are stored in the JWT payload and enforced server-side on every route via `authorizeRole`.
- Client-side role state is managed by `RoleContext` and persisted to `localStorage` under `"ulab-role"`.
- The `isStudent`, `isTeacher`, `isAdmin` boolean flags are derived from the stored role.
- Three separate login endpoints keep role determination unambiguous.

### Real-Time Messaging

Socket.io is initialised on the same HTTP server as Express. The flow:

1. Client connects and authenticates via JWT in the handshake `auth` header.
2. Server resolves the user, joins them to rooms for all their direct-message threads and course group channels.
3. `send_message` event → server persists the `Message` document → emits `new_message` to the target room.
4. `join_room` / `leave_room` events manage dynamic room membership.
5. Online presence is tracked with a `Map<userId, Set<socketId>>` — multiple tabs for the same user are handled correctly.
6. `typing_start` / `typing_stop` events are relayed to room members for typing indicators.

### Schedule Builder Algorithm

The schedule generator (`scheduleGenerator.ts`) uses a **backtracking search with multi-mode priority-weighted scoring** to produce the top 3 optimized schedule variations. Full documentation: [`docs/schedule-builder-algorithm.md`](docs/schedule-builder-algorithm.md).

#### Student-Facing Wizard (5 Steps)

| Step                                | What Happens                                                                                                                                                                                                                                                                                                                                    | Where              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **1. Course Selection**             | Student browses all offered courses for the semester (fetched from `GET /schedule/offered-courses`), grouped by `unicode`. Searches, filters by department, and selects up to **15 credits**. State is persisted to `localStorage` so students can resume later.                                                                                | Frontend           |
| **2. Section & Teacher Preference** | For each selected course, the student sees every available section with teacher name, schedule, room, and remaining seats. Picking a section stores it as a preferred teacher hint. **Real-time conflict prevention**: if a section overlaps with an already-selected section from another course, the selection is blocked with a toast error. | Frontend           |
| **3. Optimization Priorities**      | Student selects 1–3 optimization modes: **Preferred Teachers**, **Minimize Gaps**, **Fewer Days**. Selection order matters — the first-selected mode gets the highest weight. The UI shows numbered priority badges (1, 2, 3) and a summary bar.                                                                                                | Frontend           |
| **4. Generated Schedules**          | Backend returns 3 diverse schedule variations. Desktop shows a 6-day timetable (SAT–THU) with sidebar details; mobile shows full variation cards. Student can switch between variations, view conflicts, and compare scores.                                                                                                                    | Backend + Frontend |
| **5. Save & Confirm**               | Student reviews and saves. Backend atomically decrements seats, rolls back on failure, and prevents double saves.                                                                                                                                                                                                                               | Backend + Frontend |

#### Algorithm Internals (7 Phases)

1. **Group sections** — All `OfferedCourse` documents for the semester are grouped by `unicode` into a `Map<unicode, SectionMeta[]>`. Times are pre-parsed to minutes-since-midnight for O(1) comparison.

2. **Derive preferred teachers** — The student's Step 2 section picks are resolved to teacher names, building a `Map<unicode, teacherName>`. "TBA" teachers are excluded from scoring since the actual instructor is unknown.

3. **Backtracking search (conflict-free)** — A recursive function explores all one-section-per-course combinations. For each candidate section, it checks for time conflicts against every already-picked section using open-interval overlap logic (`a.start < b.end AND b.start < a.end`). Conflicting branches are pruned immediately, never explored further. Safety caps prevent runaway execution:
   - `MAX_VALID = 500` — stop collecting after 500 valid combos
   - `MAX_NODES = 200,000` — stop after 200K recursive calls

4. **Fallback with pruning** — Only triggers if Phase 3 found zero conflict-free combos. This pass allows conflicts but uses **branch-and-bound pruning**: it tracks the best (lowest) conflict count found so far and skips any branch that already exceeds it. Conflicts are counted incrementally as each section is added, not recalculated at leaf nodes. Top 50 lowest-conflict combos proceed to scoring.

5. **Priority-weighted scoring** — Each combo is scored on a 0–1 scale using three normalized metrics:

   | Metric              | Formula                                 | Meaning                                                      |
   | ------------------- | --------------------------------------- | ------------------------------------------------------------ |
   | **Teacher Match**   | `matchedCourses / totalCourses`         | Fraction of courses that got the student's preferred teacher |
   | **Gap Efficiency**  | `1 - (thisGap / maxGapAcrossAllCombos)` | Lower gap = higher score. Zero gap = 1.0                     |
   | **Day Compactness** | `1 - (daysUsed - 1) / 5`                | Fewer days = higher score. 1 day = 1.0, 6 days = 0.0         |

   The final score is a **weighted sum**. Weights are assigned by a triangular descending formula based on selection order — the first-selected mode gets the largest share:

   ```
   weight(position i) = (N - i) / (N*(N+1)/2)
   ```

   | Selection order    | Weight distribution       |
   | ------------------ | ------------------------- |
   | 1 mode             | 100%                      |
   | 2 modes: [A, B]    | A = 67%, B = 33%          |
   | 3 modes: [A, B, C] | A = 50%, B = 33%, C = 17% |

   **Example**: A student selects `["days", "teacher", "gap"]` — Fewer Days gets 50% influence, Preferred Teachers gets 33%, Minimize Gaps gets 17%.

6. **Pick top 3 diverse** — All combos are sorted by (1) fewest conflicts, then (2) highest score. The top 3 are picked, but a **diversity check** skips any combo that uses the exact same set of section IDs as one already picked — guaranteeing the student sees meaningfully different options.

7. **Build response** — Each variation is packaged with: score (0–100), days used, average gap minutes, teacher match count, full conflict list (if any), and complete section details (course code, teacher, time, room, lab flag, whether the teacher was preferred).

#### Save Endpoint Safety

The `POST /schedule/save-sections` endpoint has four layers of protection:

| Protection                   | Implementation                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Seats can't go negative**  | Atomic MongoDB filter: `{ _id: id, seats: { $gt: 0 } }` — check and decrement in one operation        |
| **No double-save**           | `ScheduleModel.findOne({ student, semester })` rejects with 409 if a record already exists            |
| **Partial failure rollback** | If any section is full, all previously decremented seats are restored via `$inc: { seats: 1 }`        |
| **Student record**           | On success, a `Schedule` document is created linking the student to their saved sections and semester |

#### Performance

| Factor            | Bound                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| Max valid combos  | 500                                                                     |
| Max tree nodes    | 200,000                                                                 |
| Time complexity   | O(S^C) worst case (S = sections/course, C = courses)                    |
| Typical response  | < 100ms for 5–6 courses with ~10 sections each                          |
| Fallback pruning  | Branch-and-bound skips subtrees exceeding best conflict count           |
| Sort optimization | Conflict counts pre-computed once, not inside the O(n log n) comparator |

### Theme System

`ThemeContext` manages light/dark mode by toggling the `"dark"` CSS class on `document.documentElement` — the standard Tailwind `darkMode: "class"` strategy. The active theme is persisted to `localStorage` under `"theme"` and defaults to `"light"`. The `useTheme()` hook exposes `theme` and `toggleTheme()`.

### Route Guards

Guard components (`StudentRoute`, `TeacherRoute`, `AdminRoute`) in `src/components/auth/RouteGuards.tsx` wrap each role's route group. On any 401 from the API, the Axios interceptor redirects to the correct login page (`/login`, `/teacher/login`, `/admin/login`) based on `window.location.pathname`.

---

## Project Structure

```
Ulab_One_Portal/
├── public/
├── src/                              # Frontend (React + TypeScript)
│   ├── assets/
│   ├── components/
│   │   ├── NavLink.tsx
│   │   ├── admin/                    # Admin layout + tab components
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AcademicProgressTab.tsx
│   │   │   ├── AccountSettingsTab.tsx
│   │   │   ├── TeacherAccountTab.tsx
│   │   │   ├── TeacherOverviewTab.tsx
│   │   │   ├── TeacherPerformanceTab.tsx
│   │   │   └── TeacherSettingsTab.tsx
│   │   ├── auth/
│   │   │   └── RouteGuards.tsx
│   │   ├── chat/
│   │   │   ├── ChatThread.tsx
│   │   │   └── ConversationList.tsx
│   │   ├── notes/
│   │   │   └── MobileNotesLibrary.tsx
│   │   ├── student/                  # Student layout + dashboard widgets
│   │   └── teacher/                  # Teacher layout components
│   │   └── ui/                       # shadcn/ui components (50+ primitives)
│   ├── contexts/
│   │   ├── RoleContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── useStudentAttendance.ts
│   │   ├── useStudentChat.ts
│   │   ├── useStudentDashboard.ts
│   │   ├── useStudentProfile.ts
│   │   ├── useStudentSettings.ts
│   │   ├── useTeacherChat.ts
│   │   ├── useTeacherCourses.ts
│   │   └── useTeacherProfile.ts
│   ├── lib/
│   │   ├── api.ts                    # Axios instance + JWT interceptors
│   │   └── socket.ts                 # Socket.io client singleton
│   └── pages/
│       ├── auth/                     # Login + signup pages
│       ├── student/                  # Student portal pages
│       ├── teacher/                  # Teacher portal pages
│       └── admin/                    # Admin panel pages
│
└── server/                           # Backend (Node.js + Express + TypeScript)
    ├── package.json
    ├── tsconfig.json
    ├── .env                          # Never committed
    ├── .env.example
    └── src/
        ├── server.ts                 # Express app + Socket.io init + route registration
        ├── config/
        │   └── db.ts                 # Mongoose connection
        ├── types/
        │   └── index.ts              # All shared interfaces and types
        ├── models/
        │   ├── User.model.ts         # Base discriminator model
        │   ├── Student.model.ts
        │   ├── Teacher.model.ts
        │   ├── Admin.model.ts
        │   ├── Course.model.ts
        │   ├── OfferedCourse.model.ts
        │   ├── Schedule.model.ts
        │   ├── Attendance.model.ts
        │   ├── Holiday.model.ts
        │   ├── ChatGroup.model.ts
        │   ├── Message.model.ts
        │   ├── TeacherDirectory.model.ts
        │   └── UploadLog.model.ts
        ├── controllers/
        │   ├── auth.controller.ts
        │   ├── student.controller.ts
        │   ├── teacher.controller.ts
        │   ├── admin.controller.ts
        │   ├── schedule.controller.ts
        │   ├── scheduleUpload.controller.ts
        │   └── chat.controller.ts
        ├── routes/
        │   ├── auth.routes.ts
        │   ├── student.routes.ts
        │   ├── teacher.routes.ts
        │   ├── admin.routes.ts
        │   ├── schedule.routes.ts
        │   ├── scheduleUpload.routes.ts
        │   └── chat.routes.ts
        ├── middleware/
        │   ├── auth.middleware.ts     # protect + authorizeRole
        │   ├── error.middleware.ts    # Global error handler
        │   ├── upload.middleware.ts   # Multer config
        │   └── validate.middleware.ts
        ├── socket/
        │   └── chat.socket.ts        # Socket.io server with auth + online presence
        ├── utils/
        │   ├── apiResponse.ts        # sendResponse utility
        │   ├── generateToken.ts      # JWT access + refresh token generation
        │   ├── emailService.ts       # OTP email (branded HTML template)
        │   ├── scheduleBuilder.ts    # Legacy schedule builder
        │   └── scheduleGenerator.ts  # Backtracking + priority-weighted scoring algorithm
        └── uploads/
            └── teacher-photos/       # Served as static files via /uploads
```

---

## API Reference

All endpoints return the standard response envelope:

```json
{ "success": true, "message": "...", "data": {} }
```

### Auth (`/api/auth`)

| Method | Endpoint                       | Auth   | Description                                   |
| ------ | ------------------------------ | ------ | --------------------------------------------- |
| GET    | `/admin/check-setup`           | Public | Check if initial admin account exists         |
| POST   | `/admin/setup`                 | Public | Create the first super-admin (one-time)       |
| POST   | `/register/student/send-otp`   | Public | Send OTP email for student registration       |
| POST   | `/register/student/verify-otp` | Public | Verify OTP and create student account         |
| POST   | `/login/student`               | Public | Student login → access token + refresh cookie |
| POST   | `/login/teacher`               | Public | Teacher login → access token + refresh cookie |
| POST   | `/login/admin`                 | Public | Admin login → access token + refresh cookie   |
| POST   | `/refresh-token`               | Cookie | Exchange refresh cookie for new access token  |
| POST   | `/logout`                      | JWT    | Clear refresh token                           |

### Student (`/api/student`) — requires `student` role

| Method | Endpoint                          | Description                                       |
| ------ | --------------------------------- | ------------------------------------------------- |
| GET    | `/dashboard`                      | Dashboard stats, today's classes, recent activity |
| GET    | `/profile`                        | Full student profile with enrolled courses        |
| PUT    | `/profile`                        | Update student profile fields                     |
| GET    | `/attendance`                     | Per-course attendance summary                     |
| GET    | `/attendance/day?date=YYYY-MM-DD` | Attendance status for a specific day              |
| GET    | `/settings`                       | Student settings/preferences                      |
| PUT    | `/settings`                       | Update settings                                   |
| POST   | `/change-password`                | Change password                                   |

### Teacher (`/api/teacher`) — requires `teacher` role

| Method | Endpoint                           | Description                      |
| ------ | ---------------------------------- | -------------------------------- |
| GET    | `/profile`                         | Teacher profile                  |
| PUT    | `/profile`                         | Update profile                   |
| POST   | `/profile/avatar`                  | Upload profile photo (multipart) |
| PATCH  | `/settings`                        | Update settings                  |
| GET    | `/courses`                         | All assigned courses             |
| POST   | `/courses`                         | Create a new course              |
| GET    | `/courses/:id/students`            | All students in a course         |
| POST   | `/courses/:id/students`            | Enrol a student                  |
| DELETE | `/courses/:id/students/:studentId` | Remove a student                 |
| GET    | `/students/search?q=`              | Search students by name or ID    |
| GET    | `/courses/:id/attendance?date=`    | Get attendance for a date        |
| POST   | `/courses/:id/attendance`          | Save attendance for a date       |
| POST   | `/courses/:id/holiday`             | Mark a date as holiday           |
| DELETE | `/courses/:id/holiday/:date`       | Unmark a holiday                 |

### Admin (`/api/admin`) — requires `admin` role

| Method | Endpoint       | Description                |
| ------ | -------------- | -------------------------- |
| GET    | `/me`          | Admin profile              |
| GET    | `/admins`      | All admin accounts         |
| POST   | `/admin`       | Create a new admin account |
| DELETE | `/admin/:id`   | Delete an admin account    |
| POST   | `/teacher`     | Create a teacher account   |
| GET    | `/teachers`    | All teachers               |
| GET    | `/teacher/:id` | Single teacher             |
| PUT    | `/teacher/:id` | Update teacher             |
| DELETE | `/teacher/:id` | Delete teacher             |
| GET    | `/students`    | All students (paginated)   |
| DELETE | `/student/:id` | Delete student             |

### Schedule Upload (`/api/admin/schedule`) — requires `admin` role

| Method | Endpoint                      | Description                           |
| ------ | ----------------------------- | ------------------------------------- |
| POST   | `/upload-schedule`            | Upload Excel file (dry run + persist) |
| POST   | `/parse-preview`              | Parse Excel and return preview rows   |
| POST   | `/confirm-save`               | Commit previewed rows to DB           |
| GET    | `/offered-courses`            | All offered courses (filterable)      |
| PATCH  | `/offered-courses/:id`        | Edit an offered course                |
| DELETE | `/offered-courses/single/:id` | Delete one offered course             |
| DELETE | `/offered-courses/:semester`  | Delete all courses for a semester     |
| GET    | `/upload-logs`                | Upload history                        |
| DELETE | `/upload-logs`                | Clear upload logs                     |
| GET    | `/schedule-stats`             | Aggregate stats                       |

### Schedule Builder (`/api/schedule`) — requires `student` role

| Method | Endpoint           | Description                                                      |
| ------ | ------------------ | ---------------------------------------------------------------- |
| POST   | `/build`           | Generate conflict-free timetable options (legacy)                |
| POST   | `/generate`        | Generate 3 optimised schedule variations via backtracking engine |
| POST   | `/save-sections`   | Save chosen variation with atomic seat reservation & rollback    |
| GET    | `/my-schedule`     | Retrieve the student's saved schedule                            |
| GET    | `/offered-courses` | Fetch all offered sections for the student's current semester    |

### Chat (`/api/chat`) — requires JWT

| Method | Endpoint                             | Description                                       |
| ------ | ------------------------------------ | ------------------------------------------------- |
| GET    | `/conversations`                     | All direct message conversations                  |
| GET    | `/conversations/:contactId/messages` | DM message history                                |
| GET    | `/contacts/search?q=`                | Search users to start a DM                        |
| GET    | `/contacts/:targetId/block`          | Get block status                                  |
| POST   | `/contacts/:targetId/block`          | Block a user                                      |
| DELETE | `/contacts/:targetId/block`          | Unblock a user                                    |
| GET    | `/groups`                            | All course group chats                            |
| GET    | `/groups/:groupId`                   | Group details                                     |
| GET    | `/groups/:groupId/members`           | Group member list                                 |
| POST   | `/groups/:groupId/members`           | Add member to group                               |
| DELETE | `/groups/:groupId/members/:memberId` | Remove member                                     |
| GET    | `/groups/:groupId/messages`          | Group message history                             |
| POST   | `/sync-course-groups`                | Sync groups from enrolled courses (admin/teacher) |

---

## Database Models

| Model              | Key Fields                                                                                                                                                | Notes                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `User`             | `name, email, password, role, refreshToken, blockedUsers`                                                                                                 | Base discriminator — never instantiated directly        |
| `Student`          | extends User + `studentId, department, semester, phone, emailAlerts, pushNotifications, language, twoFactorEnabled, enrolledCourses`                      |                                                         |
| `Teacher`          | extends User + `teacherId, department, assignedCourses, accentColorIndex, avatar, bio`                                                                    |                                                         |
| `Admin`            | extends User + `permissions[]`                                                                                                                            |                                                         |
| `Course`           | `courseCode, courseName, section, teacher, students[], slots[], semester, credits`                                                                        |                                                         |
| `OfferedCourse`    | `courseCode, unicode, title, section, room, teacherInitials, teacherFullName, teacherTBA, isLab, days[], startTime, endTime, semester, seats, totalSeats` | Uploaded by admin from Excel; seats decremented on save |
| `Schedule`         | `student, courses[] (OfferedCourse refs), semester, isConflictFree`                                                                                       | Created by `/save-sections`; refs are section IDs       |
| `Attendance`       | `student, course, date, status, time`                                                                                                                     | Unique index on `(student, course, date)`               |
| `Holiday`          | `course, date, addedBy`                                                                                                                                   | Excludes date from attendance calculations              |
| `ChatGroup`        | `name, type, course, members[], createdBy`                                                                                                                | `type: "direct" \| "group"`                             |
| `Message`          | `sender, group, content, readBy[]`                                                                                                                        |                                                         |
| `TeacherDirectory` | `name, email, teacherId, department, photoUrl`                                                                                                            | Seeded from external source                             |
| `UploadLog`        | `filename, semester, totalRows, insertedCount, skippedCount, uploadedBy`                                                                                  |                                                         |

---

## Environment Variables

Create `server/.env` from `server/.env.example`:

```env
# Server
PORT=5003
NODE_ENV=production

# MongoDB
MONGO_URI=mongodb://localhost:27017/ulab_one_portal

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Client (comma-separated for multiple origins)
CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com

# Email (SMTP for OTP)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@yourdomain.com
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- MongoDB instance (local or Atlas)
- SMTP credentials for OTP emails

### Installation

```bash
# Clone the repository
git clone https://github.com/MHR-RONY/Ulab_One_Portal.git
cd Ulab_One_Portal

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values
```

### Running in Development

```bash
# Terminal 1 — Start backend (from project root)
cd server && npm run dev

# Terminal 2 — Start frontend (from project root)
npm run dev
```

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5003`

### First-Time Admin Setup

Before the admin portal is usable, create the initial super-admin account:

```bash
# Check if admin already exists
GET http://localhost:5003/api/auth/admin/check-setup

# If not, create the first admin
POST http://localhost:5003/api/auth/admin/setup
Content-Type: application/json

{ "name": "Admin Name", "email": "admin@ulab.edu.bd", "password": "strongpassword" }
```

---

## Available Scripts

### Frontend (project root)

| Script               | Description                                      |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Start Vite dev server with HMR at localhost:8080 |
| `npm run build`      | Production build with full TypeScript check      |
| `npm run build:dev`  | Development build (source maps, no minification) |
| `npm run preview`    | Serve the production build locally               |
| `npm run lint`       | Run ESLint across all source files               |
| `npm run test`       | Run all unit tests once and exit                 |
| `npm run test:watch` | Run tests in interactive watch mode              |

### Backend (`server/`)

| Script          | Description                                   |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Start with ts-node-dev (watch + auto-restart) |
| `npm run build` | Compile TypeScript to `dist/`                 |
| `npm start`     | Run compiled `dist/server.js` (production)    |

---

## Deployment

This project runs on a **self-managed Linux VPS** — no PaaS required.

### Backend

```bash
# Build TypeScript
cd server && npm run build

# Start with PM2 (process manager)
pm2 start dist/server.js --name ulab-backend

# Save PM2 config to survive reboots
pm2 save
pm2 startup
```

### Frontend

```bash
# Build the frontend
npm run build

# Serve the dist/ folder via Nginx
```

### Nginx Configuration (example)

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    # Frontend (static)
    location / {
        root /var/www/ulab-portal/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API + WebSocket
    location /api {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
}
```

### SSL — Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Security

| Measure             | Implementation                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Password hashing    | bcryptjs with salt rounds (auto-applied via Mongoose `pre("save")` hook)                       |
| JWT storage         | Access token in-memory only (never localStorage); refresh token in httpOnly cookie             |
| Rate limiting       | `express-rate-limit` on all auth endpoints (10 req / 15 min for login, 5 req / 15 min for OTP) |
| Security headers    | `helmet` middleware applied globally                                                           |
| CORS                | Strict origin whitelist via `CLIENT_URL` env var; supports multiple comma-separated origins    |
| Input validation    | `express-validator` on all mutation endpoints                                                  |
| Password not leaked | Mongoose schema hides `password` field via `select: false` and `toJSON` transform              |
| Env secrets         | All secrets in `.env`; `.env` is gitignored                                                    |
| Role enforcement    | `protect` + `authorizeRole` middleware on every protected route                                |
| OTP expiry          | 5-minute TTL on registration OTPs                                                              |

---

## Author

**Mhr Rony**

- Website: [mhrrony.com](https://mhrrony.com)
- GitHub: [@MHR-RONY](https://github.com/MHR-RONY)

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Designed & Developed for ULAB by [Mhr Rony](https://mhrrony.com)

</div>
