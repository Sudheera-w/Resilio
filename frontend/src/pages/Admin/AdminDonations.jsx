import React, { useEffect, useState } from 'react';
import './AdminRequests.css';
import { API_BASE as API } from '../../utils/api';

export default function AdminDonations() {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchDonations(); }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/Donations`);
            if (res.ok) setDonations(await res.json());
        } catch (err) {
            console.error('Failed to load donations', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await fetch(`${API}/api/Admin/donation/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setDonations(prev => prev.map(d => d.id === id ? updated : d));
                showToast(`Donation ${newStatus.toLowerCase()}`);
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            const res = await fetch(`${API}/api/Admin/donation/${confirmDelete.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setDonations(prev => prev.filter(d => d.id !== confirmDelete.id));
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

    if (loading) return <div className="loadingState">Loading resources...</div>;

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
                        <h3>🗑️ Delete Donation</h3>
                        <p>Are you sure you want to permanently delete donation <strong>#{confirmDelete.id}</strong> from <strong>{confirmDelete.name}</strong>?</p>
                        <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>This action cannot be undone.</p>
                        <div className="modalActions">
                            <button className="btnCancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btnDelete" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="moduleHeader">
                <h2>Resource &amp; Inventory Management</h2>
                <p>Approve incoming donations, track available relief stock, and remove invalid entries.</p>
            </div>

            <div className="dataTableContainer">
                <table className="adminTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Resource Type</th>
                            <th>Donor Details</th>
                            <th>Quantity &amp; Details</th>
                            <th>Location / Center</th>
                            <th>Approval Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.length === 0 ? (
                            <tr><td colSpan="7" className="emptyRow">No donations found.</td></tr>
                        ) : (
                            donations.map(don => (
                                <tr key={don.id}>
                                    <td>#{don.id}</td>
                                    <td><span className="badge">{don.resourceType}</span></td>
                                    <td>
                                        <strong>{don.donorName || 'Anonymous'}</strong><br />
                                        <small>{don.contactNumber}</small>
                                    </td>
                                    <td>
                                        <strong>{don.quantity}</strong><br />
                                        <small>{don.itemName || don.foodType || don.medicineType || don.clothingType}</small>
                                    </td>
                                    <td>{don.location}</td>
                                    <td>
                                        <select
                                            value={don.status}
                                            onChange={(e) => handleStatusChange(don.id, e.target.value)}
                                            className="assignSelect"
                                        >
                                            <option value="Pending">🕒 Pending</option>
                                            <option value="Approved">✅ Approved (In Stock)</option>
                                            <option value="Rejected">❌ Rejected</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="btnDeleteRow"
                                            onClick={() => setConfirmDelete({ id: don.id, name: don.donorName || 'Anonymous' })}
                                            title="Delete donation"
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
