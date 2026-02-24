import React, { useState } from 'react';
import { ScanLine, CheckCircle, XCircle, Camera, RefreshCw, AlertTriangle } from 'lucide-react';
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

        // Attempt to use the device camera through html5-qrcode or similar
        // For now we show the scanner UI and require manual code entry
        // In production, integrate with a real QR scanner library (e.g., html5-qrcode)
    };

    const processQRData = (qrDataString: string) => {
        if (!user) return;

        try {
            const qrData = JSON.parse(qrDataString);
            const { sessionId, subjectId, classId } = qrData;

            if (!sessionId || !subjectId || !classId) {
                setResult('error');
                setResultMessage('Invalid QR code data. Missing required fields.');
                setScanning(false);
                return;
            }

            // Validate that this session actually exists and is still active
            const sessions = getSessions();
            const session = sessions.find(s => s.id === sessionId);

            if (!session) {
                setResult('error');
                setResultMessage('Session not found. The QR code may be invalid.');
                setScanning(false);
                return;
            }

            if (!session.isActive) {
                setResult('error');
                setResultMessage('This session has ended. Please contact your teacher.');
                setScanning(false);
                return;
            }

            if (session.expiresAt <= Date.now()) {
                setResult('error');
                setResultMessage('This QR code has expired. Ask your teacher to generate a new one.');
                setScanning(false);
                return;
            }

            // Check if student's class matches the session class
            if (user.classId && user.classId !== classId) {
                setResult('error');
                setResultMessage('This QR code is for a different class. Please check with your teacher.');
                setScanning(false);
                return;
            }

            const subject = getSubjectById(subjectId);
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            addAttendanceRecord({
                id: generateId(),
                sessionId: session.id,
                studentId: user.id,
                subjectId: session.subjectId,
                classId: session.classId,
                date: now.toISOString().split('T')[0],
                time: timeStr,
                status: 'present',
            });

            setResult('success');
            setResultMessage(`Attendance marked for ${subject?.name || 'Unknown Subject'}!`);
            showToast('Attendance marked successfully!', 'success');
            setScanning(false);
        } catch {
            setResult('error');
            setResultMessage('Invalid QR code. Could not read the data. Please try again or use session code.');
            setScanning(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode.trim()) {
            showToast('Please enter a session code', 'error');
            return;
        }

        // Validate the manual session code against actual sessions
        const sessions = getSessions();
        const session = sessions.find(s => s.id === manualCode.trim());

        if (!session) {
            setResult('error');
            setResultMessage('Invalid session code. Please check the code and try again.');
            showToast('Invalid session code', 'error');
            setManualCode('');
            return;
        }

        if (!session.isActive) {
            setResult('error');
            setResultMessage('This session has already ended.');
            showToast('Session has ended', 'error');
            setManualCode('');
            return;
        }

        if (session.expiresAt <= Date.now()) {
            setResult('error');
            setResultMessage('This session has expired. Ask your teacher for a new QR code.');
            showToast('Session expired', 'error');
            setManualCode('');
            return;
        }

        // Process via the same QR data handler
        processQRData(session.qrCode);
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
                                            <input className="form-input" placeholder="Enter the session ID shared by teacher"
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
                                            <Camera size={32} style={{ color: 'var(--accent-primary-light)', opacity: 0.6 }} />
                                            <p className="text-sm text-muted">Camera preview area</p>
                                            <p className="text-sm" style={{ color: 'var(--yellow-light)', fontSize: 12 }}>
                                                📷 Camera integration requires HTTPS
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'var(--yellow-bg)', border: '1px solid rgba(245, 158, 11, 0.2)',
                                        borderRadius: 'var(--radius-md)', padding: '14px 18px',
                                        display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%', maxWidth: 360
                                    }}>
                                        <AlertTriangle size={18} style={{ color: 'var(--yellow-light)', flexShrink: 0, marginTop: 2 }} />
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--yellow-light)', marginBottom: 4 }}>
                                                Use Session Code Instead
                                            </p>
                                            <p className="text-sm text-muted">
                                                Camera scanning requires a secure (HTTPS) connection. Please use the session code method below or ask your teacher for the code.
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ width: '100%', maxWidth: 360 }}>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            if (manualCode.trim()) {
                                                handleManualSubmit(e);
                                            }
                                        }}>
                                            <div className="form-group">
                                                <label className="form-label">Enter Session Code</label>
                                                <input className="form-input" placeholder="Paste the session ID here"
                                                    value={manualCode} onChange={e => setManualCode(e.target.value)} />
                                            </div>
                                            <div className="flex gap-3">
                                                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
                                                    onClick={() => { setScanning(false); setManualCode(''); }}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                                                    disabled={!manualCode.trim()}>
                                                    Submit Code
                                                </button>
                                            </div>
                                        </form>
                                    </div>
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
                                <RefreshCw size={16} /> Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanQR;
