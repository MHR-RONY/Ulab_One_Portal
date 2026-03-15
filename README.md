<div align="center">

# ULAB One Portal

**A unified academic management platform for the University of Liberal Arts Bangladesh (ULAB)**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
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
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Architecture](#architecture)
  - [Role System](#role-system)
  - [Theme System](#theme-system)
  - [Route Guards](#route-guards)
  - [Component Design](#component-design)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Key Dependencies](#key-dependencies)
- [Author](#author)
- [License](#license)

---

## Overview

**ULAB One Portal** is a full-featured academic management system designed for the University of Liberal Arts Bangladesh. It provides three distinct, role-specific portals — Student, Teacher, and Admin — each with its own layout, navigation, and feature set.

The platform consolidates everything a university needs into a single application:

- **Students** can build semester schedules, access crowd-sourced course notes, track their own attendance, and message teachers and peers.
- **Teachers** get an analytics-driven view of their sections — attendance trends, grade distributions, student risk flags, and per-student performance breakdowns.
- **Admins** manage the full ecosystem: student/teacher directories, timetable scheduling, departmental resources, platform analytics, system settings, and infrastructure.

The application delivers a fully responsive experience — a rich desktop layout with sidebars and data tables, and a purpose-built mobile layout with bottom navigation, drawer menus, and touch-optimized card interactions.

**Created by:** [Mhr Rony](https://mhrrony.com)

---

## Features

### 🎓 Student Portal

| Feature | Description |
|---|---|
| **Dashboard** | Personalized welcome screen with a stats grid (GPA, attendance, assignments), today's classes panel, an attendance summary card, recent academic resources, and a quick-task widget |
| **Schedule Builder** | 4-step wizard: browse available courses → pick sections per course → set shift/break/back-to-back preferences → review AI-generated timetables with conflict checking and save |
| **Attendance Tracker** | Subject-wise attendance progress bars, overall stats (classes attended / total, overall %), a month-view calendar with color-coded day cells (present, absent, no class), and a recent activity log table |
| **Notes Library** | Searchable, department-filtered library of crowd-sourced course notes. Filter by subject department, search by course name or code, and see note count and last-updated times per course |
| **Course Notes** | Per-course note feed with a community upvote/downvote system. Notes re-rank live after each vote. Top 3 notes receive gold/silver/bronze trophy badges. Each note shows author, file type, file size, and download/preview actions |
| **Chat** | Conversation list + message thread view. Desktop shows both panels side by side; mobile toggles between them using shared ChatThread and ConversationList components |
| **Profile** | Student ID, degree program, CGPA, credits completed, enrolled subjects with per-subject attendance bars and midterm grade labels |
| **Settings** | Edit name/email, toggle dark mode (connected to ThemeContext), change language (English/Bengali), configure email/push notifications, toggle two-factor authentication |
| **Mobile Layout** | Dedicated mobile UI: sticky MobileHeader, BottomNav, slide-out MobileMenuDrawer, MobileSchedule, MobileTasks, MobileAcademicOverview |

---

### 👨‍🏫 Teacher Portal

| Feature | Description |
|---|---|
| **Dashboard** | KPI overview (total students, avg attendance, quiz pass rate, engagement score), Recharts attendance area chart (16-week trend), student engagement radar chart, section performance bars, top-performer list, and at-risk student panel with colored risk tags |
| **My Classes** | Course card grid (3 columns): per-course stats (student count, avg grade, attendance %), animated syllabus completion progress bar. Per-card actions: Grade / Attendance / Message. Cards link to individual course detail pages |
| **Course Detail** | Deep-dive per course (/teacher/classes/:courseCode): animated stats cards, 6-week attendance sparkline (custom SVG path), grade distribution bar chart, full student list table with grade badges and attendance %, linked course resources (PDF/video/code files), and an upcoming task checklist with optional grading progress |
| **Attendance Marking** | Desktop: paginated student table with multi-session history columns (present/absent circles), mark-all-present button, save button, color-coded attendance % badges. Mobile: full-screen tap-to-toggle card list with fixed Save Attendance bar at the bottom |
| **Analytics** | KPIs + Recharts attendance area chart with a 90% target reference line + animated grade distribution bars + engagement heatmap (time-of-day x day-of-week grid) + section attendance breakdown + at-risk student cards with Send Alert and View Profile actions |
| **Chat** | Same conversation/thread architecture as the student chat, using teacher-specific layout components (TeacherSidebar, TeacherBottomNav) |
| **Settings** | Profile edit (name, email), dark mode toggle, notification preferences, and security options |
| **Mobile Layout** | MobileTeacherDashboard provides full feature parity on small screens; TeacherBottomNav provides bottom navigation |

---

### 🛡️ Admin Panel

| Feature | Description |
|---|---|
| **Dashboard** | Platform KPIs (12,842 students, 846 teachers, live sessions, system health %), 7-day platform traffic area chart, enrollment growth card with faculty-level progress bars, pending approvals queue (Approve/Reject), and a color-coded system log feed |
| **Student Directory** | Full student table with department filter pills, search, status badges (Active / Suspended), and paginated navigation. Row actions: View, Edit, Reset Password. Clicking a row opens a detailed student profile |
| **Teacher Directory** | Teacher table with department filter, Active/On Leave status, and paginated navigation. Row actions: View, Edit, View Schedule. Clicking a row opens a detailed teacher profile |
| **Student Detail** | Individual student view with an Academic Progress tab (GPA, attendance charts) and an Account Settings tab |
| **Teacher Detail** | Individual teacher view with Overview, Performance Metrics, Settings, and Account Management tabs |
| **Schedules** | Full timetable manager: Grid view (time-slot x day table with color-coded class cards) and List view (data table with course/teacher/room/time columns). Mobile day-selector with per-day card list. Filters: semester, department, campus |
| **Analytics** | 30-day platform traffic area chart, user distribution donut chart (Students 72% / Teachers 18% / Admin 10%), department engagement bar chart, and a timestamped system alerts table with CRITICAL / WARNING / INFO severity levels |
| **Management** | Batch user management and administrative bulk operations |
| **Department Notes** | Cross-department notes review and publishing control |
| **Resources** | University resource library with per-department filtering and upload/edit/delete per resource |
| **Messenger** | Admin broadcast messaging to students, teachers, or all users |
| **Settings** | 4-tab configuration panel: General (site name, timezone, email, language, system behavior toggles, SMTP config), Branding (logo upload, color picker, fonts, favicon), Security (session timeout, max login attempts, password policy, 2FA toggle, IP whitelist, force HTTPS), API & Integrations (API key management, webhook URL, LMS/SMS/Analytics integration toggles) |
| **Maintenance** | Server maintenance mode toggle and related controls |
| **Infrastructure** | Server and infrastructure health monitoring |

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| UI Framework | React | 18.3.x |
| Language | TypeScript | 5.x |
| Build Tool | Vite with SWC compiler | 5.x |
| Styling | Tailwind CSS | 3.x |
| Component System | shadcn/ui built on Radix UI | latest |
| Routing | React Router DOM | 6.30.x |
| Server State | TanStack React Query | 5.83.x |
| Forms | React Hook Form | 7.61.x |
| Validation | Zod | 3.25.x |
| Charts | Recharts | 2.15.x |
| Animations | Framer Motion | 12.35.x |
| Icons | Lucide React | 0.462.x |
| Toast Notifications | Sonner | 1.7.x |
| Date Utilities | date-fns | 3.6.x |
| Carousel | Embla Carousel React | 8.6.x |
| Command Palette | cmdk | 1.1.x |
| Drawer / Sheets | Vaul | 0.9.x |
| Testing | Vitest + Testing Library | 6.x |
| Linting | ESLint 9 flat config | 9.x |

---

## Project Structure

```
Ulab_One_Portal/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/                      # Static images (course thumbnails, backgrounds)
│   ├── components/
│   │   ├── NavLink.tsx              # Shared portal navigation link
│   │   ├── admin/                   # Admin-specific layout and tab components
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AcademicProgressTab.tsx
│   │   │   ├── AccountSettingsTab.tsx
│   │   │   ├── TeacherAccountTab.tsx
│   │   │   ├── TeacherOverviewTab.tsx
│   │   │   ├── TeacherPerformanceTab.tsx
│   │   │   └── TeacherSettingsTab.tsx
│   │   ├── auth/
│   │   │   └── RouteGuards.tsx      # StudentRoute, TeacherRoute, AdminRoute
│   │   ├── chat/
│   │   │   ├── ChatThread.tsx       # Message thread view
│   │   │   └── ConversationList.tsx # Sidebar conversation list
│   │   ├── notes/
│   │   │   └── MobileNotesLibrary.tsx
│   │   ├── student/                 # Student layout + dashboard widgets
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── MobileHeader.tsx
│   │   │   ├── MobileMenuDrawer.tsx
│   │   │   ├── StatsGrid.tsx
│   │   │   ├── ClassesToday.tsx
│   │   │   ├── AttendanceSummary.tsx
│   │   │   ├── QuickTasks.tsx
│   │   │   ├── RecentResources.tsx
│   │   │   ├── MobileSchedule.tsx
│   │   │   ├── MobileTasks.tsx
│   │   │   └── MobileAcademicOverview.tsx
│   │   ├── teacher/                 # Teacher layout components
│   │   │   ├── TeacherSidebar.tsx
│   │   │   ├── TeacherHeader.tsx
│   │   │   ├── TeacherBottomNav.tsx
│   │   │   └── MobileTeacherDashboard.tsx
│   │   └── ui/                      # shadcn/ui base components (50+ primitives)
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── chart.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── progress.tsx
│   │       ├── select.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── toast.tsx
│   │       ├── tooltip.tsx
│   │       └── ... (30+ more components)
│   ├── contexts/
│   │   ├── RoleContext.tsx          # Global role state: student | teacher | admin
│   │   └── ThemeContext.tsx         # Light/dark theme with localStorage persistence
│   ├── data/
│   │   └── coursesData.ts           # Course notes dataset (8 courses, typed NoteItem / CourseNotes)
│   ├── hooks/
│   │   ├── use-mobile.tsx           # isMobile breakpoint hook (< 768px)
│   │   └── use-toast.ts             # Toast notification hook
│   ├── lib/
│   │   └── utils.ts                 # cn() — clsx + tailwind-merge class utility
│   ├── pages/
│   │   ├── NotFound.tsx
│   │   ├── auth/
│   │   │   ├── StudentLogin.tsx
│   │   │   ├── StudentSignup.tsx
│   │   │   ├── TeacherLogin.tsx
│   │   │   └── AdminLogin.tsx
│   │   ├── student/
│   │   │   ├── Index.tsx            # Student dashboard home
│   │   │   ├── Attendance.tsx       # Attendance tracker
│   │   │   ├── Chat.tsx             # Student messaging
│   │   │   ├── CourseNotes.tsx      # Per-course notes with voting
│   │   │   ├── NotesLibrary.tsx     # Browse all course notes
│   │   │   ├── Profile.tsx          # Student profile
│   │   │   ├── ScheduleBuilder.tsx  # 4-step schedule wizard
│   │   │   └── Settings.tsx         # Account settings
│   │   ├── teacher/
│   │   │   ├── TeacherDashboard.tsx # Academic overview and KPIs
│   │   │   ├── TeacherClasses.tsx   # Course management
│   │   │   ├── TeacherCourseDetail.tsx
│   │   │   ├── TeacherAttendance.tsx
│   │   │   ├── TeacherAnalytics.tsx
│   │   │   ├── TeacherChat.tsx
│   │   │   └── TeacherSettings.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminStudents.tsx
│   │       ├── AdminStudentDetail.tsx
│   │       ├── AdminTeachers.tsx
│   │       ├── AdminTeacherDetail.tsx
│   │       ├── AdminSchedules.tsx
│   │       ├── AdminAnalytics.tsx
│   │       ├── AdminManagement.tsx
│   │       ├── AdminDepartmentNotes.tsx
│   │       ├── AdminResources.tsx
│   │       ├── AdminMessenger.tsx
│   │       ├── AdminSettings.tsx
│   │       ├── AdminMaintenance.tsx
│   │       └── AdminInfrastructure.tsx
│   ├── test/
│   │   ├── setup.ts                 # Vitest + jsdom + Testing Library setup
│   │   └── example.test.ts
│   ├── App.tsx                      # Root component — providers + BrowserRouter + all routes
│   ├── main.tsx                     # React DOM entry point
│   └── index.css                    # Global styles and Tailwind directives
├── index.html                       # Vite HTML entry with meta and OpenGraph tags
├── tailwind.config.ts               # Tailwind theme (CSS variables, dark: class strategy)
├── tsconfig.json                    # TypeScript project references
├── tsconfig.app.json                # App source TS config with path aliases
├── vite.config.ts                   # Vite config with React SWC and @ path alias
├── vitest.config.ts                 # Vitest (jsdom environment)
├── eslint.config.js                 # ESLint 9 flat config
└── package.json
```

---

## Pages & Routes

### Public Routes

| Route | Page | Description |
|---|---|---|
| `/login` | StudentLogin | Student email/password login form |
| `/signup` | StudentSignup | Student registration form |
| `/teacher/login` | TeacherLogin | Teacher portal login |
| `/admin/login` | AdminLogin | Admin panel login |
| `*` | NotFound | 404 fallback page with navigation links |

### Student Routes (wrapped in StudentRoute)

| Route | Page | Description |
|---|---|---|
| `/` | Index | Student dashboard home |
| `/attendance` | Attendance | Subject-wise attendance tracker with calendar |
| `/schedule` | ScheduleBuilder | Multi-step semester schedule wizard |
| `/notes` | NotesLibrary | Browse and search course notes by department |
| `/notes/:courseId` | CourseNotes | Per-course note feed with community voting |
| `/chat` | Chat | Student messaging — conversations and threads |
| `/profile` | Profile | Student profile and enrolled subjects |
| `/settings` | Settings | Account preferences and portal settings |

### Teacher Routes (wrapped in TeacherRoute)

| Route | Page | Description |
|---|---|---|
| `/teacher` | TeacherDashboard | Academic overview, KPIs, charts, risk flags |
| `/teacher/classes` | TeacherClasses | All assigned courses with stats and actions |
| `/teacher/classes/:courseCode` | TeacherCourseDetail | Deep-dive into a specific course |
| `/teacher/attendance` | TeacherAttendance | Mark and review student attendance |
| `/teacher/analytics` | TeacherAnalytics | Grade distribution, engagement heatmap, at-risk board |
| `/teacher/chat` | TeacherChat | Teacher messaging interface |
| `/teacher/profile` | Profile | Shared with student — profile page |
| `/teacher/settings` | TeacherSettings | Teacher account and portal preferences |

### Admin Routes (wrapped in AdminRoute)

| Route | Page | Description |
|---|---|---|
| `/admin` | AdminDashboard | Platform KPIs, traffic, approvals, system logs |
| `/admin/students` | AdminStudents | Student directory with filters and pagination |
| `/admin/students/:studentId` | AdminStudentDetail | Individual student academic record |
| `/admin/teachers` | AdminTeachers | Teacher directory with filters and pagination |
| `/admin/teachers/:teacherId` | AdminTeacherDetail | Individual teacher profile and performance |
| `/admin/schedules` | AdminSchedules | Timetable grid/list manager |
| `/admin/management` | AdminManagement | Batch user management operations |
| `/admin/resources` | AdminResources | University resource browser |
| `/admin/resources/:deptId` | AdminResources | Department-specific resource view |
| `/admin/messenger` | AdminMessenger | Broadcast messaging to users |
| `/admin/analytics` | AdminAnalytics | Platform traffic, user distribution, system alerts |
| `/admin/settings` | AdminSettings | Portal configuration (General/Branding/Security/API) |
| `/admin/maintenance` | AdminMaintenance | System maintenance mode controls |
| `/admin/infrastructure` | AdminInfrastructure | Server and infrastructure monitoring |

**Total: 27 routes** across 4 route groups.

---

## Architecture

### Role System

Roles are managed globally by `RoleContext` and persisted to `localStorage` under the key `"ulab-role"`. Three roles are supported:

```ts
type UserRole = "student" | "teacher" | "admin"
```

The `useRole()` hook exposes:
- `role` — the current active role string
- `switchRole(newRole)` — updates state and persists to localStorage (memoized with useCallback)
- `isStudent`, `isTeacher`, `isAdmin` — boolean convenience flags derived from `role`

Role state initialises from `localStorage` on first render, so it survives browser refreshes.

### Theme System

`ThemeContext` manages light/dark mode via the `"dark"` CSS class on `document.documentElement` — the standard Tailwind `darkMode: "class"` strategy. The active theme is persisted to `localStorage` under `"theme"` and defaults to `"light"`.

The `useTheme()` hook exposes `theme` (`"light" | "dark"`) and `toggleTheme()`.

### Route Guards

Route groups are wrapped in guard components (`StudentRoute`, `TeacherRoute`, `AdminRoute`) defined in `src/components/auth/RouteGuards.tsx`. These are currently pass-through `<Outlet />` wrappers, providing the structural groundwork for adding server-side authentication checks (redirect to login if no valid session, or redirect to the correct portal if the role does not match).

### Component Design

Every major page follows a **dual-layout pattern** — a completely different structure for desktop and mobile using Tailwind's responsive prefixes (`md:hidden`, `hidden md:flex`):

- **Desktop:** Fixed sidebar rail + sticky top header + multi-column content grid with charts, stats cards, and data tables.
- **Mobile:** Sticky top bar + vertically stacked card sections + fixed bottom navigation + slide-out drawer menu.

The `use-mobile.tsx` hook drives the `isMobile` breakpoint flag (threshold: 768px), which switches some pages to dedicated mobile components entirely (e.g. `MobileTeacherDashboard` vs the standard desktop `TeacherDashboard`).

**Animations** are handled by Framer Motion — staggered card entrances on dashboards, fade-in + slide-up effects on page load, and `AnimatePresence` on filter and tab transitions.

**Shared chat infrastructure:** Both the student and teacher chat pages use the same `ChatThread` and `ConversationList` components; only the surrounding layout differs.

**Provider stack** in `App.tsx` (outermost to innermost):
```
QueryClientProvider
  ThemeProvider
    RoleProvider
      TooltipProvider
        Toaster + Sonner
          BrowserRouter
            Routes
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/MHR-RONY/Ulab_One_Portal.git
cd Ulab_One_Portal

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Production Build

```bash
npm run build
```

Output is written to `dist/`. Preview the production build locally:

```bash
npm run preview
```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start dev server with HMR at localhost:8080 |
| `build` | `vite build` | Production build with full TypeScript check |
| `build:dev` | `vite build --mode development` | Development build (source maps, no minification) |
| `preview` | `vite preview` | Serve the production build locally |
| `lint` | `eslint .` | Run ESLint across all source files |
| `test` | `vitest run` | Run all tests once and exit |
| `test:watch` | `vitest` | Run tests in interactive watch mode |

---

## Key Dependencies

### Runtime

| Package | Version | Purpose |
|---|---|---|
| `react` / `react-dom` | 18.3.x | Core UI framework |
| `react-router-dom` | 6.30.x | Client-side routing with nested routes |
| `@tanstack/react-query` | 5.83.x | Server state management and caching |
| `react-hook-form` | 7.61.x | Performant form state management |
| `zod` | 3.25.x | Schema-based form and data validation |
| `recharts` | 2.15.x | Composable charting (AreaChart, RadarChart, etc.) |
| `framer-motion` | 12.35.x | Declarative animations and transitions |
| `lucide-react` | 0.462.x | Consistent SVG icon library (500+ icons) |
| `tailwind-merge` + `clsx` | latest | Conditional Tailwind class merging via cn() |
| `sonner` | 1.7.x | Toast notification system |
| `date-fns` | 3.6.x | Lightweight date formatting and manipulation |
| `cmdk` | 1.1.x | Command palette (CMD+K) component |
| `vaul` | 0.9.x | Accessible drawer / bottom-sheet component |
| `embla-carousel-react` | 8.6.x | Touch-friendly carousel |
| `input-otp` | 1.4.x | OTP input field component |
| `react-resizable-panels` | 2.1.x | Drag-to-resize panel layouts |
| `react-day-picker` | 8.10.x | Date picker calendar |
| `next-themes` | 0.3.x | Theme provider utility |
| `@radix-ui/react-*` | latest | Accessible UI primitives underlying all shadcn components |

### Development

| Package | Version | Purpose |
|---|---|---|
| `vite` + `@vitejs/plugin-react-swc` | 5.x | Fast build tooling with SWC Rust compiler |
| `typescript` | 5.x | Static type checking |
| `tailwindcss` + `autoprefixer` | 3.x | Utility-first CSS framework |
| `@tailwindcss/typography` | 0.5.x | Prose / markdown typography plugin |
| `eslint` + plugins | 9.x | Flat-config linting with React Hooks rules |
| `vitest` | latest | Vite-native unit test runner |
| `@testing-library/react` | 16.x | Component testing utilities |
| `@testing-library/jest-dom` | 6.x | Custom DOM matchers for Vitest |

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

Made with ❤️ for ULAB by [Mhr Rony](https://mhrrony.com)

</div>
