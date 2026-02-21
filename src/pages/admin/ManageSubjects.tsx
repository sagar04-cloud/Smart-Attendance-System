import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, X, BookOpen } from 'lucide-react';
import {
    Subject, getSubjects, getClasses, getUsers, addSubject, deleteSubject,
    generateId, ClassSection, User
} from '../../store/data';
import { useToast } from '../../context/ToastContext';

const ManageSubjects: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassSection[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();

    const [form, setForm] = useState({
        name: '', code: '', classId: '', teacherId: '', semester: 1,
    });

    const loadData = () => {
        setSubjects(getSubjects());
        setClasses(getClasses());
        setTeachers(getUsers().filter(u => u.role === 'teacher'));
    };

    useEffect(() => { loadData(); }, []);

    const filtered = subjects.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.code || !form.classId || !form.teacherId) {
            showToast('Please fill all required fields', 'error');
            return;
        }
        addSubject({
            id: generateId(),
            name: form.name,
            code: form.code,
            classId: form.classId,
            teacherId: form.teacherId,
            semester: form.semester,
        });
        showToast('Subject added successfully', 'success');
        setShowModal(false);
        setForm({ name: '', code: '', classId: '', teacherId: '', semester: 1 });
        loadData();
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Delete subject ${name}?`)) {
            deleteSubject(id);
            showToast('Subject deleted', 'info');
            loadData();
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h2>Subjects</h2>
                        <p>Manage subjects and assign teachers</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add Subject
                    </button>
                </div>
            </div>

            <div className="filter-bar mb-6">
                <div className="search-bar">
                    <Search size={18} />
                    <input placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Code</th>
                            <th>Class</th>
                            <th>Semester</th>
                            <th>Teacher</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📚</div>
                                        <h3>No subjects found</h3>
                                        <p>Add subjects to get started.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(sub => {
                                const cls = classes.find(c => c.id === sub.classId);
                                const teacher = teachers.find(t => t.id === sub.teacherId);
                                return (
                                    <tr key={sub.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="stat-card-icon purple" style={{ width: 36, height: 36 }}>
                                                    <BookOpen size={16} />
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{sub.name}</span>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-info">{sub.code}</span></td>
                                        <td>{cls?.name || '—'}</td>
                                        <td>Sem {sub.semester}</td>
                                        <td>{teacher?.name || '—'}</td>
                                        <td>
                                            <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(sub.id, sub.name)}
                                                style={{ color: 'var(--red-light)' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Subject</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Subject Name *</label>
                                        <input className="form-input" value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g. Data Structures" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Subject Code *</label>
                                        <input className="form-input" value={form.code}
                                            onChange={e => setForm({ ...form, code: e.target.value })}
                                            placeholder="e.g. CS301" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Class *</label>
                                    <select className="form-select" value={form.classId}
                                        onChange={e => setForm({ ...form, classId: e.target.value })}>
                                        <option value="">Select class</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} - {c.department}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Teacher *</label>
                                        <select className="form-select" value={form.teacherId}
                                            onChange={e => setForm({ ...form, teacherId: e.target.value })}>
                                            <option value="">Select teacher</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
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
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Subject</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSubjects;
