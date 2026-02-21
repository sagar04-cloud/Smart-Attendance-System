import React, { useState, useEffect } from 'react';
import { BookOpen, CalendarCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getSubjectsByClass, getAttendancePercentage, getAttendanceByStudent,
    getClassById, Subject
} from '../../store/data';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [overallPercentage, setOverallPercentage] = useState(0);
    const [totalClasses, setTotalClasses] = useState(0);
    const [missedClasses, setMissedClasses] = useState(0);

    useEffect(() => {
        if (!user || !user.classId) return;

        const subs = getSubjectsByClass(user.classId);
        setSubjects(subs);

        const records = getAttendanceByStudent(user.id);
        setTotalClasses(records.length);
        const absent = records.filter(r => r.status === 'absent').length;
        setMissedClasses(absent);

        if (subs.length > 0) {
            const percentages = subs.map(s => getAttendancePercentage(user.id, s.id));
            const avg = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
            setOverallPercentage(avg);
        }
    }, [user]);

    const getColor = (pct: number) => {
        if (pct >= 75) return 'var(--green-light)';
        if (pct >= 50) return 'var(--yellow-light)';
        return 'var(--red-light)';
    };

    const getStroke = (pct: number) => {
        if (pct >= 75) return 'url(#greenGrad)';
        if (pct >= 50) return 'url(#yellowGrad)';
        return 'url(#redGrad)';
    };

    const circumference = 2 * Math.PI * 52;

    const cls = user?.classId ? getClassById(user.classId) : null;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Welcome, {user?.name?.split(' ')[0]} 👋</h2>
                <p>{cls?.name || ''} • {user?.department} • Semester {user?.semester} • Roll: {user?.rollNo}</p>
            </div>

            <div className="grid-2" style={{ marginBottom: 32 }}>
                {/* Overall Attendance Circle */}
                <div className="card">
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 32, padding: 32 }}>
                        <div className="percentage-circle">
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <defs>
                                    <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#34d399" />
                                    </linearGradient>
                                    <linearGradient id="yellowGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" />
                                        <stop offset="100%" stopColor="#fbbf24" />
                                    </linearGradient>
                                    <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" />
                                        <stop offset="100%" stopColor="#f87171" />
                                    </linearGradient>
                                </defs>
                                <circle className="percentage-circle-bg" cx="60" cy="60" r="52" />
                                <circle
                                    className="percentage-circle-fill"
                                    cx="60" cy="60" r="52"
                                    stroke={getStroke(overallPercentage)}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - (circumference * overallPercentage) / 100}
                                />
                            </svg>
                            <div className="percentage-label">
                                <div className="percentage-value" style={{ color: getColor(overallPercentage) }}>
                                    {overallPercentage}%
                                </div>
                                <div className="percentage-text">Overall</div>
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Overall Attendance</h3>
                            <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
                                {overallPercentage >= 75
                                    ? 'Great job! Your attendance is above the required threshold.'
                                    : 'Warning: Your attendance is below the required 75% threshold.'}
                            </p>
                            <div className="flex gap-4">
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 800 }}>{totalClasses}</div>
                                    <div className="text-sm text-muted">Total Classes</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red-light)' }}>{missedClasses}</div>
                                    <div className="text-sm text-muted">Missed</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-light)' }}>{totalClasses - missedClasses}</div>
                                    <div className="text-sm text-muted">Attended</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="stat-card" style={{ padding: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-card-icon purple"><BookOpen size={18} /></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>{subjects.length}</div>
                                <div className="text-sm text-muted">Subjects</div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card" style={{ padding: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-card-icon green"><CalendarCheck size={18} /></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>{totalClasses - missedClasses}</div>
                                <div className="text-sm text-muted">Classes Attended</div>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card" style={{ padding: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-card-icon red"><AlertTriangle size={18} /></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>{missedClasses}</div>
                                <div className="text-sm text-muted">Missed Classes</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject-wise breakdown */}
            <div className="card">
                <div className="card-header">
                    <h3>Subject-wise Attendance</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {subjects.map((sub, i) => {
                        const pct = getAttendancePercentage(user!.id, sub.id);
                        return (
                            <div key={sub.id} className="attendance-item" style={{ animationDelay: `${i * 0.05}s`, padding: '16px 20px' }}>
                                <div className="attendance-avatar" style={{
                                    background: `linear-gradient(135deg, ${['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'][i % 5]
                                        }, ${['#8b5cf6', '#34d399', '#fbbf24', '#60a5fa', '#f87171'][i % 5]
                                        })`
                                }}>
                                    <BookOpen size={16} />
                                </div>
                                <div className="attendance-info" style={{ flex: 1 }}>
                                    <div className="attendance-name">{sub.name}</div>
                                    <div className="attendance-meta">{sub.code}</div>
                                </div>
                                <div style={{ width: 120, marginRight: 12 }}>
                                    <div className="progress-bar" style={{ height: 6 }}>
                                        <div
                                            className={`progress-bar-fill ${pct >= 75 ? 'green' : pct >= 50 ? 'yellow' : 'red'}`}
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span style={{ fontWeight: 800, fontSize: 16, color: getColor(pct), minWidth: 48, textAlign: 'right' }}>
                                    {pct}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
