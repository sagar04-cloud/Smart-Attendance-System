import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Trash2, Edit3, Mail, Phone, X
} from 'lucide-react';
import {
    User, getUsers, addUser, deleteUser, updateUser, getClasses,
    generateId, ClassSection
} from '../../store/data';
import { useToast } from '../../context/ToastContext';

interface ManagePageProps {
    role: 'teacher' | 'student';
}

const ManageUsers: React.FC<ManagePageProps> = ({ role }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [classes, setClasses] = useState<ClassSection[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { showToast } = useToast();

    const [form, setForm] = useState({
        name: '', email: '', password: '', department: '', phone: '',
        classId: '', semester: 1, rollNo: '',
    });

    const loadData = () => {
        const allUsers = getUsers().filter(u => u.role === role);
        setUsers(allUsers);
        setClasses(getClasses());
    };

    useEffect(() => { loadData(); }, [role]);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.rollNo && u.rollNo.toLowerCase().includes(search.toLowerCase()))
    );

    const openAdd = () => {
        setEditingUser(null);
        setForm({ name: '', email: '', password: '', department: '', phone: '', classId: '', semester: 1, rollNo: '' });
        setShowModal(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            email: user.email,
            password: user.password,
            department: user.department || '',
            phone: user.phone || '',
            classId: user.classId || '',
            semester: user.semester || 1,
            rollNo: user.rollNo || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            showToast('Please fill in required fields', 'error');
            return;
        }

        if (editingUser) {
            updateUser(editingUser.id, {
                name: form.name,
                email: form.email,
                password: form.password,
                department: form.department,
                phone: form.phone,
                ...(role === 'student' && { classId: form.classId, semester: form.semester, rollNo: form.rollNo }),
            });
            showToast(`${role === 'teacher' ? 'Teacher' : 'Student'} updated successfully`, 'success');
        } else {
            const newUser: User = {
                id: generateId(),
                name: form.name,
                email: form.email,
                password: form.password,
                role,
                department: form.department,
                phone: form.phone,
                createdAt: new Date().toISOString().split('T')[0],
                ...(role === 'student' && { classId: form.classId, semester: form.semester, rollNo: form.rollNo }),
            };
            addUser(newUser);
            showToast(`${role === 'teacher' ? 'Teacher' : 'Student'} added successfully`, 'success');
        }

        setShowModal(false);
        loadData();
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            deleteUser(id);
            showToast(`${name} deleted successfully`, 'info');
            loadData();
        }
    };

    const title = role === 'teacher' ? 'Manage Teachers' : 'Manage Students';
    const description = role === 'teacher'
        ? 'Add, edit, and manage faculty members'
        : 'Add, edit, and manage student records';

    const avatarColors = [
        'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'linear-gradient(135deg, #10b981, #34d399)',
        'linear-gradient(135deg, #f59e0b, #fbbf24)',
        'linear-gradient(135deg, #3b82f6, #60a5fa)',
        'linear-gradient(135deg, #ef4444, #f87171)',
        'linear-gradient(135deg, #06b6d4, #22d3ee)',
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h2>{title}</h2>
                        <p>{description}</p>
                    </div>
                    <button className="btn btn-primary" onClick={openAdd}>
                        <Plus size={18} /> Add {role === 'teacher' ? 'Teacher' : 'Student'}
                    </button>
                </div>
            </div>

            <div className="filter-bar mb-6">
                <div className="search-bar">
                    <Search size={18} />
                    <input
                        placeholder={`Search ${role}s...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <span className="badge badge-purple">{filtered.length} {role}s</span>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            {role === 'student' && <th>Roll No</th>}
                            <th>Department</th>
                            {role === 'student' && <th>Class</th>}
                            {role === 'student' && <th>Semester</th>}
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={role === 'student' ? 8 : 5} style={{ textAlign: 'center', padding: 40 }}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">👤</div>
                                        <h3>No {role}s found</h3>
                                        <p>Start by adding a new {role} to the system.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((user, i) => {
                                const cls = classes.find(c => c.id === user.classId);
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="attendance-avatar"
                                                    style={{ background: avatarColors[i % avatarColors.length] }}
                                                >
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{user.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-muted">
                                                <Mail size={14} /> {user.email}
                                            </div>
                                        </td>
                                        {role === 'student' && <td><span className="badge badge-purple">{user.rollNo}</span></td>}
                                        <td>{user.department || '—'}</td>
                                        {role === 'student' && <td>{cls?.name || '—'}</td>}
                                        {role === 'student' && <td>Sem {user.semester}</td>}
                                        <td>
                                            <div className="flex items-center gap-2 text-muted">
                                                <Phone size={14} /> {user.phone || '—'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button className="btn btn-ghost btn-icon" onClick={() => openEdit(user)}>
                                                    <Edit3 size={16} />
                                                </button>
                                                <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(user.id, user.name)}
                                                    style={{ color: 'var(--red-light)' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingUser ? 'Edit' : 'Add'} {role === 'teacher' ? 'Teacher' : 'Student'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input className="form-input" value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="Enter full name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email *</label>
                                        <input className="form-input" type="email" value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="Enter email" />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Password *</label>
                                        <input className="form-input" type="password" value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            placeholder="Enter password" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input className="form-input" value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            placeholder="Phone number" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select className="form-select" value={form.department}
                                        onChange={e => setForm({ ...form, department: e.target.value })}>
                                        <option value="">Select department</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Civil">Civil</option>
                                        <option value="Electrical">Electrical</option>
                                    </select>
                                </div>

                                {role === 'student' && (
                                    <>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Roll No</label>
                                                <input className="form-input" value={form.rollNo}
                                                    onChange={e => setForm({ ...form, rollNo: e.target.value })}
                                                    placeholder="e.g. CS2024001" />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Semester</label>
                                                <select className="form-select" value={form.semester}
                                                    onChange={e => setForm({ ...form, semester: Number(e.target.value) })}>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                        <option key={s} value={s}>Semester {s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Class</label>
                                            <select className="form-select" value={form.classId}
                                                onChange={e => setForm({ ...form, classId: e.target.value })}>
                                                <option value="">Select class</option>
                                                {classes.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name} - {c.department}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingUser ? 'Save Changes' : `Add ${role === 'teacher' ? 'Teacher' : 'Student'}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
