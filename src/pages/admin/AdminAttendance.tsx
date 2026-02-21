import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import {
    getAttendance, getUsers, getSubjects, getClasses,
    AttendanceRecord, User, Subject, ClassSection
} from '../../store/data';

const AdminAttendance: React.FC = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassSection[]>([]);
    const [search, setSearch] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        setRecords(getAttendance());
        setUsers(getUsers());
        setSubjects(getSubjects());
        setClasses(getClasses());
    }, []);

    const filtered = records.filter(r => {
        const student = users.find(u => u.id === r.studentId);
        const matchSearch = !search || (student && student.name.toLowerCase().includes(search.toLowerCase()));
        const matchDate = !filterDate || r.date === filterDate;
        const matchSubject = !filterSubject || r.subjectId === filterSubject;
        const matchStatus = !filterStatus || r.status === filterStatus;
        return matchSearch && matchDate && matchSubject && matchStatus;
    }).sort((a, b) => b.date.localeCompare(a.date));

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
                <h2>Attendance Records</h2>
                <p>View and manage all attendance records across the institution</p>
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
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice(0, 100).map(record => {
                            const student = users.find(u => u.id === record.studentId);
                            const subject = subjects.find(s => s.id === record.subjectId);
                            const cls = classes.find(c => c.id === record.classId);
                            return (
                                <tr key={record.id}>
                                    <td style={{ fontWeight: 600 }}>{student?.name || '—'}</td>
                                    <td><span className="badge badge-purple">{student?.rollNo || '—'}</span></td>
                                    <td>{subject?.name || '—'}</td>
                                    <td>{cls?.name || '—'}</td>
                                    <td>{record.date}</td>
                                    <td>{record.time}</td>
                                    <td>{getStatusBadge(record.status)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAttendance;
