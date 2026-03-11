# ULAB One Portal

A centralized academic management platform built for the University of Liberal Arts Bangladesh (ULAB). The system unifies student scheduling, notes sharing, real-time communication, and attendance tracking into a single portal — accessible across desktop and mobile.

**Author:** [Mhr Rony](https://mhrrony.com)

---

## Features

### Student
- Build and manage a personalized semester schedule by subject and teacher preference
- Upload, browse, and download course notes
- Private and group chat with classmates and teachers
- View attendance records and academic progress
- Access department resources and announcements

### Teacher
- Manage and record student attendance per section
- Monitor student participation and class activity
- Create and manage group chats per course
- View student overviews for assigned sections

### Admin
- Full control over student and teacher accounts
- Manage teacher availability and course assignments
- Upload and manage university course schedules
- Monitor platform activity, usage analytics, and traffic
- View teacher performance and student activity reports
- Manage system infrastructure and configurations
- Restrict or ban users when necessary

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Component Library | shadcn/ui (Radix UI) |
| Routing | React Router v6 |
| Server State | TanStack React Query |
| Forms & Validation | React Hook Form + Zod |
| Charts | Recharts |
| Animations | Framer Motion |
| Testing | Vitest + Testing Library |

---

## Project Structure

```
src/
├── components/
│   ├── admin/        # Admin layout and tab components
│   ├── auth/         # Route guards
│   ├── chat/         # Chat thread and conversation list
│   ├── notes/        # Notes library components
│   ├── student/      # Student layout and dashboard components
│   ├── teacher/      # Teacher layout components
│   └── ui/           # shadcn/ui base components
├── contexts/         # Role and theme context providers
├── data/             # Static data and course data
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── pages/
    ├── admin/        # All admin pages
    ├── auth/         # Login and signup pages
    ├── student/      # All student pages
    └── teacher/      # All teacher pages
```

---

## Getting Started

Requires Node.js — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
git clone https://github.com/MHR-RONY/Ulab_One_Portal.git
cd Ulab_One_Portal
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

```sh
# Run tests
npm run test
```

---

## License

This project is developed for academic purposes at ULAB. All rights reserved.
