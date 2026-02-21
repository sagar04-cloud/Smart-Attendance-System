import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import {
    getSubjectsByTeacher, getAttendance, getUsers, getClasses,
    getAttendancePercentage,
    Subject, AttendanceRecord, User, ClassSection
} from '../../store/data';

const TeacherAttendance: React.FC = () => {
    const { user } = useAuth();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [classes, setClasses] = useState<ClassSection[]>([]);
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        if (!user) return;
        const subs = getSubjectsByTeacher(user.id);
        setSubjects(subs);
        setStudents(getUsers().filter(u => u.role === 'student'));
        setClasses(getClasses());
    }, [user]);

    useEffect(() => {
        if (selectedSubject) {
            const allRecords = getAttendance().filter(a => a.subjectId === selectedSubject);
            setRecords(allRecords);
        } else {
            setRecords([]);
        }
    }, [selectedSubject]);

    const filtered = records.filter(r => {
        if (filterDate && r.date !== filterDate) return false;
        return true;
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
                <h2>Attendance List</h2>
                <p>View attendance records for your subjects</p>
            </div>

            <div className="filter-bar mb-6">
                <select className="form-select" style={{ width: 280 }} value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}>
                    <option value="">Select Subject</option>
                    {subjects.map(sub => {
                        const cls = classes.find(c => c.id === sub.classId);
                        return (
                            <option key={sub.id} value={sub.id}>
                                {sub.name} ({sub.code}) - {cls?.name}
                            </option>
                        );
                    })}
                </select>
                <div className="search-bar" style={{ minWidth: 'auto', width: 180 }}>
                    <Calendar size={16} />
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)' }} />
                </div>
                <span className="badge badge-purple">{filtered.length} records</span>
            </div>

            {!selectedSubject ? (
                <div className="card">
                    <div className="card-body">
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>Select a Subject</h3>
                            <p>Choose a subject from the dropdown to view attendance records.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Roll No</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Overall %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                                        <div className="empty-state">
                                            <h3>No records found</h3>
                                            <p>No attendance records for the selected filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(record => {
                                    const student = students.find(u => u.id === record.studentId);
                                    const pct = student ? getAttendancePercentage(student.id, selectedSubject) : 0;
                                    return (
                                        <tr key={record.id}>
                                            <td style={{ fontWeight: 600 }}>{student?.name || '—'}</td>
                                            <td><span className="badge badge-purple">{student?.rollNo || '—'}</span></td>
                                            <td>{record.date}</td>
                                            <td>{record.time || '—'}</td>
                                            <td>{getStatusBadge(record.status)}</td>
                                            <td>
                                                <span style={{
                                                    fontWeight: 700,
                                                    color: pct >= 75 ? 'var(--green-light)' : pct >= 50 ? 'var(--yellow-light)' : 'var(--red-light)'
                                                }}>{pct}%</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;
