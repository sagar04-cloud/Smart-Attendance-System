import React, { useState, useEffect } from 'react';
import { ShieldAlert, Camera, Smartphone, RefreshCw, AlertTriangle, Users, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getProxyLogs, getSubjectsByTeacher,
    ProxyLog
} from '../../store/data';

const TeacherProxyAlerts: React.FC = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<ProxyLog[]>([]);
    const [filterType, setFilterType] = useState<string>('');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    const loadData = () => {
        if (!user) return;
        const subs = getSubjectsByTeacher(user.id);
        const subjectIds = subs.map(s => s.id);
        // Only show logs for THIS teacher's subjects
        const allLogs = getProxyLogs()
            .filter(l => subjectIds.includes(l.subjectId))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(allLogs);
    };

    useEffect(() => { loadData(); }, [user]);

    const filteredLogs = logs.filter(l => !filterType || l.type === filterType);

    const screenshotLogs = logs.filter(l => l.type === 'screenshot_detected');
    const sameDeviceLogs = logs.filter(l => l.type === 'same_device');

    const formatTime = (timestamp: string) => {
        const d = new Date(timestamp);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'screenshot_detected': return <Camera size={18} />;
            case 'same_device': return <Smartphone size={18} />;
            default: return <AlertTriangle size={18} />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'screenshot_detected': return 'Screenshot / Expired QR';
            case 'same_device': return 'Same Device Proxy';
            default: return type;
        }
    };

    const getTypeBadgeStyle = (type: string) => {
        switch (type) {
            case 'screenshot_detected':
                return { background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' };
            case 'same_device':
                return { background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)' };
            default:
                return { background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.25)' };
        }
    };

    // Students involved
    const proxyStudents = new Map<string, { name: string; screenshotCount: number; sameDeviceCount: number }>();
    logs.forEach(l => {
        if (!proxyStudents.has(l.studentId)) {
            proxyStudents.set(l.studentId, { name: l.studentName, screenshotCount: 0, sameDeviceCount: 0 });
        }
        const entry = proxyStudents.get(l.studentId)!;
        if (l.type === 'screenshot_detected') entry.screenshotCount++;
        else if (l.type === 'same_device') entry.sameDeviceCount++;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h2>🛡️ Proxy Alerts</h2>
                        <p>Proxy attempts detected in your subjects</p>
                    </div>
                    <button className="btn btn-secondary" onClick={loadData}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
                <div onClick={() => setFilterType('')}
                    style={{
                        flex: '1 1 180px', padding: '16px', borderRadius: 'var(--radius-lg)',
                        background: !filterType ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-glass)',
                        border: `1px solid ${!filterType ? 'rgba(99, 102, 241, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={20} style={{ color: '#6366f1' }} />
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800 }}>{logs.length}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Alerts</div>
                        </div>
                    </div>
                </div>
                <div onClick={() => setFilterType('screenshot_detected')}
                    style={{
                        flex: '1 1 180px', padding: '16px', borderRadius: 'var(--radius-lg)',
                        background: filterType === 'screenshot_detected' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-glass)',
                        border: `1px solid ${filterType === 'screenshot_detected' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    <div className="flex items-center gap-3">
                        <Camera size={20} style={{ color: '#ef4444' }} />
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{screenshotLogs.length}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Screenshots</div>
                        </div>
                    </div>
                </div>
                <div onClick={() => setFilterType('same_device')}
                    style={{
                        flex: '1 1 180px', padding: '16px', borderRadius: 'var(--radius-lg)',
                        background: filterType === 'same_device' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-glass)',
                        border: `1px solid ${filterType === 'same_device' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    <div className="flex items-center gap-3">
                        <Smartphone size={20} style={{ color: '#f59e0b' }} />
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{sameDeviceLogs.length}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Same Device</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Students involved */}
            {proxyStudents.size > 0 && (
                <div className="card mb-6">
                    <div className="card-header">
                        <h3><span className="flex items-center gap-2"><Users size={18} /> Students Involved</span></h3>
                        <span className="badge badge-danger">{proxyStudents.size} students</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>📸 Screenshots</th>
                                    <th>📱 Same Device</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(proxyStudents.entries()).map(([id, data]) => (
                                    <tr key={id}>
                                        <td style={{ fontWeight: 600 }}>{data.name}</td>
                                        <td>
                                            {data.screenshotCount > 0
                                                ? <span className="badge badge-danger">{data.screenshotCount}</span>
                                                : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                        </td>
                                        <td>
                                            {data.sameDeviceCount > 0
                                                ? <span className="badge badge-warning">{data.sameDeviceCount}</span>
                                                : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                        </td>
                                        <td>
                                            <strong style={{ color: (data.screenshotCount + data.sameDeviceCount) >= 3 ? '#ef4444' : '#f59e0b' }}>
                                                {data.screenshotCount + data.sameDeviceCount}
                                            </strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detailed log */}
            <div className="card">
                <div className="card-header">
                    <h3><span className="flex items-center gap-2"><Eye size={18} /> Detailed Log</span></h3>
                    <span className="badge badge-purple">{filteredLogs.length} entries</span>
                </div>
                <div className="card-body" style={{ padding: filteredLogs.length === 0 ? 40 : 0 }}>
                    {filteredLogs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🛡️</div>
                            <h3>No Proxy Attempts</h3>
                            <p>No proxy attempts detected for your subjects yet. The anti-proxy system is monitoring all QR scans.</p>
                        </div>
                    ) : (
                        filteredLogs.map((log, i) => (
                            <div key={log.id} style={{
                                padding: '14px 18px',
                                borderBottom: i < filteredLogs.length - 1 ? '1px solid var(--border)' : 'none',
                                cursor: 'pointer',
                            }} onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                                <div className="flex items-center gap-3">
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 8,
                                        ...getTypeBadgeStyle(log.type),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        {getTypeIcon(log.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 700, fontSize: 13 }}>{log.studentName}</span>
                                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, ...getTypeBadgeStyle(log.type) }}>
                                                {getTypeLabel(log.type)}
                                            </span>
                                            {log.proxyForStudentName && (
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                    → with <strong style={{ color: '#f59e0b' }}>{log.proxyForStudentName}</strong>
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                            {log.subjectName} • {formatTime(log.timestamp)}
                                        </div>
                                    </div>
                                </div>

                                {expandedLog === log.id && (
                                    <div style={{
                                        marginTop: 10, padding: '12px 14px',
                                        background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)', fontSize: 12, lineHeight: 1.6,
                                        color: 'var(--text-secondary)'
                                    }}>
                                        <strong>📝 Details:</strong><br />{log.details}
                                        {log.type === 'same_device' && log.proxyForStudentName && (
                                            <div style={{
                                                marginTop: 8, padding: '8px 12px',
                                                background: 'rgba(245, 158, 11, 0.08)',
                                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                                borderRadius: 6, fontSize: 12
                                            }}>
                                                <strong style={{ color: '#f59e0b' }}>🔗 Proxy Relationship:</strong><br />
                                                <strong>{log.studentName}</strong> ↔ <strong>{log.proxyForStudentName}</strong><br />
                                                <span style={{ color: 'var(--text-muted)' }}>Same device used by both students.</span>
                                            </div>
                                        )}
                                        {log.type === 'screenshot_detected' && (
                                            <div style={{
                                                marginTop: 8, padding: '8px 12px',
                                                background: 'rgba(239, 68, 68, 0.08)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: 6, fontSize: 12
                                            }}>
                                                <strong style={{ color: '#ef4444' }}>📸 Screenshot:</strong><br />
                                                <strong>{log.studentName}</strong> scanned an expired QR — likely from a screenshot.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherProxyAlerts;
