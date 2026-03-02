# 📋 QR Attend — Smart Attendance Management System

![QR Attend Hero](public/hero.png)

A professional, high-performance **QR code-based attendance management system** designed for modern educational institutions. Built with a powerhouse stack of **React 18**, **TypeScript**, **Vite**, and **Firebase**, it delivers a seamless, real-time experience across all devices.

---

## 🛡️ Anti-Proxy Protection System

QR Attend features a **4-layer security architecture** to ensure attendance integrity and eliminate proxy marking.

*   **⚡ 5s QR Rotation:** QR codes automatically rotate every **5 seconds**. Screenshots and photo-sharing are rendered useless as the token expires before it can be shared.
*   **📱 Device Locking:** Each student's account is **permanently linked** to the first phone they use to scan. Only that specific device can mark attendance for their account.
*   **🔍 Same-Device Detection:** The system fingerprints every device. If one phone tries to mark attendance for multiple students, it's instantly flagged.
*   **📊 Violation Logging:** Unauthorized attempts (wrong device, expired QR, etc.) are logged with full details for Admin and Teacher review.

---

## ✨ Overview

QR Attend revolutionizes the traditional attendance process by replacing manual registers and paper sheets with a secure, digital-first approach. It features dedicated portals for **Administrators**, **Faculty**, and **Students**, all wrapped in a premium **Glassmorphism** design system with support for both **Dark** and **Light** modes.

### 🌐 Key Links
- **Live Demo:** [Available on Vercel](https://qr-attend.vercel.app)
- **Tech Stack:** React, TypeScript, Firebase, Lucide, Vite

---

## 🚀 Role-Based Features

### 👨‍💼 Administrator Portal (Command Center)
*   **Live Activity Feed:** See real-time attendance scans, session starts, and student registrations.
*   **Proxy Alert Center:** Monitor all suspicious activity with a dedicated violation tracking dashboard.
*   **Attendance Filtering:** View records by **Department** or **Teacher** with one-click filtering.
*   **Device Management:** Reset a student's linked device if they legitimately change their phone.
*   **Academic Structure:** Manage departments, semesters, classes, and sections with ease.
*   **Advanced Analytics:** Generate comprehensive attendance reports with CSV export capabilities.

### 👩‍🏫 Faculty Panel (Classroom Management)
*   **Session Generation:** Create unique, time-bound QR sessions for any assigned subject with a single click.
*   **Proxy Monitoring:** Receive instant alerts and "Proxy" badges on the live attendance list during sessions.
*   **Teacher Proxy Alerts:** Dedicated view for violations occurring within the teacher's own subjects.
*   **Performance Tracking:** Detailed student-wise attendance breakdown with progress visualizations.

### 👨‍🎓 Student Portal (Personal Attendance)
*   **Interactive Dashboard:** Visual attendance tracker with animated percentage charts and status cards.
*   **Smart Scanner:** High-speed QR scanner interface with device registration feedback.
*   **History Logs:** Full transparency into personal attendance records, filtered by subject or status.
*   **Instant Notifications:** Real-time confirmation for successful scans.

---

## 🛠️ The Powerhouse Tech Stack

| Technology | Role |
| :--- | :--- |
| **React 18** | High-performance UI library with modern hook-based architecture. |
| **TypeScript** | Strict type-safety across the entire application for rock-solid reliability. |
| **Firebase** | Real-time synchronization and cloud persistence for instant data updates. |
| **Lucide React** | A consistent, high-quality iconography system for intuitive navigation. |
| **Vite** | The next-generation build tool for ultra-fast development and optimized bundles. |
| **CSS3 (Modern)** | Fully custom design system featuring CSS variables, animations, and glassmorphism. |

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### Local Development
```bash
# 1. Clone the repository
git clone https://github.com/your-username/qr-attend.git

# 2. Enter the project directory
cd qr-attend

# 3. Install dependencies
npm install

# 4. Create a .env file for Firebase (Optional for local mode)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_DATABASE_URL=your_db_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# 5. Launch the development server
npm run dev
```

The application will launch at `http://localhost:5173`.

---

## 🔑 Demo Access

Quick-test the platform using these pre-configured credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@university.edu` | `admin123` |
| **Teacher** | `anita@university.edu` | `teacher123` |
| **Student** | `sanjana@student.edu` | `student123` |

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
