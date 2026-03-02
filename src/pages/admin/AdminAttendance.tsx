import React, { useState, useEffect } from 'react';
import { Search, Calendar, RefreshCw, Building2, Users } from 'lucide-react';
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
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterTeacher, setFilterTeacher] = useState('');

    const loadData = () => {
        setRecords(getAttendance());
        setUsers(getUsers());
        setSubjects(getSubjects());
        setClasses(getClasses());
    };

    useEffect(() => { loadData(); }, []);

    // Get unique departments and teachers
    const departments = [...new Set(classes.map(c => c.department).filter(Boolean))];
    const teachers = users.filter(u => u.role === 'teacher');

    const filtered = records.filter(r => {
        const student = users.find(u => u.id === r.studentId);
        const subject = subjects.find(s => s.id === r.subjectId);
        const cls = classes.find(c => c.id === r.classId);
        const matchSearch = !search || (student && student.name.toLowerCase().includes(search.toLowerCase()));
        const matchDate = !filterDate || r.date === filterDate;
        const matchSubject = !filterSubject || r.subjectId === filterSubject;
        const matchStatus = !filterStatus || r.status === filterStatus;
        const matchDepartment = !filterDepartment || (cls && cls.department === filterDepartment);
        const matchTeacher = !filterTeacher || (subject && subject.teacherId === filterTeacher);
        return matchSearch && matchDate && matchSubject && matchStatus && matchDepartment && matchTeacher;
    }).sort((a, b) => b.date.localeCompare(a.date));

    const handleStatusChange = (recordId: string, newStatus: 'present' | 'absent' | 'late', studentName: string) => {
        updateAttendanceRecord(recordId, { status: newStatus });
        loadData();
        showToast(`${studentName}'s status changed to ${newStatus}`, 'success');
    };

    // Count by status (from filtered results to reflect current filters)
    const presentCount = filtered.filter(r => r.status === 'present').length;
    const absentCount = filtered.filter(r => r.status === 'absent').length;
    const lateCount = filtered.filter(r => r.status === 'late').length;

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
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{filtered.length}</span>
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

            {/* Filters */}
            <div className="filter-bar mb-6" style={{ gap: 10, flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ minWidth: 200 }}>
                    <Search size={18} />
                    <input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="search-bar" style={{ minWidth: 'auto', width: 170 }}>
                    <Calendar size={16} />
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)' }} />
                </div>
                <select className="form-select" style={{ width: 160 }} value={filterDepartment}
                    onChange={e => setFilterDepartment(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <select className="form-select" style={{ width: 160 }} value={filterTeacher}
                    onChange={e => setFilterTeacher(e.target.value)}>
                    <option value="">All Teachers</option>
                    {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                <select className="form-select" style={{ width: 160 }} value={filterSubject}
                    onChange={e => setFilterSubject(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <select className="form-select" style={{ width: 130 }} value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                </select>
                <span className="badge badge-purple">{filtered.length} records</span>
            </div>

            {/* Active filters display */}
            {(filterDepartment || filterTeacher) && (
                <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
                    {filterDepartment && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 12px', borderRadius: 'var(--radius-full)',
                            background: 'rgba(99, 102, 241, 0.1)', fontSize: 12, fontWeight: 600,
                            color: 'var(--accent-primary-light)'
                        }}>
                            <Building2 size={12} /> {filterDepartment}
                            <span onClick={() => setFilterDepartment('')} style={{ cursor: 'pointer', marginLeft: 4 }}>✕</span>
                        </span>
                    )}
                    {filterTeacher && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 12px', borderRadius: 'var(--radius-full)',
                            background: 'rgba(16, 185, 129, 0.1)', fontSize: 12, fontWeight: 600,
                            color: '#10b981'
                        }}>
                            <Users size={12} /> {teachers.find(t => t.id === filterTeacher)?.name || 'Teacher'}
                            <span onClick={() => setFilterTeacher('')} style={{ cursor: 'pointer', marginLeft: 4 }}>✕</span>
                        </span>
                    )}
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Roll No</th>
                            <th>Subject</th>
                            <th>Teacher</th>
                            <th>Dept</th>
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
                                <td colSpan={10} style={{ textAlign: 'center', padding: 40 }}>
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
                                const teacher = subject ? users.find(u => u.id === subject.teacherId) : null;
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
                                        <td><span className="badge badge-purple" style={{ fontSize: 11 }}>{student?.rollNo || '—'}</span></td>
                                        <td>{subject?.name || '—'}</td>
                                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{teacher?.name || '—'}</td>
                                        <td style={{ fontSize: 12 }}>{cls?.department || '—'}</td>
                                        <td>{cls?.name || '—'}</td>
                                        <td>{record.date}</td>
                                        <td>{record.time || '—'}</td>
                                        <td>
                                            {record.status === 'present' && <span className="badge badge-success">Present</span>}
                                            {record.status === 'absent' && <span className="badge badge-danger">Absent</span>}
                                            {record.status === 'late' && <span className="badge badge-warning">Late</span>}
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                {record.status !== 'present' && (
                                                    <button
                                                        style={{
                                                            padding: '2px 8px', fontSize: 10, fontWeight: 600,
                                                            background: 'rgba(16, 185, 129, 0.12)',
                                                            color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)',
                                                            borderRadius: 4, cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleStatusChange(record.id, 'present', student?.name || 'Student')}
                                                    >
                                                        Present
                                                    </button>
                                                )}
                                                {record.status !== 'absent' && (
                                                    <button
                                                        style={{
                                                            padding: '2px 8px', fontSize: 10, fontWeight: 600,
                                                            background: 'rgba(239, 68, 68, 0.12)',
                                                            color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)',
                                                            borderRadius: 4, cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleStatusChange(record.id, 'absent', student?.name || 'Student')}
                                                    >
                                                        Absent
                                                    </button>
                                                )}
                                                {record.status !== 'late' && (
                                                    <button
                                                        style={{
                                                            padding: '2px 8px', fontSize: 10, fontWeight: 600,
                                                            background: 'rgba(245, 158, 11, 0.12)',
                                                            color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)',
                                                            borderRadius: 4, cursor: 'pointer'
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
