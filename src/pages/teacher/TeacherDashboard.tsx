import React, { useState, useEffect } from 'react';
import {
    QrCode, Users, CalendarCheck, BookOpen, Clock, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getSubjectsByTeacher, getClasses, getAttendance, getUsers,
    Subject, ClassSection
} from '../../store/data';

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassSection[]>([]);
    const [todayCount, setTodayCount] = useState(0);
    const [totalSessions, setTotalSessions] = useState(0);

    useEffect(() => {
        if (!user) return;
        const subs = getSubjectsByTeacher(user.id);
        setSubjects(subs);
        setClasses(getClasses());

        const attendance = getAttendance();
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = attendance.filter(a =>
            subs.some(s => s.id === a.subjectId) && a.date === today
        );
        setTodayCount(todayRecords.length);

        const sessions = new Set(
            attendance.filter(a => subs.some(s => s.id === a.subjectId)).map(a => a.sessionId)
        );
        setTotalSessions(sessions.size);
    }, [user]);

    const totalStudents = new Set(
        getAttendance()
            .filter(a => subjects.some(s => s.id === a.subjectId))
            .map(a => a.studentId)
    ).size;

    const statCards = [
        { label: 'My Subjects', value: subjects.length, icon: <BookOpen />, cls: 'purple' },
        { label: 'Total Students', value: totalStudents, icon: <Users />, cls: 'green' },
        { label: 'Today\'s Attendance', value: todayCount, icon: <CalendarCheck />, cls: 'blue' },
        { label: 'Total Sessions', value: totalSessions, icon: <Clock />, cls: 'yellow' },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Welcome, {user?.name?.split(' ').pop()}</h2>
                <p>Manage your classes and attendance sessions</p>
            </div>

            <div className="stats-grid">
                {statCards.map((card, i) => (
                    <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="stat-card-header">
                            <div className={`stat-card-icon ${card.cls}`}>{card.icon}</div>
                        </div>
                        <div className="stat-card-value">{card.value}</div>
                        <div className="stat-card-label">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Subjects List */}
            <div className="card">
                <div className="card-header">
                    <h3>My Subjects</h3>
                    <span className="badge badge-purple">{subjects.length} subjects</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {subjects.map((sub, i) => {
                        const cls = classes.find(c => c.id === sub.classId);
                        return (
                            <div key={sub.id} className="attendance-item" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div
                                    className="attendance-avatar"
                                    style={{
                                        background: `linear-gradient(135deg, ${['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'][i % 5]
                                            }, ${['#8b5cf6', '#34d399', '#fbbf24', '#60a5fa', '#f87171'][i % 5]
                                            })`
                                    }}
                                >
                                    <BookOpen size={16} />
                                </div>
                                <div className="attendance-info">
                                    <div className="attendance-name">{sub.name}</div>
                                    <div className="attendance-meta">{sub.code} • {cls?.name || ''} • Sem {sub.semester}</div>
                                </div>
                                <span className="badge badge-info">{cls?.department}</span>
                            </div>
                        );
                    })}
                    {subjects.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">📚</div>
                            <h3>No subjects assigned</h3>
                            <p>Contact admin to get subjects assigned to your profile.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
