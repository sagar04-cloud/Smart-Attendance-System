import React, { useState, useEffect } from 'react';
import { Download, BarChart3, Users, BookOpen, TrendingUp, FileText } from 'lucide-react';
import {
    getUsers, getSubjects, getClasses, getAttendance,
    getAttendancePercentage, User, Subject, ClassSection
} from '../../store/data';
import { useToast } from '../../context/ToastContext';

const AdminReports: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassSection[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        setStudents(getUsers().filter(u => u.role === 'student'));
        setSubjects(getSubjects());
        setClasses(getClasses());
    }, []);

    const filteredStudents = students.filter(s => {
        if (selectedClass && s.classId !== selectedClass) return false;
        return true;
    });

    const filteredSubjects = subjects.filter(s => {
        if (selectedClass && s.classId !== selectedClass) return false;
        return true;
    });

    const exportCSV = () => {
        const headers = ['Student Name', 'Roll No', 'Class', ...filteredSubjects.map(s => s.name), 'Overall %'];
        const rows = filteredStudents.map(student => {
            const cls = classes.find(c => c.id === student.classId);
            const percentages = filteredSubjects.map(sub => getAttendancePercentage(student.id, sub.id));
            const overall = percentages.length > 0
                ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
                : 0;
            return [student.name, student.rollNo || '', cls?.name || '', ...percentages.map(p => `${p}%`), `${overall}%`];
        });

        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Report exported as CSV', 'success');
    };

    const getPercentageColor = (pct: number) => {
        if (pct >= 75) return 'var(--green-light)';
        if (pct >= 50) return 'var(--yellow-light)';
        return 'var(--red-light)';
    };

    const getProgressClass = (pct: number) => {
        if (pct >= 75) return 'green';
        if (pct >= 50) return 'yellow';
        return 'red';
    };

    const attendance = getAttendance();
    const totalSessions = new Set(attendance.map(a => a.sessionId)).size;
    const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const overallPercentage = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h2>Attendance Reports</h2>
                        <p>View and export institution-wide attendance statistics</p>
                    </div>
                    <button className="btn btn-primary" onClick={exportCSV}>
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon purple"><BarChart3 size={20} /></div>
                    </div>
                    <div className="stat-card-value">{overallPercentage}%</div>
                    <div className="stat-card-label">Overall Attendance Rate</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon green"><Users size={20} /></div>
                    </div>
                    <div className="stat-card-value">{students.length}</div>
                    <div className="stat-card-label">Total Students</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon blue"><BookOpen size={20} /></div>
                    </div>
                    <div className="stat-card-value">{totalSessions}</div>
                    <div className="stat-card-label">Total Sessions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon yellow"><FileText size={20} /></div>
                    </div>
                    <div className="stat-card-value">{attendance.length}</div>
                    <div className="stat-card-label">Total Records</div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar mb-6">
                <select className="form-select" style={{ width: 200 }} value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}>
                    <option value="">All Classes</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} - {c.department}</option>
                    ))}
                </select>
            </div>

            {/* Detailed Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Roll No</th>
                            <th>Class</th>
                            {filteredSubjects.map(sub => (
                                <th key={sub.id}>{sub.code}</th>
                            ))}
                            <th>Overall</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => {
                            const cls = classes.find(c => c.id === student.classId);
                            const percentages = filteredSubjects.map(sub => getAttendancePercentage(student.id, sub.id));
                            const overall = percentages.length > 0
                                ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
                                : 0;

                            return (
                                <tr key={student.id}>
                                    <td style={{ fontWeight: 600 }}>{student.name}</td>
                                    <td><span className="badge badge-purple">{student.rollNo}</span></td>
                                    <td>{cls?.name || '—'}</td>
                                    {percentages.map((pct, i) => (
                                        <td key={i}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className="progress-bar" style={{ width: 60, height: 6 }}>
                                                    <div
                                                        className={`progress-bar-fill ${getProgressClass(pct)}`}
                                                        style={{ width: `${pct}%` }}
                                                    ></div>
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: getPercentageColor(pct) }}>{pct}%</span>
                                            </div>
                                        </td>
                                    ))}
                                    <td>
                                        <span style={{
                                            fontWeight: 800,
                                            fontSize: 16,
                                            color: getPercentageColor(overall),
                                        }}>{overall}%</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminReports;
