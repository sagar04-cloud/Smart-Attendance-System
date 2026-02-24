import React, { useState, useEffect } from 'react';
import { Download, BarChart3, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    getSubjectsByTeacher, getClasses, getStudentsByClass,
    getAttendancePercentage, getAttendanceBySubject,
    Subject, ClassSection
} from '../../store/data';

const TeacherReports: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [classes, setClasses] = useState<ClassSection[]>([]);

    useEffect(() => {
        if (!user) return;
        setSubjects(getSubjectsByTeacher(user.id));
        setClasses(getClasses());
    }, [user]);

    const selectedSub = subjects.find(s => s.id === selectedSubject);
    const students = selectedSub ? getStudentsByClass(selectedSub.classId) : [];

    // Get all attendance records for this subject to find unique session dates
    const subjectAttendance = selectedSub ? getAttendanceBySubject(selectedSub.id) : [];

    // Extract unique dates, sort chronologically
    const uniqueDates = Array.from(new Set(subjectAttendance.map(a => a.date))).sort();

    const studentData = students.map(student => {
        // Find attendance status for each date
        const dateStatuses: Record<string, string> = {};
        uniqueDates.forEach(date => {
            const record = subjectAttendance.find(a => a.studentId === student.id && a.date === date);
            dateStatuses[date] = record ? record.status : '-'; // '-' means no record (e.g. absent/not enrolled)
        });

        return {
            student,
            percentage: getAttendancePercentage(student.id, selectedSubject),
            dateStatuses
        };
    }).sort((a, b) => b.percentage - a.percentage);

    const avgPercentage = studentData.length > 0
        ? Math.round(studentData.reduce((acc, s) => acc + s.percentage, 0) / studentData.length)
        : 0;

    const above75 = studentData.filter(s => s.percentage >= 75).length;
    const below75 = studentData.filter(s => s.percentage < 75 && s.percentage > 0).length;

    const exportCSV = () => {
        if (!selectedSub) return;

        // Headers: Student, Roll No, [Date 1], [Date 2], ..., Overall %, Status
        const headers = [
            'Student Name',
            'Roll No',
            ...uniqueDates.map(d => {
                // Short date format e.g. "Feb 24"
                const dateObj = new Date(d);
                return `${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getDate()}`;
            }),
            'Overall %',
            'Status'
        ];

        const rows = studentData.map(({ student, percentage, dateStatuses }) => {
            const statuses = uniqueDates.map(date => {
                const s = dateStatuses[date];
                if (s === 'present') return 'P';
                if (s === 'absent') return 'A';
                if (s === 'late') return 'L';
                return '-';
            });

            return [
                student.name,
                student.rollNo || '',
                ...statuses,
                `${percentage}%`,
                percentage >= 75 ? 'Good' : percentage >= 50 ? 'Warning' : 'Critical',
            ];
        });

        const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedSub.code}_attendance_split_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Report exported!', 'success');
    };

    const getColor = (pct: number) => {
        if (pct >= 75) return 'var(--green-light)';
        if (pct >= 50) return 'var(--yellow-light)';
        return 'var(--red-light)';
    };

    const renderStatusIcon = (status: string) => {
        if (status === 'present') return <Check size={16} strokeWidth={3} style={{ color: 'var(--green-light)' }} />;
        if (status === 'absent') return <X size={16} strokeWidth={3} style={{ color: 'var(--red-light)' }} />;
        if (status === 'late') return <Clock size={16} strokeWidth={3} style={{ color: 'var(--yellow-light)' }} />;
        return <span style={{ color: 'var(--text-muted)' }}>-</span>;
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h2>Day-by-Day Reports</h2>
                        <p>Generate and export detailed split attendance reports for your subjects</p>
                    </div>
                    {selectedSubject && (
                        <button className="btn btn-primary" onClick={exportCSV}>
                            <Download size={18} /> Export CSV
                        </button>
                    )}
                </div>
            </div>

            <div className="filter-bar mb-6">
                <select className="form-select" style={{ width: 320 }} value={selectedSubject}
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
            </div>

            {!selectedSubject ? (
                <div className="card">
                    <div className="card-body">
                        <div className="empty-state">
                            <div className="empty-state-icon"><BarChart3 size={48} /></div>
                            <h3>Select a Subject</h3>
                            <p>Choose a subject to generate its detailed attendance report.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Summary */}
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                        <div className="stat-card">
                            <div className="stat-card-value" style={{ color: getColor(avgPercentage) }}>{avgPercentage}%</div>
                            <div className="stat-card-label">Average Attendance</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value" style={{ color: 'var(--green-light)' }}>{above75}</div>
                            <div className="stat-card-label">Above 75%</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-value" style={{ color: 'var(--red-light)' }}>{below75}</div>
                            <div className="stat-card-label">Below 75%</div>
                        </div>
                    </div>

                    {/* Student-wise Split Report */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th style={{ minWidth: 150 }}>Student</th>
                                    <th>Roll No</th>
                                    {/* Dynamically render columns for each date */}
                                    {uniqueDates.map(dateStr => {
                                        const d = new Date(dateStr);
                                        return (
                                            <th key={dateStr} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                {d.toLocaleString('default', { month: 'short' })}<br />
                                                {d.getDate()}
                                            </th>
                                        );
                                    })}
                                    {uniqueDates.length === 0 && <th>No Sessions Yet</th>}
                                    <th style={{ minWidth: 100 }}>Overall %</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentData.map(({ student, percentage, dateStatuses }, i) => (
                                    <tr key={student.id}>
                                        <td>{i + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{student.name}</td>
                                        <td><span className="badge badge-purple">{student.rollNo}</span></td>

                                        {/* Render status cells for each date */}
                                        {uniqueDates.map(date => (
                                            <td key={date} style={{ textAlign: 'center' }}>
                                                {renderStatusIcon(dateStatuses[date])}
                                            </td>
                                        ))}
                                        {uniqueDates.length === 0 && <td style={{ color: 'var(--text-muted)' }}>-</td>}

                                        <td>
                                            <span style={{ fontWeight: 700, color: getColor(percentage) }}>{percentage}%</span>
                                        </td>
                                        <td>
                                            {percentage >= 75
                                                ? <span className="badge badge-success">Good</span>
                                                : percentage >= 50
                                                    ? <span className="badge badge-warning">Warning</span>
                                                    : <span className="badge badge-danger">Critical</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default TeacherReports;

