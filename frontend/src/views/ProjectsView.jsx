import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import { projectsApi } from '../api/projects'
import styles from './ProjectsView.module.css'

const emptyForm = { title: '', description: '', status: 'Active' }

const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return '#10b981'
        case 'Active': return '#6366f1'
        case 'Pending': return '#f59e0b'
        default: return '#64748b'
    }
}

export default function ProjectsView() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)

    const searchRef = useRef(search)
    const statusRef = useRef(statusFilter)
    searchRef.current = search
    statusRef.current = statusFilter

    const loadProjects = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await projectsApi.list({
                search: searchRef.current,
                status: statusRef.current,
            })
            setProjects(res.data.data || res.data)
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to load projects')
        } finally {
            setLoading(false)
        }
    }, [])

    // Debounced reload on filter changes (300ms), like the watch() in the Vue version.
    useEffect(() => {
        const timer = setTimeout(loadProjects, 300)
        return () => clearTimeout(timer)
    }, [search, statusFilter, loadProjects])

    const openCreate = () => {
        setEditing(null)
        setForm(emptyForm)
        setShowModal(true)
    }

    const openEdit = (p) => {
        setEditing(p)
        setForm({ title: p.title, description: p.description, status: p.status })
        setShowModal(true)
    }

    const saveProject = async (e) => {
        e.preventDefault()
        if (!form.title.trim()) return
        setSaving(true)
        try {
            if (editing) {
                await projectsApi.update(editing.id, form)
            } else {
                await projectsApi.create(form)
            }
            setShowModal(false)
            await loadProjects()
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to save project')
        } finally {
            setSaving(false)
        }
    }

    const deleteProject = async (p) => {
        if (!confirm(`Delete "${p.title}"?`)) return
        try {
            await projectsApi.remove(p.id)
            await loadProjects()
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to delete project')
        }
    }

    return (
        <div className={styles.projects}>
            <div className={styles.actionBar}>
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className={styles.statusFilter}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                </select>
                <button className="btn-primary" onClick={openCreate}>
                    <Plus size={20} />
                    <span>New Project</span>
                </button>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}
            {loading && <div className={styles.loading}>Loading projects...</div>}
            {!loading && !projects.length && (
                <div className={`${styles.emptyState} glass-card`}>
                    <p>No projects found. Create your first one!</p>
                    <button className="btn-primary" onClick={openCreate}>New Project</button>
                </div>
            )}

            {!loading && !!projects.length && (
                <div className={`${styles.projectList} glass-card`}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id}>
                                    <td><span className={styles.projectTitle}>{project.title}</span></td>
                                    <td><span className={styles.projectDesc}>{project.description}</span></td>
                                    <td>
                                        <span
                                            className={styles.statusBadge}
                                            style={{
                                                backgroundColor: getStatusColor(project.status) + '15',
                                                color: getStatusColor(project.status),
                                            }}
                                        >
                                            {project.status}
                                        </span>
                                    </td>
                                    <td>
                                        {project.created_at
                                            ? new Date(project.created_at).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td className={styles.actions}>
                                        <button className={styles.iconBtn} onClick={() => openEdit(project)} title="Edit">
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            className={`${styles.iconBtn} ${styles.danger}`}
                                            onClick={() => deleteProject(project)}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div
                    className={styles.modalOverlay}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowModal(false)
                    }}
                >
                    <div className={`${styles.modal} glass-card`}>
                        <div className={styles.modalHeader}>
                            <h3>{editing ? 'Edit Project' : 'New Project'}</h3>
                            <button className={styles.iconBtn} onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={saveProject} className={styles.modalForm}>
                            <label>Title
                                <input
                                    type="text"
                                    placeholder="Project title"
                                    required
                                    maxLength={200}
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </label>
                            <label>Description
                                <textarea
                                    placeholder="Short description"
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </label>
                            <label>Status
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                >
                                    <option>Active</option>
                                    <option>Pending</option>
                                    <option>Completed</option>
                                </select>
                            </label>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
