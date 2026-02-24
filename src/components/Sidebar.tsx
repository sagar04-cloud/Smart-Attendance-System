import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, Users, BookOpen, CalendarCheck, BarChart3,
    QrCode, ClipboardList, GraduationCap, ScanLine, LogOut,
    Building2, Sun, Moon
} from 'lucide-react';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { path: '/admin', icon: <LayoutDashboard />, label: 'Dashboard' },
        { path: '/admin/teachers', icon: <Users />, label: 'Manage Teachers' },
        { path: '/admin/students', icon: <GraduationCap />, label: 'Manage Students' },
        { path: '/admin/classes', icon: <Building2 />, label: 'Classes & Sections' },
        { path: '/admin/subjects', icon: <BookOpen />, label: 'Subjects' },
        { path: '/admin/attendance', icon: <CalendarCheck />, label: 'Attendance Records' },
        { path: '/admin/reports', icon: <BarChart3 />, label: 'Reports' },
    ];

    const teacherLinks = [
        { path: '/teacher', icon: <LayoutDashboard />, label: 'Dashboard' },
        { path: '/teacher/generate-qr', icon: <QrCode />, label: 'Generate QR Code' },
        { path: '/teacher/attendance', icon: <ClipboardList />, label: 'Attendance List' },
        { path: '/teacher/reports', icon: <BarChart3 />, label: 'Reports' },
    ];

    const studentLinks = [
        { path: '/student', icon: <LayoutDashboard />, label: 'Dashboard' },
        { path: '/student/scan', icon: <ScanLine />, label: 'Scan QR Code' },
        { path: '/student/attendance', icon: <CalendarCheck />, label: 'My Attendance' },
    ];

    const links = user.role === 'admin' ? adminLinks : user.role === 'teacher' ? teacherLinks : studentLinks;

    const roleLabel = user.role === 'admin' ? 'Administrator' : user.role === 'teacher' ? 'Faculty Panel' : 'Student Portal';

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">📋</div>
                <div className="sidebar-logo-text">
                    <h1>QR Attend</h1>
                    <p>{roleLabel}</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Navigation</div>
                {links.map(link => (
                    <a
                        key={link.path}
                        className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); navigate(link.path); }}
                        href={link.path}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </a>
                ))}
            </nav>

            <div className="sidebar-footer">
                {/* Theme Toggle */}
                <div className="theme-toggle-wrapper" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    <div className={`theme-toggle-track ${theme}`}>
                        <div className="theme-toggle-icons">
                            <Sun size={14} className="theme-icon-sun" />
                            <Moon size={14} className="theme-icon-moon" />
                        </div>
                        <div className="theme-toggle-thumb" />
                    </div>
                    <span className="theme-toggle-label">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                </div>

                <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
                    <div className="sidebar-user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user.name}</div>
                        <div className="sidebar-user-role">{user.role}</div>
                    </div>
                    <LogOut size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
