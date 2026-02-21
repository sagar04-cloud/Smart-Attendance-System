import React, { useState, useEffect } from 'react';
import {
    Users, GraduationCap, BookOpen, CalendarCheck, TrendingUp,
    BarChart3, Clock, Award
} from 'lucide-react';
import {
    getUsers, getClasses, getSubjects, getAttendance,
} from '../../store/data';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        teachers: 0,
        students: 0,
        classes: 0,
        subjects: 0,
        totalRecords: 0,
        avgAttendance: 0,
    });

    const [recentActivity, setRecentActivity] = useState<Array<{
        id: string; action: string; user: string; time: string; type: string;
    }>>([]);

    useEffect(() => {
        const users = getUsers();
        const classes = getClasses();
        const subjects = getSubjects();
        const attendance = getAttendance();

        const teachers = users.filter(u => u.role === 'teacher').length;
        const students = users.filter(u => u.role === 'student').length;

        const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
        const avgAttendance = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

        setStats({
            teachers,
            students,
            classes: classes.length,
            subjects: subjects.length,
            totalRecords: attendance.length,
            avgAttendance,
        });

        setRecentActivity([
            { id: '1', action: 'New student registered', user: 'Priya Patel', time: '2 min ago', type: 'student' },
            { id: '2', action: 'QR session generated', user: 'Prof. Anita Sharma', time: '15 min ago', type: 'session' },
            { id: '3', action: 'Attendance marked', user: 'Rahul Verma', time: '20 min ago', type: 'attendance' },
            { id: '4', action: 'Report exported', user: 'Admin', time: '1 hour ago', type: 'report' },
            { id: '5', action: 'New subject added', user: 'Admin', time: '2 hours ago', type: 'subject' },
        ]);
    }, []);

    const statCards = [
        { label: 'Total Teachers', value: stats.teachers, icon: <Users />, cls: 'purple', change: '+2', positive: true },
        { label: 'Total Students', value: stats.students, icon: <GraduationCap />, cls: 'green', change: '+12', positive: true },
        { label: 'Active Classes', value: stats.classes, icon: <BookOpen />, cls: 'yellow', change: '0', positive: true },
        { label: 'Avg Attendance', value: `${stats.avgAttendance}%`, icon: <CalendarCheck />, cls: 'blue', change: '+5%', positive: true },
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'student': return <GraduationCap size={16} />;
            case 'session': return <Clock size={16} />;
            case 'attendance': return <CalendarCheck size={16} />;
            case 'report': return <BarChart3 size={16} />;
            case 'subject': return <BookOpen size={16} />;
            default: return <Award size={16} />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'student': return 'var(--green)';
            case 'session': return 'var(--accent-primary)';
            case 'attendance': return 'var(--blue)';
            case 'report': return 'var(--yellow)';
            case 'subject': return 'var(--cyan)';
            default: return 'var(--accent-primary)';
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Admin Dashboard</h2>
                <p>Overview of your institution's attendance management system</p>
            </div>

            <div className="stats-grid">
                {statCards.map((card, i) => (
                    <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="stat-card-header">
                            <div className={`stat-card-icon ${card.cls}`}>{card.icon}</div>
                            <span className={`stat-card-change ${card.positive ? 'positive' : 'negative'}`}>
                                {card.change}
                            </span>
                        </div>
                        <div className="stat-card-value">{card.value}</div>
                        <div className="stat-card-label">{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid-2">
                {/* Recent Activity */}
                <div className="card">
                    <div className="card-header">
                        <h3>Recent Activity</h3>
                        <span className="badge badge-info">Live</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {recentActivity.map(activity => (
                            <div key={activity.id} className="attendance-item">
                                <div
                                    className="attendance-avatar"
                                    style={{ background: getActivityColor(activity.type), width: 36, height: 36, fontSize: 12 }}
                                >
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="attendance-info">
                                    <div className="attendance-name">{activity.action}</div>
                                    <div className="attendance-meta">{activity.user}</div>
                                </div>
                                <div className="attendance-time">{activity.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="card">
                    <div className="card-header">
                        <h3>System Overview</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted">Attendance Rate</span>
                                    <span className="text-sm" style={{ fontWeight: 700 }}>{stats.avgAttendance}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className={`progress-bar-fill ${stats.avgAttendance >= 75 ? 'green' : stats.avgAttendance >= 50 ? 'yellow' : 'red'}`}
                                        style={{ width: `${stats.avgAttendance}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted">Total Records</span>
                                    <span className="text-sm" style={{ fontWeight: 700 }}>{stats.totalRecords}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill purple" style={{ width: '72%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted">Subjects Covered</span>
                                    <span className="text-sm" style={{ fontWeight: 700 }}>{stats.subjects}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill blue" style={{ width: '60%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted">Faculty Active</span>
                                    <span className="text-sm" style={{ fontWeight: 700 }}>{stats.teachers}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill green" style={{ width: '85%' }}></div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: 8,
                                padding: 16,
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                            }}>
                                <div className="flex items-center gap-3">
                                    <TrendingUp size={20} style={{ color: 'var(--green)' }} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>System Running Smoothly</div>
                                        <div className="text-sm text-muted">All modules are operational</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
