import React, { useState, useEffect } from 'react';
import { ShieldAlert, Camera, Smartphone, Trash2, RefreshCw, AlertTriangle, Users, Eye } from 'lucide-react';
import {
    getProxyLogs, clearProxyLog,
    ProxyLog
} from '../../store/data';
import { useToast } from '../../context/ToastContext';

const ProxyAlerts: React.FC = () => {
    const { showToast } = useToast();
    const [logs, setLogs] = useState<ProxyLog[]>([]);
    const [filterType, setFilterType] = useState<string>('');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    const loadData = () => {
        setLogs(getProxyLogs().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };

    useEffect(() => { loadData(); }, []);

    const filteredLogs = logs.filter(l => !filterType || l.type === filterType);

    const screenshotLogs = logs.filter(l => l.type === 'screenshot_detected');
    const sameDeviceLogs = logs.filter(l => l.type === 'same_device');

    const handleDelete = (logId: string) => {
        clearProxyLog(logId);
        loadData();
        showToast('Log entry removed', 'info');
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to clear all proxy logs?')) {
            logs.forEach(l => clearProxyLog(l.id));
            loadData();
            showToast('All proxy logs cleared', 'info');
        }
    };

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

    // Get unique students involved in proxy attempts
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
                        <p>Monitor and review all proxy attendance attempts — screenshots, same-device usage, and suspicious activity</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn btn-secondary" onClick={loadData}>
                            <RefreshCw size={16} /> Refresh
                        </button>
                        {logs.length > 0 && (
                            <button className="btn btn-danger" onClick={handleClearAll}>
                                <Trash2 size={16} /> Clear All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="flex gap-4 mb-6" style={{ flexWrap: 'wrap' }}>
                <div onClick={() => setFilterType('')}
                    style={{
                        flex: '1 1 200px', padding: '20px', borderRadius: 'var(--radius-lg)',
                        background: !filterType ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-glass)',
                        border: `1px solid ${!filterType ? 'rgba(99, 102, 241, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'rgba(99, 102, 241, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <ShieldAlert size={20} style={{ color: '#6366f1' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{logs.length}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Alerts</div>
                        </div>
                    </div>
                </div>

                <div onClick={() => setFilterType('screenshot_detected')}
                    style={{
                        flex: '1 1 200px', padding: '20px', borderRadius: 'var(--radius-lg)',
                        background: filterType === 'screenshot_detected' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-glass)',
                        border: `1px solid ${filterType === 'screenshot_detected' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'rgba(239, 68, 68, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Camera size={20} style={{ color: '#ef4444' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, color: '#ef4444' }}>{screenshotLogs.length}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Screenshot Attempts</div>
                        </div>
                    </div>
                </div>

                <div onClick={() => setFilterType('same_device')}
                    style={{
                        flex: '1 1 200px', padding: '20px', borderRadius: 'var(--radius-lg)',
                        background: filterType === 'same_device' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-glass)',
                        border: `1px solid ${filterType === 'same_device' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'rgba(245, 158, 11, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Smartphone size={20} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, color: '#f59e0b' }}>{sameDeviceLogs.length}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Same Device Proxy</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Repeat Offenders Section */}
            {proxyStudents.size > 0 && (
                <div className="card mb-6">
                    <div className="card-header">
                        <h3>
                            <span className="flex items-center gap-2">
                                <Users size={18} /> Students Involved in Proxy Attempts
                            </span>
                        </h3>
                        <span className="badge badge-danger">{proxyStudents.size} students</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>📸 Screenshot Attempts</th>
                                    <th>📱 Same Device Proxy</th>
                                    <th>Total Violations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(proxyStudents.entries()).map(([studentId, data]) => (
                                    <tr key={studentId}>
                                        <td style={{ fontWeight: 600 }}>{data.name}</td>
                                        <td>
                                            {data.screenshotCount > 0 ? (
                                                <span className="badge badge-danger">{data.screenshotCount} attempt{data.screenshotCount > 1 ? 's' : ''}</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>None</span>
                                            )}
                                        </td>
                                        <td>
                                            {data.sameDeviceCount > 0 ? (
                                                <span className="badge badge-warning">{data.sameDeviceCount} attempt{data.sameDeviceCount > 1 ? 's' : ''}</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>None</span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                fontWeight: 700,
                                                color: (data.screenshotCount + data.sameDeviceCount) >= 3 ? '#ef4444' : '#f59e0b'
                                            }}>
                                                {data.screenshotCount + data.sameDeviceCount} violation{(data.screenshotCount + data.sameDeviceCount) > 1 ? 's' : ''}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detailed Log Timeline */}
            <div className="card">
                <div className="card-header">
                    <h3>
                        <span className="flex items-center gap-2">
                            <Eye size={18} /> Detailed Proxy Log
                        </span>
                    </h3>
                    <span className="badge badge-purple">{filteredLogs.length} entries</span>
                </div>
                <div className="card-body" style={{ padding: filteredLogs.length === 0 ? 40 : 0 }}>
                    {filteredLogs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🛡️</div>
                            <h3>No Proxy Attempts Detected</h3>
                            <p>
                                {logs.length === 0
                                    ? 'Great news! No proxy attendance attempts have been detected yet. The anti-proxy system is active and monitoring all QR scans.'
                                    : 'No entries match the current filter.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div>
                            {filteredLogs.map((log, index) => (
                                <div key={log.id} style={{
                                    padding: '16px 20px',
                                    borderBottom: index < filteredLogs.length - 1 ? '1px solid var(--border)' : 'none',
                                    transition: 'background 0.2s',
                                    cursor: 'pointer',
                                }}
                                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                >
                                    <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
                                        {/* Type Icon */}
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 10,
                                            ...getTypeBadgeStyle(log.type),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {getTypeIcon(log.type)}
                                        </div>

                                        {/* Main Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 700, fontSize: 14 }}>{log.studentName}</span>
                                                <span style={{
                                                    fontSize: 10, fontWeight: 600, padding: '2px 8px',
                                                    borderRadius: 4, ...getTypeBadgeStyle(log.type)
                                                }}>
                                                    {getTypeLabel(log.type)}
                                                </span>
                                                {log.proxyForStudentName && (
                                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                        → shared device with <strong style={{ color: '#f59e0b' }}>{log.proxyForStudentName}</strong>
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                                {log.subjectName || 'Unknown Subject'} • {formatTime(log.timestamp)}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}
                                            title="Remove log entry"
                                            style={{ padding: 6, color: 'var(--text-muted)' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedLog === log.id && (
                                        <div style={{
                                            marginTop: 8, padding: '12px 16px',
                                            background: 'var(--bg-glass)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border)',
                                            fontSize: 13, lineHeight: 1.6,
                                            color: 'var(--text-secondary)',
                                            animation: 'fadeInScale 0.2s ease both'
                                        }}>
                                            <div style={{ marginBottom: 8 }}>
                                                <strong>📝 Details:</strong><br />
                                                {log.details}
                                            </div>

                                            {log.type === 'same_device' && log.proxyForStudentName && (
                                                <div style={{
                                                    marginTop: 8, padding: '10px 14px',
                                                    background: 'rgba(245, 158, 11, 0.08)',
                                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                                    borderRadius: 8, fontSize: 12
                                                }}>
                                                    <strong style={{ color: '#f59e0b' }}>🔗 Proxy Relationship:</strong><br />
                                                    <span style={{ fontWeight: 600 }}>{log.studentName}</span> ↔ <span style={{ fontWeight: 600 }}>{log.proxyForStudentName}</span><br />
                                                    <span style={{ color: 'var(--text-muted)' }}>
                                                        These two students used the same device. One likely marked proxy attendance for the other.
                                                    </span>
                                                </div>
                                            )}

                                            {log.type === 'screenshot_detected' && (
                                                <div style={{
                                                    marginTop: 8, padding: '10px 14px',
                                                    background: 'rgba(239, 68, 68, 0.08)',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    borderRadius: 8, fontSize: 12
                                                }}>
                                                    <strong style={{ color: '#ef4444' }}>📸 Screenshot Detection:</strong><br />
                                                    <span style={{ fontWeight: 600 }}>{log.studentName}</span> scanned a QR code that had already expired.<br />
                                                    <span style={{ color: 'var(--text-muted)' }}>
                                                        Since QR codes rotate every 5 seconds, this means the student was NOT looking at the live screen.
                                                        They likely received a screenshot or photo from someone else.
                                                    </span>
                                                </div>
                                            )}

                                            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                                                Session ID: <code style={{ background: 'var(--bg-input)', padding: '1px 4px', borderRadius: 3 }}>{log.sessionId}</code>
                                                {log.deviceId && (
                                                    <> • Device: <code style={{ background: 'var(--bg-input)', padding: '1px 4px', borderRadius: 3 }}>{log.deviceId.substring(0, 20)}...</code></>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProxyAlerts;
