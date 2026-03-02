import React, { useState, useEffect } from 'react';
import {
    Users, GraduationCap, BookOpen, CalendarCheck, TrendingUp,
    BarChart3, Clock, Award, ShieldAlert, Smartphone
} from 'lucide-react';
import {
    getUsers, getClasses, getSubjects, getAttendance, getSessions,
    getProxyLogs, AttendanceRecord, ProxyLog
} from '../../store/data';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        teachers: 0,
        students: 0,
        classes: 0,
        subjects: 0,
        totalRecords: 0,
        avgAttendance: 0,
        activeSessions: 0,
        proxyAlerts: 0,
    });

    const [recentActivity, setRecentActivity] = useState<Array<{
        id: string; action: string; user: string; time: string; type: string;
    }>>([]);

    const formatTimeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    useEffect(() => {
        const users = getUsers();
        const classes = getClasses();
        const subjects = getSubjects();
        const attendance = getAttendance();
        const sessions = getSessions();
        const proxyLogs = getProxyLogs();

        const teachers = users.filter(u => u.role === 'teacher').length;
        const students = users.filter(u => u.role === 'student').length;
        const activeSessions = sessions.filter(s => s.isActive && s.expiresAt > Date.now()).length;

        const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
        const avgAttendance = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

        setStats({
            teachers,
            students,
            classes: classes.length,
            subjects: subjects.length,
            totalRecords: attendance.length,
            avgAttendance,
            activeSessions,
            proxyAlerts: proxyLogs.length,
        });

        // Build REAL recent activity from actual data
        const activities: Array<{
            id: string; action: string; user: string; time: string; type: string; sortTime: number;
        }> = [];

        // Recent attendance records
        attendance
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
                const dateB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
                return dateB - dateA;
            })
            .slice(0, 8)
            .forEach((record: AttendanceRecord) => {
                const student = users.find(u => u.id === record.studentId);
                const subject = subjects.find(s => s.id === record.subjectId);
                const timestamp = new Date(`${record.date}T${record.time || '00:00'}`);
                activities.push({
                    id: `att-${record.id}`,
                    action: record.flagged 
                        ? `⚠️ Flagged attendance — ${subject?.name || 'Unknown'}`
                        : `Attendance marked — ${subject?.name || 'Unknown'}`,
                    user: student?.name || 'Unknown Student',
                    time: formatTimeAgo(timestamp.toISOString()),
                    type: record.flagged ? 'proxy' : 'attendance',
                    sortTime: timestamp.getTime(),
                });
            });

        // Recent sessions (limit to 2 to avoid cluttering the feed)
        const now = Date.now();
        sessions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 2)
            .forEach(session => {
                const teacher = users.find(u => u.id === session.teacherId);
                const subject = subjects.find(s => s.id === session.subjectId);
                const timestamp = new Date(`${session.date}T${session.startTime || '00:00'}`);
                const isReallyLive = session.isActive && session.expiresAt > now;
                activities.push({
                    id: `ses-${session.id}`,
                    action: isReallyLive
                        ? `🟢 Live session — ${subject?.name || 'Unknown'}`
                        : `Session ended — ${subject?.name || 'Unknown'}`,
                    user: teacher?.name || 'Unknown Teacher',
                    time: formatTimeAgo(timestamp.toISOString()),
                    type: 'session',
                    sortTime: timestamp.getTime(),
                });
            });

        // Recent proxy alerts
        proxyLogs
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5)
            .forEach((log: ProxyLog) => {
                const typeLabel = log.type === 'screenshot_detected' ? '📸 Screenshot detected' :
                    log.type === 'same_device' ? '📱 Same device proxy' :
                    log.type === 'wrong_device' ? '🚫 Wrong device blocked' : '⚠️ Proxy attempt';
                activities.push({
                    id: `proxy-${log.id}`,
                    action: `${typeLabel} — ${log.subjectName || 'Unknown'}`,
                    user: log.studentName,
                    time: formatTimeAgo(log.timestamp),
                    type: 'proxy',
                    sortTime: new Date(log.timestamp).getTime(),
                });
            });

        // Recent student registrations (by createdAt)
        users
            .filter(u => u.role === 'student')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
            .forEach(user => {
                activities.push({
                    id: `user-${user.id}`,
                    action: 'Student registered',
                    user: user.name,
                    time: formatTimeAgo(user.createdAt),
                    type: 'student',
                    sortTime: new Date(user.createdAt).getTime(),
                });
            });

        // Sort by most recent and take top 8
        activities.sort((a, b) => b.sortTime - a.sortTime);
        setRecentActivity(activities.slice(0, 8));
    }, []);

    const statCards = [
        { label: 'Total Teachers', value: stats.teachers, icon: <Users />, cls: 'purple', change: `${stats.teachers}`, positive: true },
        { label: 'Total Students', value: stats.students, icon: <GraduationCap />, cls: 'green', change: `${stats.students}`, positive: true },
        { label: 'Active Classes', value: stats.classes, icon: <BookOpen />, cls: 'yellow', change: `${stats.activeSessions} live`, positive: stats.activeSessions > 0 },
        { label: 'Avg Attendance', value: `${stats.avgAttendance}%`, icon: <CalendarCheck />, cls: 'blue', change: `${stats.totalRecords} records`, positive: true },
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'student': return <GraduationCap size={16} />;
            case 'session': return <Clock size={16} />;
            case 'attendance': return <CalendarCheck size={16} />;
            case 'report': return <BarChart3 size={16} />;
            case 'subject': return <BookOpen size={16} />;
            case 'proxy': return <ShieldAlert size={16} />;
            case 'device': return <Smartphone size={16} />;
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
            case 'proxy': return '#ef4444';
            case 'device': return '#f59e0b';
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
                        <span className="badge badge-info">
                            {stats.activeSessions > 0 ? '🟢 Live' : 'Updated'}
                        </span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {recentActivity.length === 0 ? (
                            <div style={{ padding: 30, textAlign: 'center' }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                    No recent activity yet. Activity will appear when students scan QR codes and teachers create sessions.
                                </div>
                            </div>
                        ) : (
                            recentActivity.map(activity => (
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
                            ))
                        )}
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
                                    <div className="progress-bar-fill purple" style={{ width: `${Math.min(100, (stats.totalRecords / Math.max(stats.students, 1)) * 10)}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted">Subjects Covered</span>
                                    <span className="text-sm" style={{ fontWeight: 700 }}>{stats.subjects}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill blue" style={{ width: `${Math.min(100, stats.subjects * 20)}%` }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted">Faculty Active</span>
                                    <span className="text-sm" style={{ fontWeight: 700 }}>{stats.teachers}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill green" style={{ width: `${Math.min(100, stats.teachers * 25)}%` }}></div>
                                </div>
                            </div>

                            {/* Proxy Alert Summary */}
                            {stats.proxyAlerts > 0 ? (
                                <div style={{
                                    marginTop: 8, padding: 16,
                                    background: 'rgba(239, 68, 68, 0.06)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid rgba(239, 68, 68, 0.15)',
                                }}>
                                    <div className="flex items-center gap-3">
                                        <ShieldAlert size={20} style={{ color: '#ef4444' }} />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{stats.proxyAlerts} Proxy Alert{stats.proxyAlerts > 1 ? 's' : ''}</div>
                                            <div className="text-sm text-muted">Review in Proxy Alerts section</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    marginTop: 8, padding: 16,
                                    background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                }}>
                                    <div className="flex items-center gap-3">
                                        <TrendingUp size={20} style={{ color: 'var(--green)' }} />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>System Running Smoothly</div>
                                            <div className="text-sm text-muted">No proxy attempts detected</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
