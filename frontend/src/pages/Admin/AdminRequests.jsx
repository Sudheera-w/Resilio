import React, { useEffect, useState } from 'react';
import './AdminRequests.css';
import { API_BASE as API } from '../../utils/api';

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqRes, volRes] = await Promise.all([
                fetch(`${API}/api/Requests`),
                fetch(`${API}/api/Volunteers`)
            ]);
            if (reqRes.ok) setRequests(await reqRes.json());
            if (volRes.ok) setVolunteers((await volRes.json()).filter(v => v.status === 'Active'));
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityChange = async (id, newPriority) => {
        try {
            const res = await fetch(`${API}/api/Admin/request/${id}/prioritize`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority: newPriority })
            });
            if (res.ok) {
                const updated = await res.json();
                setRequests(prev => prev.map(r => r.id === id ? updated : r));
            }
        } catch (err) {
            console.error('Failed to update priority', err);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await fetch(`${API}/api/Admin/request/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                showToast(`Status updated to ${newStatus}`);
                fetchData();
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleAssignVolunteer = async (requestId, volunteerId) => {
        if (!volunteerId) return;
        try {
            const res = await fetch(`${API}/api/Admin/request/${requestId}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ volunteerId: parseInt(volunteerId) })
            });
            if (res.ok) {
                showToast('Volunteer assigned successfully.');
                fetchData();
            } else {
                showToast('Failed to assign volunteer.', 'error');
            }
        } catch (err) {
            console.error('Failed to assign volunteer', err);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            const res = await fetch(`${API}/api/Admin/request/${confirmDelete.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setRequests(prev => prev.filter(r => r.id !== confirmDelete.id));
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

    const getPriorityClass = (priority) => {
        if (priority === 'High') return 'priority-high';
        if (priority === 'Medium') return 'priority-medium';
        return 'priority-low';
    };

    if (loading) return <div className="loadingState">Loading records...</div>;

    return (
        <div className="adminModule">
            {/* Toast */}
            {toast && (
                <div className={`adminToast ${toast.type === 'error' ? 'toastError' : 'toastSuccess'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="modalOverlay">
                    <div className="confirmModal">
                        <h3>🗑️ Delete Request</h3>
                        <p>Are you sure you want to permanently delete request <strong>#{confirmDelete.id}</strong> from <strong>{confirmDelete.name}</strong>?</p>
                        <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>This action cannot be undone.</p>
                        <div className="modalActions">
                            <button className="btnCancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btnDelete" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="moduleHeader">
                <h2>Relief Requests Operations</h2>
                <p>Prioritize incidents, update status, assign volunteers, and remove invalid records.</p>
            </div>

            <div className="dataTableContainer">
                <table className="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Victim Name</th>
                            <th>Location</th>
                            <th>Help Type</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Assign Volunteer</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan="8" className="emptyRow">No requests found.</td></tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req.id}>
                                    <td>#{req.id}</td>
                                    <td><strong>{req.fullName}</strong><br /><small>{req.contact}</small></td>
                                    <td>{req.location}</td>
                                    <td><span className="badge">{req.helpType}</span></td>

                                    <td>
                                        <select
                                            value={req.priority}
                                            onChange={(e) => handlePriorityChange(req.id, e.target.value)}
                                            className={`statusSelect ${getPriorityClass(req.priority)}`}
                                        >
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </td>

                                    <td>
                                        <select
                                            value={req.status}
                                            onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                            className="statusSelect"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Assigned">Assigned</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>

                                    <td>
                                        {req.status === 'Assigned' || req.status === 'Completed' ? (
                                            <span className="assignedText">
                                                Vol #{req.assignedVolunteerId}
                                                {req.assignedVolunteer && ` — ${req.assignedVolunteer.fullName}`}
                                            </span>
                                        ) : (
                                            <div className="assignContainer">
                                                <select
                                                    className="assignSelect"
                                                    onChange={(e) => handleAssignVolunteer(req.id, e.target.value)}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Select Vol...</option>
                                                    {volunteers.map(vol => (
                                                        <option key={vol.id} value={vol.id}>
                                                            {vol.fullName} (Ready)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </td>

                                    <td>
                                        <button
                                            className="btnDeleteRow"
                                            onClick={() => setConfirmDelete({ id: req.id, name: req.fullName })}
                                            title="Delete request"
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
