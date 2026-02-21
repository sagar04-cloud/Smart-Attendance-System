import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Clock, CheckCircle, Users, RefreshCw, StopCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    getSubjectsByTeacher, getClasses, getStudentsByClass,
    addSession, updateSession, addAttendanceRecord,
    generateId, Subject, ClassSection, Session, User
} from '../../store/data';

const GenerateQR: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassSection[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [attendedStudents, setAttendedStudents] = useState<string[]>([]);
    const [allStudents, setAllStudents] = useState<User[]>([]);

    useEffect(() => {
        if (!user) return;
        const subs = getSubjectsByTeacher(user.id);
        setSubjects(subs);
        setClasses(getClasses());
    }, [user]);

    // Timer countdown
    useEffect(() => {
        if (!activeSession) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((activeSession.expiresAt - now) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0) {
                endSession();
            }

            // Simulate students scanning (for demo purposes)
            if (remaining > 0 && remaining % 8 === 0 && allStudents.length > 0) {
                simulateStudentScan();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeSession, allStudents]);

    const simulateStudentScan = useCallback(() => {
        if (!activeSession) return;
        const notAttended = allStudents.filter(s => !attendedStudents.includes(s.id));
        if (notAttended.length === 0) return;

        const student = notAttended[Math.floor(Math.random() * notAttended.length)];
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        addAttendanceRecord({
            id: generateId(),
            sessionId: activeSession.id,
            studentId: student.id,
            subjectId: activeSession.subjectId,
            classId: activeSession.classId,
            date: new Date().toISOString().split('T')[0],
            time: timeStr,
            status: 'present',
        });

        setAttendedStudents(prev => [...prev, student.id]);
        showToast(`${student.name} marked present!`, 'success');
    }, [activeSession, allStudents, attendedStudents]);

    const generateSession = () => {
        if (!selectedSubject || !user) {
            showToast('Please select a subject first', 'error');
            return;
        }

        const subject = subjects.find(s => s.id === selectedSubject);
        if (!subject) return;

        const students = getStudentsByClass(subject.classId);
        setAllStudents(students);

        const sessionId = generateId();
        const now = new Date();
        const qrData = JSON.stringify({
            sessionId,
            subjectId: subject.id,
            classId: subject.classId,
            teacherId: user.id,
            timestamp: now.getTime(),
        });

        const session: Session = {
            id: sessionId,
            subjectId: subject.id,
            teacherId: user.id,
            classId: subject.classId,
            qrCode: qrData,
            date: now.toISOString().split('T')[0],
            startTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
            endTime: '',
            expiresAt: now.getTime() + 5 * 60 * 1000, // 5 minutes
            isActive: true,
        };

        addSession(session);
        setActiveSession(session);
        setTimeLeft(300);
        setAttendedStudents([]);
        showToast('QR Code generated! Session is active.', 'success');
    };

    const endSession = () => {
        if (activeSession) {
            const now = new Date();
            updateSession(activeSession.id, {
                isActive: false,
                endTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
            });

            // Mark absent students
            const notAttended = allStudents.filter(s => !attendedStudents.includes(s.id));
            notAttended.forEach(student => {
                addAttendanceRecord({
                    id: generateId(),
                    sessionId: activeSession.id,
                    studentId: student.id,
                    subjectId: activeSession.subjectId,
                    classId: activeSession.classId,
                    date: new Date().toISOString().split('T')[0],
                    time: '',
                    status: 'absent',
                });
            });

            showToast(`Session ended. ${attendedStudents.length}/${allStudents.length} students attended.`, 'info');
            setActiveSession(null);
            setTimeLeft(0);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const selectedSub = subjects.find(s => s.id === selectedSubject);
    const selectedClass = selectedSub ? classes.find(c => c.id === selectedSub.classId) : null;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Generate QR Code</h2>
                <p>Create a session and generate QR for student attendance</p>
            </div>

            {!activeSession ? (
                <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
                    <div className="card-body">
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: 'var(--radius-lg)',
                                background: 'rgba(99, 102, 241, 0.12)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                            }}>
                                <QrCode size={36} style={{ color: 'var(--accent-primary-light)' }} />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Start Attendance Session</h3>
                            <p className="text-muted text-sm">Select a subject to generate a unique QR code</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Select Subject</label>
                            <select className="form-select" value={selectedSubject}
                                onChange={e => setSelectedSubject(e.target.value)}>
                                <option value="">Choose a subject...</option>
                                {subjects.map(sub => {
                                    const cls = classes.find(c => c.id === sub.classId);
                                    return (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name} ({sub.code}) - {cls?.name || ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {selectedSub && selectedClass && (
                            <div style={{
                                padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)', marginBottom: 20
                            }}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span style={{ fontWeight: 600 }}>{selectedSub.name}</span>
                                    <span className="badge badge-info">{selectedSub.code}</span>
                                </div>
                                <div className="text-sm text-muted">
                                    Class: {selectedClass.name} • Semester {selectedSub.semester} • {selectedClass.department}
                                </div>
                            </div>
                        )}

                        <button className="btn btn-primary btn-lg w-full" onClick={generateSession}
                            style={{ justifyContent: 'center' }} disabled={!selectedSubject}>
                            <QrCode size={20} /> Generate QR Code
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ maxWidth: 700, margin: '0 auto' }}>
                    <div className="card">
                        <div className="card-body">
                            <div className="qr-display">
                                <div className="qr-code-wrapper">
                                    <QRCodeSVG
                                        value={activeSession.qrCode}
                                        size={220}
                                        level="H"
                                        includeMargin={false}
                                        fgColor="#1a1a2e"
                                        bgColor="#ffffff"
                                    />
                                </div>

                                <div className="qr-info">
                                    <h3>{selectedSub?.name}</h3>
                                    <p>{selectedClass?.name} • {selectedSub?.code} • Session Active</p>
                                </div>

                                <div className="qr-timer">
                                    <div className="timer-dot"></div>
                                    <Clock size={16} />
                                    <span>Expires in {formatTime(timeLeft)}</span>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button className="btn btn-secondary" onClick={generateSession}>
                                        <RefreshCw size={16} /> Regenerate
                                    </button>
                                    <button className="btn btn-danger" onClick={endSession}>
                                        <StopCircle size={16} /> End Session
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Real-time attendance */}
                    <div className="card mt-6">
                        <div className="card-header">
                            <h3>
                                <span className="flex items-center gap-2">
                                    <Users size={18} />
                                    Live Attendance
                                </span>
                            </h3>
                            <span className="badge badge-success">
                                {attendedStudents.length}/{allStudents.length} Present
                            </span>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            {allStudents.map((student, i) => {
                                const isPresent = attendedStudents.includes(student.id);
                                return (
                                    <div key={student.id} className="attendance-item" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <div className="attendance-avatar" style={{
                                            background: isPresent
                                                ? 'linear-gradient(135deg, #10b981, #34d399)'
                                                : 'linear-gradient(135deg, #374151, #4b5563)'
                                        }}>
                                            {isPresent ? <CheckCircle size={16} /> : student.name.charAt(0)}
                                        </div>
                                        <div className="attendance-info">
                                            <div className="attendance-name">{student.name}</div>
                                            <div className="attendance-meta">{student.rollNo}</div>
                                        </div>
                                        {isPresent
                                            ? <span className="badge badge-success">Present</span>
                                            : <span className="badge" style={{ background: 'var(--bg-glass)', color: 'var(--text-muted)' }}>Waiting...</span>
                                        }
                                    </div>
                                );
                            })}
                            {allStudents.length === 0 && (
                                <div className="empty-state">
                                    <p>No students in this class</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerateQR;
