import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getAttendanceByStudent, getSubjectsByClass, getSubjectById,
    getAttendancePercentage, AttendanceRecord, Subject
} from '../../store/data';

const StudentAttendance: React.FC = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTab, setSelectedTab] = useState<'all' | 'present' | 'absent'>('all');

    useEffect(() => {
        if (!user || !user.classId) return;
        setRecords(getAttendanceByStudent(user.id));
        setSubjects(getSubjectsByClass(user.classId));
    }, [user]);

    const filtered = records
        .filter(r => {
            if (selectedSubject && r.subjectId !== selectedSubject) return false;
            if (selectedTab === 'present' && r.status !== 'present' && r.status !== 'late') return false;
            if (selectedTab === 'absent' && r.status !== 'absent') return false;
            return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const absentCount = records.filter(r => r.status === 'absent').length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present': return <span className="badge badge-success">Present</span>;
            case 'absent': return <span className="badge badge-danger">Absent</span>;
            case 'late': return <span className="badge badge-warning">Late</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>My Attendance</h2>
                <p>Track your attendance records across all subjects</p>
            </div>

            {/* Summary */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-card-value" style={{ color: 'var(--accent-primary-light)' }}>{records.length}</div>
                    <div className="stat-card-label">Total Records</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value" style={{ color: 'var(--green-light)' }}>{presentCount}</div>
                    <div className="stat-card-label">Present</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-value" style={{ color: 'var(--red-light)' }}>{absentCount}</div>
                    <div className="stat-card-label">Absent</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
                <div className="tab-nav">
                    <button className={`tab-btn ${selectedTab === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('all')}>All</button>
                    <button className={`tab-btn ${selectedTab === 'present' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('present')}>Present</button>
                    <button className={`tab-btn ${selectedTab === 'absent' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('absent')}>Absent</button>
                </div>
                <select className="form-select" style={{ width: 260 }} value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                    ))}
                </select>
            </div>

            {/* Attendance Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Subject</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: 40 }}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📋</div>
                                        <h3>No records found</h3>
                                        <p>No attendance records match the current filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(record => {
                                const subject = getSubjectById(record.subjectId);
                                return (
                                    <tr key={record.id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                                                <span>{record.date}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={14} style={{ color: 'var(--accent-primary-light)' }} />
                                                <span style={{ fontWeight: 600 }}>{subject?.name || '—'}</span>
                                                <span className="badge badge-info" style={{ fontSize: 10 }}>{subject?.code}</span>
                                            </div>
                                        </td>
                                        <td>{record.time || '—'}</td>
                                        <td>{getStatusBadge(record.status)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Subject-wise Summary */}
            <div className="card mt-6">
                <div className="card-header">
                    <h3>Subject-wise Summary</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {subjects.map((sub, i) => {
                        const pct = user ? getAttendancePercentage(user.id, sub.id) : 0;
                        const subRecords = records.filter(r => r.subjectId === sub.id);
                        const subPresent = subRecords.filter(r => r.status === 'present' || r.status === 'late').length;
                        return (
                            <div key={sub.id} className="attendance-item" style={{ padding: '14px 20px' }}>
                                <div className="attendance-avatar" style={{
                                    background: `linear-gradient(135deg, ${['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'][i % 5]
                                        }, ${['#8b5cf6', '#34d399', '#fbbf24', '#60a5fa', '#f87171'][i % 5]
                                        })`,
                                    width: 36, height: 36, fontSize: 12
                                }}>
                                    <BookOpen size={14} />
                                </div>
                                <div className="attendance-info">
                                    <div className="attendance-name">{sub.name}</div>
                                    <div className="attendance-meta">{subPresent}/{subRecords.length} classes attended</div>
                                </div>
                                <div style={{ width: 80 }}>
                                    <div className="progress-bar" style={{ height: 6 }}>
                                        <div
                                            className={`progress-bar-fill ${pct >= 75 ? 'green' : pct >= 50 ? 'yellow' : 'red'}`}
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span style={{
                                    fontWeight: 800, fontSize: 15, minWidth: 44, textAlign: 'right',
                                    color: pct >= 75 ? 'var(--green-light)' : pct >= 50 ? 'var(--yellow-light)' : 'var(--red-light)'
                                }}>
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

export default StudentAttendance;
