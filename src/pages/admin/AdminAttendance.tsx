import React, { useState, useEffect } from 'react';
import { Search, Calendar, RefreshCw } from 'lucide-react';
import {
    getAttendance, getUsers, getSubjects, getClasses,
    updateAttendanceRecord,
    AttendanceRecord, User, Subject, ClassSection
} from '../../store/data';
import { useToast } from '../../context/ToastContext';

const AdminAttendance: React.FC = () => {
    const { showToast } = useToast();
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassSection[]>([]);
    const [search, setSearch] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const loadData = () => {
        setRecords(getAttendance());
        setUsers(getUsers());
        setSubjects(getSubjects());
        setClasses(getClasses());
    };

    useEffect(() => { loadData(); }, []);

    const filtered = records.filter(r => {
        const student = users.find(u => u.id === r.studentId);
        const matchSearch = !search || (student && student.name.toLowerCase().includes(search.toLowerCase()));
        const matchDate = !filterDate || r.date === filterDate;
        const matchSubject = !filterSubject || r.subjectId === filterSubject;
        const matchStatus = !filterStatus || r.status === filterStatus;
        return matchSearch && matchDate && matchSubject && matchStatus;
    }).sort((a, b) => b.date.localeCompare(a.date));

    const handleStatusChange = (recordId: string, newStatus: 'present' | 'absent' | 'late', studentName: string) => {
        updateAttendanceRecord(recordId, { status: newStatus });
        loadData();
        showToast(`${studentName}'s status changed to ${newStatus}`, 'success');
    };

    // Count by status for quick stats
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h2>Attendance Records</h2>
                        <p>View and manage all attendance records across the institution</p>
                    </div>
                    <button className="btn btn-secondary" onClick={loadData}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Quick Status Summary */}
            <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
                <div onClick={() => setFilterStatus('')}
                    style={{
                        padding: '10px 20px', borderRadius: 'var(--radius-md)',
                        background: !filterStatus ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-glass)',
                        border: `1px solid ${!filterStatus ? 'rgba(99, 102, 241, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{records.length}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total</span>
                </div>
                <div onClick={() => setFilterStatus('present')}
                    style={{
                        padding: '10px 20px', borderRadius: 'var(--radius-md)',
                        background: filterStatus === 'present' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-glass)',
                        border: `1px solid ${filterStatus === 'present' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{presentCount}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Present</span>
                </div>
                <div onClick={() => setFilterStatus('absent')}
                    style={{
                        padding: '10px 20px', borderRadius: 'var(--radius-md)',
                        background: filterStatus === 'absent' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-glass)',
                        border: `1px solid ${filterStatus === 'absent' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{absentCount}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Absent</span>
                </div>
                <div onClick={() => setFilterStatus('late')}
                    style={{
                        padding: '10px 20px', borderRadius: 'var(--radius-md)',
                        background: filterStatus === 'late' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-glass)',
                        border: `1px solid ${filterStatus === 'late' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{lateCount}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Late</span>
                </div>
            </div>

            <div className="filter-bar mb-6" style={{ gap: 12, flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ minWidth: 240 }}>
                    <Search size={18} />
                    <input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="search-bar" style={{ minWidth: 'auto', width: 180 }}>
                    <Calendar size={16} />
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)' }} />
                </div>
                <select className="form-select" style={{ width: 200 }} value={filterSubject}
                    onChange={e => setFilterSubject(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <select className="form-select" style={{ width: 150 }} value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                </select>
                <span className="badge badge-purple">{filtered.length} records</span>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Roll No</th>
                            <th>Subject</th>
                            <th>Class</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Change Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📋</div>
                                        <h3>No records found</h3>
                                        <p>
                                            {records.length === 0
                                                ? 'No attendance records yet. Records will appear after a teacher runs an attendance session.'
                                                : 'No records match the current filters. Try adjusting your filters.'
                                            }
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.slice(0, 100).map(record => {
                                const student = users.find(u => u.id === record.studentId);
                                const subject = subjects.find(s => s.id === record.subjectId);
                                const cls = classes.find(c => c.id === record.classId);
                                return (
                                    <tr key={record.id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span style={{ fontWeight: 600 }}>{student?.name || '—'}</span>
                                                {record.flagged && (
                                                    <span style={{
                                                        fontSize: 9, fontWeight: 700,
                                                        background: 'rgba(245, 158, 11, 0.2)',
                                                        color: '#f59e0b', padding: '2px 5px',
                                                        borderRadius: 3
                                                    }} title={record.flagReason || ''}>⚠ PROXY</span>
                                                )}
                                            </div>
                                        </td>
                                        <td><span className="badge badge-purple">{student?.rollNo || '—'}</span></td>
                                        <td>{subject?.name || '—'}</td>
                                        <td>{cls?.name || '—'}</td>
                                        <td>{record.date}</td>
                                        <td>{record.time || '—'}</td>
                                        <td>
                                            {record.status === 'present' && <span className="badge badge-success">Present</span>}
                                            {record.status === 'absent' && <span className="badge badge-danger">Absent</span>}
                                            {record.status === 'late' && <span className="badge badge-warning">Late</span>}
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                {record.status !== 'present' && (
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{
                                                            padding: '3px 10px', fontSize: 11, fontWeight: 600,
                                                            background: 'rgba(16, 185, 129, 0.12)',
                                                            color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)',
                                                            borderRadius: 6, cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleStatusChange(record.id, 'present', student?.name || 'Student')}
                                                    >
                                                        Present
                                                    </button>
                                                )}
                                                {record.status !== 'absent' && (
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{
                                                            padding: '3px 10px', fontSize: 11, fontWeight: 600,
                                                            background: 'rgba(239, 68, 68, 0.12)',
                                                            color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)',
                                                            borderRadius: 6, cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleStatusChange(record.id, 'absent', student?.name || 'Student')}
                                                    >
                                                        Absent
                                                    </button>
                                                )}
                                                {record.status !== 'late' && (
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{
                                                            padding: '3px 10px', fontSize: 11, fontWeight: 600,
                                                            background: 'rgba(245, 158, 11, 0.12)',
                                                            color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)',
                                                            borderRadius: 6, cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleStatusChange(record.id, 'late', student?.name || 'Student')}
                                                    >
                                                        Late
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAttendance;
