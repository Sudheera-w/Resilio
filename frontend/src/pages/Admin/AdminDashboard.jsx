import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { API_BASE } from '../../utils/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0,
        totalVolunteers: 0,
        activeVolunteers: 0,
        totalDonations: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/Admin/dashboard`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Failed to load dashboard stats", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loadingState">Loading dashboard...</div>;

    return (
        <div className="adminDashboard">
            <div className="dashboardHeader">
                <h2>Overview Dashboard</h2>
                <p>Real-time statistics of disaster relief operations.</p>
            </div>

            <div className="statsGrid">
                <div className="statCard warningCard">
                    <div className="statIcon">🚨</div>
                    <div className="statDetails">
                        <h3>{stats.pendingRequests}</h3>
                        <p>Pending Requests</p>
                    </div>
                </div>

                <div className="statCard primaryCard">
                    <div className="statIcon">📋</div>
                    <div className="statDetails">
                        <h3>{stats.totalRequests}</h3>
                        <p>Total Requests</p>
                    </div>
                </div>

                <div className="statCard successCard">
                    <div className="statIcon">✅</div>
                    <div className="statDetails">
                        <h3>{stats.completedRequests}</h3>
                        <p>Completed Reliefs</p>
                    </div>
                </div>

                <div className="statCard infoCard">
                    <div className="statIcon">👥</div>
                    <div className="statDetails">
                        <h3>{stats.totalVolunteers}</h3>
                        <p>Registered Volunteers</p>
                    </div>
                </div>

                <div className="statCard highlightCard">
                    <div className="statIcon">🏃</div>
                    <div className="statDetails">
                        <h3>{stats.activeVolunteers}</h3>
                        <p>Available Volunteers</p>
                    </div>
                </div>

                <div className="statCard resourceCard">
                    <div className="statIcon">📦</div>
                    <div className="statDetails">
                        <h3>{stats.totalDonations}</h3>
                        <p>Resource Pledges</p>
                    </div>
                </div>
            </div>

            <div className="dashboardGrid">
                <div className="dashboardPanel">
                    <div className="panelHeader">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="panelBody">
                        <div className="actionList">
                            <button className="actionBtn">Assign Volunteers to Urgent Requests</button>
                            <button className="actionBtn">Review Pending Donations</button>
                            <button className="actionBtn">Broadcast Emergency Alert</button>
                        </div>
                    </div>
                </div>

                <div className="dashboardPanel">
                    <div className="panelHeader">
                        <h3>System Status</h3>
                    </div>
                    <div className="panelBody">
                        <ul className="statusList">
                            <li><span className="dot green"></span> Database Cluster - Online</li>
                            <li><span className="dot green"></span> API Gateway - Online</li>
                            <li><span className="dot green"></span> OTP SMS Service - Online</li>
                            <li><span className="dot yellow"></span> Geolocation API - Degraded</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
