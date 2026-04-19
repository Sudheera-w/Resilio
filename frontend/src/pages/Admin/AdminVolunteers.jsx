import React, { useEffect, useState } from 'react';
import './AdminRequests.css';
import { API_BASE as API } from '../../utils/api';

export default function AdminVolunteers() {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchVolunteers(); }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchVolunteers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/Volunteers`);
            if (res.ok) setVolunteers(await res.json());
        } catch (err) {
            console.error('Failed to load volunteers', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await fetch(`${API}/api/Admin/volunteer/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setVolunteers(prev => prev.map(v => v.id === id ? updated : v));
                showToast(`Status updated to ${newStatus}`);
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            const res = await fetch(`${API}/api/Admin/volunteer/${confirmDelete.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setVolunteers(prev => prev.filter(v => v.id !== confirmDelete.id));
                showToast(data.message);
            } else {
                showToast(data.message, 'error');
            }
        } catch {
            showToast('Delete failed.', 'error');
        } finally {
            setConfirmDelete(null);
        }
    };

    if (loading) return <div className="loadingState">Loading volunteers...</div>;

    return (
        <div className="adminModule">
            {toast && (
                <div className={`adminToast ${toast.type === 'error' ? 'toastError' : 'toastSuccess'}`}>
                    {toast.msg}
                </div>
            )}

            {confirmDelete && (
                <div className="modalOverlay">
                    <div className="confirmModal">
                        <h3>🗑️ Remove Volunteer</h3>
                        <p>Are you sure you want to permanently remove <strong>{confirmDelete.name}</strong> (#{confirmDelete.id}) from the system?</p>
                        <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>This action cannot be undone. Active assignments must be resolved first.</p>
                        <div className="modalActions">
                            <button className="btnCancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btnDelete" onClick={handleDelete}>Remove</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="moduleHeader">
                <h2>Volunteer Management</h2>
                <p>Verify accounts, track availability, manage your ground teams, and remove inactive volunteers.</p>
            </div>

            <div className="dataTableContainer">
                <table className="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Volunteer Info</th>
                            <th>Location</th>
                            <th>Skills / Roles</th>
                            <th>Vehicle</th>
                            <th>System Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {volunteers.length === 0 ? (
                            <tr><td colSpan="7" className="emptyRow">No volunteers registered.</td></tr>
                        ) : (
                            volunteers.map(vol => (
                                <tr key={vol.id}>
                                    <td>#{vol.id}</td>
                                    <td><strong>{vol.fullName}</strong><br /><small>{vol.contact}</small></td>
                                    <td>{vol.location}</td>
                                    <td><small>{vol.roles}</small></td>
                                    <td>{vol.hasVehicle === 'Yes' ? `🚐 ${vol.vehicleType}` : '❌ No'}</td>
                                    <td>
                                        <select
                                            value={vol.status}
                                            onChange={(e) => handleStatusChange(vol.id, e.target.value)}
                                            className="assignSelect"
                                        >
                                            <option value="Active">🟢 Active (Ready)</option>
                                            <option value="Busy">🟠 Busy (Deployed)</option>
                                            <option value="Blocked">🔴 Blocked</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="btnDeleteRow"
                                            onClick={() => setConfirmDelete({ id: vol.id, name: vol.fullName })}
                                            title="Remove volunteer"
                                            disabled={vol.status === 'Busy'}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
