import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageClasses from './pages/admin/ManageClasses';
import ManageSubjects from './pages/admin/ManageSubjects';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminReports from './pages/admin/AdminReports';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import GenerateQR from './pages/teacher/GenerateQR';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherReports from './pages/teacher/TeacherReports';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ScanQR from './pages/student/ScanQR';
import StudentAttendance from './pages/student/StudentAttendance';

import './index.css';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: string;
}> = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={`/${user?.role}`} replace /> : <LoginPage />
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute allowedRole="admin"><ManageUsers role="teacher" /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRole="admin"><ManageUsers role="student" /></ProtectedRoute>} />
      <Route path="/admin/classes" element={<ProtectedRoute allowedRole="admin"><ManageClasses /></ProtectedRoute>} />
      <Route path="/admin/subjects" element={<ProtectedRoute allowedRole="admin"><ManageSubjects /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute allowedRole="admin"><AdminAttendance /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRole="admin"><AdminReports /></ProtectedRoute>} />

      {/* Teacher Routes */}
      <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/generate-qr" element={<ProtectedRoute allowedRole="teacher"><GenerateQR /></ProtectedRoute>} />
      <Route path="/teacher/attendance" element={<ProtectedRoute allowedRole="teacher"><TeacherAttendance /></ProtectedRoute>} />
      <Route path="/teacher/reports" element={<ProtectedRoute allowedRole="teacher"><TeacherReports /></ProtectedRoute>} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/scan" element={<ProtectedRoute allowedRole="student"><ScanQR /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute allowedRole="student"><StudentAttendance /></ProtectedRoute>} />

      {/* Default */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
