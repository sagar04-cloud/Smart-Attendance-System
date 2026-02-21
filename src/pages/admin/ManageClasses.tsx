import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, X, Building2 } from 'lucide-react';
import { ClassSection, getClasses, addClass, deleteClass, generateId } from '../../store/data';
import { useToast } from '../../context/ToastContext';

const ManageClasses: React.FC = () => {
    const [classes, setClasses] = useState<ClassSection[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { showToast } = useToast();

    const [form, setForm] = useState({
        name: '', department: '', semester: 1, section: 'A',
    });

    const loadData = () => setClasses(getClasses());
    useEffect(() => { loadData(); }, []);

    const filtered = classes.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.department.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.department) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        addClass({
            id: generateId(),
            name: form.name,
            department: form.department,
            semester: form.semester,
            section: form.section,
        });
        showToast('Class added successfully', 'success');
        setShowModal(false);
        setForm({ name: '', department: '', semester: 1, section: 'A' });
        loadData();
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Delete class ${name}?`)) {
            deleteClass(id);
            showToast('Class deleted', 'info');
            loadData();
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h2>Classes & Sections</h2>
                        <p>Manage class sections and departments</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add Class
                    </button>
                </div>
            </div>

            <div className="filter-bar mb-6">
                <div className="search-bar">
                    <Search size={18} />
                    <input placeholder="Search classes..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <span className="badge badge-purple">{filtered.length} classes</span>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {filtered.map((cls, i) => (
                    <div key={cls.id} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="stat-card-header">
                            <div className="stat-card-icon purple"><Building2 size={20} /></div>
                            <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(cls.id, cls.name)}
                                style={{ color: 'var(--red-light)' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="stat-card-value" style={{ fontSize: 22 }}>{cls.name}</div>
                        <div className="stat-card-label">{cls.department}</div>
                        <div className="flex gap-2 mt-2">
                            <span className="badge badge-info">Sem {cls.semester}</span>
                            <span className="badge badge-purple">Section {cls.section}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Class</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Class Name</label>
                                    <input className="form-input" value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. CS-4A" />
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
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Semester</label>
                                        <select className="form-select" value={form.semester}
                                            onChange={e => setForm({ ...form, semester: Number(e.target.value) })}>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                <option key={s} value={s}>Semester {s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Section</label>
                                        <select className="form-select" value={form.section}
                                            onChange={e => setForm({ ...form, section: e.target.value })}>
                                            {['A', 'B', 'C', 'D'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Class</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageClasses;
