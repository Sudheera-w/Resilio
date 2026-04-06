import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/AppHeader/AppHeader';
import { resourcesApi } from '../../api/resourcesApi';

const ALLOCATION_COLORS = {
    NotAllocated: { bg: '#e8f5e9', color: '#2e7d32' },
    Allocated:    { bg: '#fff3e0', color: '#e65100' },
    Released:     { bg: '#ede7f6', color: '#4527a0' },
};

const CATEGORIES = ['Food', 'Water', 'Medicine', 'Shelter', 'Clothing', 'Other'];

export default function AdminResourcesPage() {
    const nav = useNavigate();

    const [resources,      setResources]      = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState(null);

    // Create modal
    const [showCreate,     setShowCreate]     = useState(false);
    const [createForm,     setCreateForm]     = useState({ name: '', category: '', quantity: 0 });
    const [createErr,      setCreateErr]      = useState(null);
    const [createLoading,  setCreateLoading]  = useState(false);

    // Edit modal
    const [editing,        setEditing]        = useState(null);
    const [editForm,       setEditForm]       = useState({});
    const [editErr,        setEditErr]        = useState(null);
    const [editLoading,    setEditLoading]    = useState(false);

    // Allocate modal
    const [allocating,     setAllocating]     = useState(null);
    const [allocForm,      setAllocForm]      = useState({ reliefRequestId: '', allocatedQuantity: 1 });
    const [allocErr,       setAllocErr]       = useState(null);
    const [allocLoading,   setAllocLoading]   = useState(false);

    // ── Load ──────────────────────────────────────────────────────────
    const load = () => {
        setLoading(true); setError(null);
        resourcesApi.getAll()
            .then(r => setResources(r.data))
            .catch(() => setError('Failed to load resources.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => load(), []);

    // ── Create ────────────────────────────────────────────────────────
    const handleCreate = async () => {
        if (!createForm.name.trim()) {
            setCreateErr('Name is required.'); return;
        }
        if (createForm.quantity < 0) {
            setCreateErr('Quantity cannot be negative.'); return;
        }
        setCreateLoading(true); setCreateErr(null);
        try {
            await resourcesApi.create({
                name:     createForm.name.trim(),
                category: createForm.category || null,
                quantity: Number(createForm.quantity),
            });
            setShowCreate(false);
            setCreateForm({ name: '', category: '', quantity: 0 });
            load();
        } catch (err) {
            setCreateErr(err.response?.data?.detail ?? 'Create failed.');
        } finally {
            setCreateLoading(false);
        }
    };

    // ── Edit ──────────────────────────────────────────────────────────
    const openEdit = (r) => {
        setEditing(r);
        setEditForm({ name: r.name, category: r.category ?? '', quantity: r.quantity });
        setEditErr(null);
    };

    const handleEdit = async () => {
        if (!editForm.name.trim()) {
            setEditErr('Name is required.'); return;
        }
        if (editForm.quantity < 0) {
            setEditErr('Quantity cannot be negative.'); return;
        }
        setEditLoading(true); setEditErr(null);
        try {
            await resourcesApi.update(editing.id, {
                name:     editForm.name.trim(),
                category: editForm.category || null,
                quantity: Number(editForm.quantity),
            });
            setEditing(null);
            load();
        } catch (err) {
            setEditErr(err.response?.data?.detail ?? 'Update failed.');
        } finally {
            setEditLoading(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this resource?')) return;
        try {
            await resourcesApi.delete(id);
            load();
        } catch (err) {
            alert(err.response?.data?.detail ?? 'Delete failed.');
        }
    };

    // ── Allocate ──────────────────────────────────────────────────────
    const openAllocate = (r) => {
        setAllocating(r);
        setAllocForm({ reliefRequestId: '', allocatedQuantity: 1 });
        setAllocErr(null);
    };

    const handleAllocate = async () => {
        if (!allocForm.reliefRequestId.trim()) {
            setAllocErr('Relief Request ID is required.'); return;
        }
        setAllocLoading(true); setAllocErr(null);
        try {
            await resourcesApi.allocate(allocating.id, {
                reliefRequestId:   allocForm.reliefRequestId.trim(),
                allocatedQuantity: Number(allocForm.allocatedQuantity),
            });
            setAllocating(null);
            load();
        } catch (err) {
            setAllocErr(err.response?.data?.detail ?? 'Allocation failed.');
        } finally {
            setAllocLoading(false);
        }
    };

    // ── Release ───────────────────────────────────────────────────────
    const handleRelease = async (id) => {
        if (!window.confirm('Release this resource?')) return;
        try {
            await resourcesApi.release(id);
            load();
        } catch (err) {
            alert(err.response?.data?.detail ?? 'Release failed.');
        }
    };

    // ── Render ────────────────────────────────────────────────────────
    return (
        <>
            <AppHeader />
            <div style={pageWrap}>
                <div style={card}>

                    {/* Header */}
                    <div style={headerRow}>
                        <div>
                            <h2 style={title}>Resources</h2>
                            <p style={subtitle}>Manage relief supply inventory and allocations.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button style={primBtn} onClick={() => {
                                setShowCreate(true); setCreateErr(null);
                            }}>
                                + Add Resource
                            </button>
                            <button style={secBtn} onClick={() => nav('/admin')}>
                                ← Back
                            </button>
                        </div>
                    </div>

                    <hr style={divider} />

                    {/* States */}
                    {loading && <p style={muted}>Loading...</p>}
                    {error   && <p style={errorTxt}>{error}</p>}
                    {!loading && resources.length === 0 && (
                        <div style={emptyBox}>
                            <p style={{ fontSize: 32, margin: 0 }}>📦</p>
                            <p style={{ color: '#888', margin: '8px 0 0' }}>
                                No resources found. Add one to get started.</p>
                        </div>
                    )}

                    {/* Table */}
                    {resources.length > 0 && (
                        <div style={{ overflowX: 'auto', marginTop: 16 }}>
                            <table style={table}>
                                <thead>
                                    <tr>
                                        <th style={{ ...th, width: 200 }}>Name</th>
                                        <th style={{ ...th, width: 130 }}>Category</th>
                                        <th style={{ ...th, width: 90  }}>Quantity</th>
                                        <th style={{ ...th, width: 130 }}>Status</th>
                                        <th style={{ ...th, width: 110 }}>Created</th>
                                        <th style={{ ...th, width: 200 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resources.map(r => (
                                        <tr key={r.id} style={trStyle}>

                                            {/* Name */}
                                            <td style={{ ...td, fontWeight: 600,
                                                         color: '#1a1a2e' }}>
                                                {r.name}
                                            </td>

                                            {/* Category */}
                                            <td style={{ ...td, color: '#666' }}>
                                                {r.category ?? '—'}
                                            </td>

                                            {/* Quantity */}
                                            <td style={{ ...td, fontWeight: 700,
                                                         color: r.quantity === 0
                                                             ? '#c0392b' : '#1a1a2e' }}>
                                                {r.quantity}
                                            </td>

                                            {/* Allocation Status */}
                                            <td style={td}>
                                                <span style={{
                                                    ...badge,
                                                    ...ALLOCATION_COLORS[r.allocationStatus]
                                                }}>
                                                    {r.allocationStatus}
                                                </span>
                                            </td>

                                            {/* Created */}
                                            <td style={{ ...td, color: '#999', fontSize: 13 }}>
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </td>

                                            {/* Actions */}
                                            <td style={{ ...td, overflow: 'visible',
                                                         whiteSpace: 'normal' }}>
                                                <div style={{ display: 'flex',
                                                              gap: 6, flexWrap: 'wrap' }}>

                                                    {/* Edit — always show */}
                                                    {r.allocationStatus === 'NotAllocated' && (
                                                        <button style={editBtn}
                                                            onClick={() => openEdit(r)}>
                                                            Edit
                                                        </button>
                                                    )}

                                                    {/* Allocate — only if NotAllocated */}
                                                    {r.allocationStatus === 'NotAllocated' && (
                                                        <button style={allocBtn}
                                                            onClick={() => openAllocate(r)}>
                                                            Allocate
                                                        </button>
                                                    )}

                                                    {/* Release — only if Allocated */}
                                                    {r.allocationStatus === 'Allocated' && (
                                                        <button style={releaseBtn}
                                                            onClick={() => handleRelease(r.id)}>
                                                            Release
                                                        </button>
                                                    )}

                                                    {/* Delete — only if not allocated */}
                                                    {r.allocationStatus !== 'Allocated' && (
                                                        <button style={delBtn}
                                                            onClick={() => handleDelete(r.id)}>
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div style={overlay}>
                    <div style={modal}>
                        <h3 style={{ marginTop: 0 }}>Add New Resource</h3>

                        <label style={lbl}>Name *</label>
                        <input
                            placeholder="e.g. Water Bottles"
                            value={createForm.name}
                            onChange={e => setCreateForm(p => ({
                                ...p, name: e.target.value }))}
                            style={inp}
                        />

                        <label style={lbl}>Category</label>
                        <select
                            value={createForm.category}
                            onChange={e => setCreateForm(p => ({
                                ...p, category: e.target.value }))}
                            style={inp}>
                            <option value="">— Select category —</option>
                            {CATEGORIES.map(c => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>

                        <label style={lbl}>Quantity</label>
                        <input
                            type="number" min={0}
                            value={createForm.quantity}
                            onChange={e => setCreateForm(p => ({
                                ...p, quantity: e.target.value }))}
                            style={inp}
                        />

                        {createErr && (
                            <p style={{ color: '#c0392b', fontSize: 13 }}>{createErr}</p>
                        )}

                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <button style={primBtnFull} onClick={handleCreate}
                                disabled={createLoading}>
                                {createLoading ? 'Creating...' : 'Create'}
                            </button>
                            <button style={secBtn}
                                onClick={() => setShowCreate(false)}
                                disabled={createLoading}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div style={overlay}>
                    <div style={modal}>
                        <h3 style={{ marginTop: 0 }}>Edit Resource</h3>

                        <label style={lbl}>Name *</label>
                        <input
                            value={editForm.name}
                            onChange={e => setEditForm(p => ({
                                ...p, name: e.target.value }))}
                            style={inp}
                        />

                        <label style={lbl}>Category</label>
                        <select
                            value={editForm.category}
                            onChange={e => setEditForm(p => ({
                                ...p, category: e.target.value }))}
                            style={inp}>
                            <option value="">— Select category —</option>
                            {CATEGORIES.map(c => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>

                        <label style={lbl}>Quantity</label>
                        <input
                            type="number" min={0}
                            value={editForm.quantity}
                            onChange={e => setEditForm(p => ({
                                ...p, quantity: e.target.value }))}
                            style={inp}
                        />

                        {editErr && (
                            <p style={{ color: '#c0392b', fontSize: 13 }}>{editErr}</p>
                        )}

                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <button style={primBtnFull} onClick={handleEdit}
                                disabled={editLoading}>
                                {editLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button style={secBtn}
                                onClick={() => setEditing(null)}
                                disabled={editLoading}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Allocate Modal */}
            {allocating && (
                <div style={overlay}>
                    <div style={modal}>
                        <h3 style={{ marginTop: 0 }}>
                            Allocate — {allocating.name}
                        </h3>
                        <p style={{ fontSize: 13, color: '#888', marginTop: -8 }}>
                            Available quantity: <strong>{allocating.quantity}</strong>
                        </p>

                        <label style={lbl}>Relief Request ID *</label>
                        <input
                            placeholder="Paste the Request GUID here"
                            value={allocForm.reliefRequestId}
                            onChange={e => setAllocForm(p => ({
                                ...p, reliefRequestId: e.target.value }))}
                            style={inp}
                        />

                        <label style={lbl}>Quantity to Allocate</label>
                        <input
                            type="number" min={1}
                            max={allocating.quantity}
                            value={allocForm.allocatedQuantity}
                            onChange={e => setAllocForm(p => ({
                                ...p, allocatedQuantity: e.target.value }))}
                            style={inp}
                        />

                        {allocErr && (
                            <p style={{ color: '#c0392b', fontSize: 13 }}>{allocErr}</p>
                        )}

                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <button style={primBtnFull} onClick={handleAllocate}
                                disabled={allocLoading}>
                                {allocLoading ? 'Allocating...' : 'Allocate'}
                            </button>
                            <button style={secBtn}
                                onClick={() => setAllocating(null)}
                                disabled={allocLoading}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const pageWrap   = { minHeight: '100vh', background: '#f5f6fa',
                     display: 'flex', justifyContent: 'center',
                     padding: '48px 16px',
                     fontFamily: "'Segoe UI', Inter, sans-serif" };
const card       = { background: '#fff', borderRadius: 16,
                     boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                     padding: '36px 40px', width: '100%', maxWidth: 1200 };
const headerRow  = { display: 'flex', justifyContent: 'space-between',
                     alignItems: 'flex-start', gap: 16 };
const title      = { margin: 0, fontSize: 22, fontWeight: 700,
                     color: '#1a1a2e', letterSpacing: '-0.3px' };
const subtitle   = { margin: '4px 0 0', fontSize: 13, color: '#888' };
const divider    = { border: 'none', borderTop: '1px solid #f0f0f0',
                     margin: '20px 0 24px' };
const muted      = { color: '#888', textAlign: 'center', padding: '32px 0' };
const errorTxt   = { color: '#c0392b', fontSize: 13 };
const emptyBox   = { textAlign: 'center', padding: '40px 0' };
const table      = { width: '100%', borderCollapse: 'collapse',
                     fontSize: 14, tableLayout: 'fixed' };
const th         = { textAlign: 'left', padding: '11px 14px',
                     background: '#f9f9f9', fontWeight: 700,
                     borderBottom: '2px solid #f0f0f0', color: '#444',
                     overflow: 'hidden' };
const trStyle    = { borderBottom: '1px solid #f5f5f5' };
const td         = { padding: '13px 14px', verticalAlign: 'middle',
                     overflow: 'hidden', textOverflow: 'ellipsis',
                     whiteSpace: 'nowrap', maxWidth: 0 };
const badge      = { fontSize: 11, fontWeight: 700, padding: '4px 12px',
                     borderRadius: 20, whiteSpace: 'nowrap' };
const editBtn    = { padding: '5px 12px', borderRadius: 8,
                     border: '1px solid #ddd', background: '#fff',
                     cursor: 'pointer', fontSize: 12 };
const allocBtn   = { padding: '5px 12px', borderRadius: 8,
                     border: '1px solid #bbdefb', background: '#e3f2fd',
                     color: '#1565c0', cursor: 'pointer', fontSize: 12 };
const releaseBtn = { padding: '5px 12px', borderRadius: 8,
                     border: '1px solid #ffe0b2', background: '#fff3e0',
                     color: '#e65100', cursor: 'pointer', fontSize: 12 };
const delBtn     = { padding: '5px 12px', borderRadius: 8,
                     border: '1px solid #fcc', background: '#fff0f0',
                     color: '#c0392b', cursor: 'pointer', fontSize: 12 };
const overlay    = { position: 'fixed', inset: 0,
                     background: 'rgba(0,0,0,0.4)',
                     display: 'flex', alignItems: 'center',
                     justifyContent: 'center', zIndex: 1000 };
const modal      = { background: '#fff', borderRadius: 16,
                     padding: 28, width: '100%', maxWidth: 460,
                     boxShadow: '0 8px 40px rgba(0,0,0,0.18)' };
const lbl        = { display: 'block', fontSize: 13, fontWeight: 600,
                     marginBottom: 6, marginTop: 14 };
const inp        = { width: '100%', padding: '10px 12px', borderRadius: 10,
                     border: '1px solid #ddd', fontSize: 14,
                     boxSizing: 'border-box',
                     fontFamily: "'Segoe UI', Inter, sans-serif" };
const primBtn    = { padding: '10px 18px', borderRadius: 10, border: 'none',
                     background: '#1a1a2e', color: '#fff',
                     cursor: 'pointer', fontSize: 13,
                     fontFamily: "'Segoe UI', Inter, sans-serif" };
const primBtnFull = { flex: 1, padding: 11, borderRadius: 10, border: 'none',
                      background: '#1a1a2e', color: '#fff',
                      cursor: 'pointer', fontSize: 14,
                      fontFamily: "'Segoe UI', Inter, sans-serif" };
const secBtn     = { padding: '10px 18px', borderRadius: 10,
                     border: '1.5px solid #e8e8e8', background: '#fff',
                     color: '#555', cursor: 'pointer', fontSize: 13,
                     fontFamily: "'Segoe UI', Inter, sans-serif" };