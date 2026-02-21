# 📋 QR Attend — Smart Attendance Management System

A modern, QR code-based attendance management system designed for educational institutions. Built with **React**, **TypeScript**, and **Vite**, it provides separate dashboards for **Admin**, **Teacher**, and **Student** roles with a premium dark-themed UI.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Features

### 🔐 Authentication & Access Control
- Role-based login system (Admin / Teacher / Student)
- Session-based authentication with localStorage persistence
- Protected routes — each role can only access their own pages
- Demo credentials provided for quick testing

### 👨‍💼 Admin Module
- **Dashboard** — Overview with stat cards (teachers, students, classes, attendance rate), recent activity feed, and system health
- **Manage Teachers** — Full CRUD (Create, Read, Update, Delete) for teacher accounts with search and filter
- **Manage Students** — Add/edit/delete students with class, semester, roll number, and department assignment
- **Classes & Sections** — Create and manage class sections with department and semester mapping
- **Subjects** — Add subjects and assign teachers to classes
- **Attendance Records** — View all attendance records with filters for date, subject, and status
- **Reports** — Institution-wide attendance reports with CSV export and percentage breakdown per subject

### 👩‍🏫 Teacher Module
- **Dashboard** — View assigned subjects, student count, today's attendance count, and total sessions
- **Generate QR Code** — Select a subject, generate a unique session QR code with a 5-minute countdown timer, and track student scans in real-time
- **Attendance List** — View attendance records per subject with date filters and overall percentage
- **Reports** — Student-wise attendance breakdown with progress bars, status indicators, and CSV export

### 👨‍🎓 Student Module
- **Dashboard** — Animated attendance percentage circle, subject-wise progress bars, and quick stats (total/attended/missed classes)
- **Scan QR Code** — Animated scanner interface with camera simulation and manual session code entry
- **My Attendance** — Filterable attendance history (All / Present / Absent) with subject-wise summary and date logs

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework with functional components and hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Fast build tool and dev server |
| **React Router v6** | Client-side routing with protected routes |
| **qrcode.react** | QR code generation (SVG) |
| **Lucide React** | Beautiful icon library |
| **LocalStorage** | Client-side data persistence |
| **CSS3** | Custom design system with variables, animations, glassmorphism |

---

## 📁 Project Structure

```
src/
├── components/
│   └── Sidebar.tsx            # Role-aware sidebar navigation
├── context/
│   ├── AuthContext.tsx         # Authentication state management
│   └── ToastContext.tsx        # Toast notification system
├── pages/
│   ├── LoginPage.tsx           # Login page with role selector
│   ├── admin/
│   │   ├── AdminDashboard.tsx  # Admin overview dashboard
│   │   ├── ManageUsers.tsx     # Teacher & student CRUD (reusable)
│   │   ├── ManageClasses.tsx   # Class/section management
│   │   ├── ManageSubjects.tsx  # Subject management
│   │   ├── AdminAttendance.tsx # All attendance records
│   │   └── AdminReports.tsx    # Reports with CSV export
│   ├── teacher/
│   │   ├── TeacherDashboard.tsx # Teacher overview
│   │   ├── GenerateQR.tsx      # QR generation with live tracking
│   │   ├── TeacherAttendance.tsx # Subject attendance list
│   │   └── TeacherReports.tsx  # Student-wise reports
│   └── student/
│       ├── StudentDashboard.tsx # Student overview with circle chart
│       ├── ScanQR.tsx          # QR scanner interface
│       └── StudentAttendance.tsx # Personal attendance history
├── store/
│   └── data.ts                 # Data models, mock data, and CRUD operations
├── App.tsx                     # App routing and layout
├── main.tsx                    # Entry point
└── index.css                   # Global design system (CSS variables, animations)
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** (v16 or above)
- **npm** (v8 or above)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sanjana

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173/**

### Build for Production

```bash
npm run build
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@university.edu` | `admin123` |
| **Teacher** | `anita@university.edu` | `teacher123` |
| **Teacher** | `vikram@university.edu` | `teacher123` |
| **Student** | `priya@student.edu` | `student123` |
| **Student** | `rahul@student.edu` | `student123` |
| **Student** | `sanjana@student.edu` | `student123` |

> 💡 **Tip:** On the login page, click **"Fill Demo Credentials"** to auto-fill the form for the selected role.

---

## 🎨 Design System

The app uses a custom **premium dark theme** with:

- **Color Palette** — Indigo/violet primary accents with green, yellow, red, and blue semantic colors
- **Glassmorphism** — Frosted glass cards with `backdrop-filter: blur()` effects
- **Animations** — Fade-in, slide-in, scale, float, pulse, shimmer, and scan-line animations
- **Typography** — [Inter](https://fonts.google.com/specimen/Inter) font with weights 300–900
- **Responsive** — Fully responsive with mobile-friendly sidebar collapse
- **Custom Scrollbar** — Themed scrollbar matching the accent colors

---

## 📊 How the QR Attendance Flow Works

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   TEACHER    │     │   QR SESSION    │     │    STUDENT       │
│              │     │                 │     │                  │
│ 1. Select    │────▶│ 2. Unique QR    │     │ 4. Scan QR       │
│    Subject   │     │    Generated    │────▶│    with phone    │
│              │     │    (5 min TTL)  │     │                  │
│ 3. Display   │     │                 │     │ 5. Attendance    │
│    QR Code   │     │ 6. Session ends │     │    marked ✓      │
│    to class  │     │    Auto-absent  │     │                  │
└──────────────┘     └─────────────────┘     └──────────────────┘
```

1. **Teacher** selects a subject and clicks "Generate QR Code"
2. A **unique, time-limited QR code** is created (valid for 5 minutes)
3. Teacher **displays the QR code** to the class (via projector/screen)
4. **Students scan** the QR code using their phones
5. Attendance is **marked as present** in real-time
6. When the session ends, remaining students are **auto-marked absent**

---

## 🔒 Security Features

- **Session-based QR codes** — Each QR is unique per session and expires after 5 minutes
- **Role-based access control** — Routes are protected; students can't access admin/teacher pages
- **Duplicate prevention** — A student can only mark attendance once per session
- **Time-limited codes** — QR codes become invalid after expiry to prevent proxy attendance

---

## 🎯 Key Benefits

| Benefit | Description |
|---|---|
| 📱 **Paperless** | No more paper-based attendance sheets |
| ⚡ **Fast** | Attendance marking takes seconds, not minutes |
| 🎯 **Accurate** | Eliminates manual errors and proxy attendance |
| 📊 **Transparent** | Students can track their own attendance in real-time |
| 📈 **Reports** | Instant reports with CSV export for analysis |
| 🔐 **Secure** | Time-limited, session-specific QR codes |

---

## 🗂️ Data Storage

Currently uses **localStorage** for data persistence (ideal for demos and prototyping). The data store (`src/store/data.ts`) is designed with clean interfaces and can be easily swapped for a backend API (e.g., Firebase, Supabase, or a REST/GraphQL API).

### Mock Data Included
- 1 Admin, 2 Teachers, 6 Students
- 3 Classes (CS-4A, CS-6A, CS-2A)
- 5 Subjects (DSA, DBMS, ML, CN, AI)
- ~160 attendance records across 10 days

> To reset all data to defaults, run this in the browser console:
> ```js
> localStorage.removeItem('qr_attendance_data');
> localStorage.removeItem('qr_attendance_auth');
> location.reload();
> ```

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👩‍💻 Author

Built with ❤️ for educational institutions.
