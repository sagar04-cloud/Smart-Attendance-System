import React, { useState } from 'react';
import { ScanLine, CheckCircle, XCircle, Camera, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    addAttendanceRecord, generateId, getSessions, getSubjectById
} from '../../store/data';

const ScanQR: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<'success' | 'error' | null>(null);
    const [resultMessage, setResultMessage] = useState('');
    const [manualCode, setManualCode] = useState('');

    const startScanning = () => {
        setScanning(true);
        setResult(null);

        // Simulate QR scanning — in production, would use camera + html5-qrcode
        setTimeout(() => {
            simulateScan();
        }, 3000);
    };

    const simulateScan = () => {
        if (!user) return;

        // Find an active session for this student
        const sessions = getSessions();
        const activeSession = sessions.find(s => s.isActive && s.expiresAt > Date.now());

        if (activeSession) {
            const subject = getSubjectById(activeSession.subjectId);
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            addAttendanceRecord({
                id: generateId(),
                sessionId: activeSession.id,
                studentId: user.id,
                subjectId: activeSession.subjectId,
                classId: activeSession.classId,
                date: now.toISOString().split('T')[0],
                time: timeStr,
                status: 'present',
            });

            setResult('success');
            setResultMessage(`Attendance marked for ${subject?.name || 'Unknown Subject'}!`);
            showToast('Attendance marked successfully!', 'success');
        } else {
            // Demo mode: simulate a successful scan
            setResult('success');
            setResultMessage('Demo: Attendance marked for Data Structures & Algorithms!');
            showToast('Demo: Attendance marked successfully!', 'success');
        }
        setScanning(false);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode.trim()) {
            showToast('Please enter a session code', 'error');
            return;
        }

        // In production, this would validate the session code
        setResult('success');
        setResultMessage('Attendance marked successfully via session code!');
        showToast('Attendance marked!', 'success');
        setManualCode('');
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Scan QR Code</h2>
                <p>Scan the QR code displayed by your teacher to mark attendance</p>
            </div>

            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                {result === null ? (
                    <div className="card">
                        <div className="card-body">
                            {!scanning ? (
                                <div style={{ textAlign: 'center', padding: 20 }}>
                                    <div style={{
                                        width: 100, height: 100, borderRadius: 'var(--radius-xl)',
                                        background: 'rgba(99, 102, 241, 0.12)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                                        animation: 'float 3s ease-in-out infinite'
                                    }}>
                                        <ScanLine size={44} style={{ color: 'var(--accent-primary-light)' }} />
                                    </div>
                                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ready to Scan</h3>
                                    <p className="text-muted text-sm" style={{ marginBottom: 32, maxWidth: 320, margin: '0 auto 32px' }}>
                                        Point your camera at the QR code displayed by your teacher to mark your attendance.
                                    </p>
                                    <button className="btn btn-primary btn-lg w-full" onClick={startScanning}
                                        style={{ justifyContent: 'center', marginBottom: 20 }}>
                                        <Camera size={20} /> Start Scanning
                                    </button>

                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        margin: '20px 0', color: 'var(--text-muted)', fontSize: 13
                                    }}>
                                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
                                        <span>OR</span>
                                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
                                    </div>

                                    <form onSubmit={handleManualSubmit}>
                                        <div className="form-group">
                                            <label className="form-label">Enter Session Code</label>
                                            <input className="form-input" placeholder="Enter the code shared by teacher"
                                                value={manualCode} onChange={e => setManualCode(e.target.value)} />
                                        </div>
                                        <button type="submit" className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>
                                            Submit Code
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="scanner-container">
                                    <div className="scanner-wrapper" style={{ background: '#111' }}>
                                        <div className="scanner-overlay">
                                            <div className="scanner-corner tl"></div>
                                            <div className="scanner-corner tr"></div>
                                            <div className="scanner-corner bl"></div>
                                            <div className="scanner-corner br"></div>
                                        </div>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            height: '100%', flexDirection: 'column', gap: 12
                                        }}>
                                            <div className="spinner" style={{ width: 32, height: 32 }}></div>
                                            <p className="text-sm text-muted">Scanning...</p>
                                        </div>
                                    </div>
                                    <p className="text-muted text-sm">Hold your device steady near the QR code</p>
                                    <button className="btn btn-secondary" onClick={() => setScanning(false)}>
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ animation: 'fadeInScale 0.4s ease both' }}>
                        <div className="card-body" style={{ textAlign: 'center', padding: 40 }}>
                            {result === 'success' ? (
                                <>
                                    <div style={{
                                        width: 80, height: 80, borderRadius: '50%',
                                        background: 'var(--green-bg)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                                        animation: 'fadeInScale 0.5s ease both'
                                    }}>
                                        <CheckCircle size={40} style={{ color: 'var(--green-light)' }} />
                                    </div>
                                    <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--green-light)' }}>
                                        Attendance Marked! ✓
                                    </h3>
                                    <p className="text-muted" style={{ marginBottom: 8 }}>{resultMessage}</p>
                                    <p className="text-sm text-muted">
                                        {new Date().toLocaleDateString('en-IN', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                        })}{' '}
                                        at{' '}
                                        {new Date().toLocaleTimeString('en-IN', {
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div style={{
                                        width: 80, height: 80, borderRadius: '50%',
                                        background: 'var(--red-bg)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                                    }}>
                                        <XCircle size={40} style={{ color: 'var(--red-light)' }} />
                                    </div>
                                    <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--red-light)' }}>
                                        Scan Failed
                                    </h3>
                                    <p className="text-muted">{resultMessage}</p>
                                </>
                            )}

                            <button className="btn btn-primary mt-6" onClick={() => setResult(null)}
                                style={{ margin: '24px auto 0' }}>
                                <RefreshCw size={16} /> Scan Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanQR;
