import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../store/data';
import { LogIn, Mail, Lock, ShieldCheck, BookOpen, GraduationCap } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('student');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            const success = login(email, password, role);
            if (success) {
                showToast(`Welcome! Logged in as ${role}`, 'success');
                navigate(`/${role}`);
            } else {
                showToast('Invalid credentials. Please try again.', 'error');
            }
            setLoading(false);
        }, 600);
    };

    const demoCredentials: Record<UserRole, { email: string; password: string }> = {
        admin: { email: 'admin@university.edu', password: 'admin123' },
        teacher: { email: 'anita@university.edu', password: 'teacher123' },
        student: { email: 'priya@student.edu', password: 'student123' },
    };

    const fillDemo = () => {
        const creds = demoCredentials[role];
        setEmail(creds.email);
        setPassword(creds.password);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-logo">
                        <div className="login-logo-icon">📋</div>
                        <h2>QR Attend</h2>
                        <p>Smart Attendance Management System</p>
                    </div>

                    <div className="role-selector">
                        <div
                            className={`role-option ${role === 'admin' ? 'selected' : ''}`}
                            onClick={() => setRole('admin')}
                        >
                            <div className="role-option-icon"><ShieldCheck size={28} /></div>
                            <div className="role-option-label">Admin</div>
                        </div>
                        <div
                            className={`role-option ${role === 'teacher' ? 'selected' : ''}`}
                            onClick={() => setRole('teacher')}
                        >
                            <div className="role-option-icon"><BookOpen size={28} /></div>
                            <div className="role-option-label">Teacher</div>
                        </div>
                        <div
                            className={`role-option ${role === 'student' ? 'selected' : ''}`}
                            onClick={() => setRole('student')}
                        >
                            <div className="role-option-icon"><GraduationCap size={28} /></div>
                            <div className="role-option-label">Student</div>
                        </div>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{
                                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ paddingLeft: 36 }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{
                                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)'
                                }} />
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingLeft: 36 }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? (
                                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Signing in...</>
                            ) : (
                                <><LogIn size={18} /> Sign In</>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <button
                            onClick={fillDemo}
                            className="btn btn-ghost btn-sm"
                            style={{ margin: '0 auto' }}
                        >
                            Fill Demo Credentials ({role})
                        </button>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                    © 2026 QR Attend — Smart Attendance Management System
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
