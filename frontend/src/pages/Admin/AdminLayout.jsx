import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import './AdminLayout.css';
import logo from '../../assets/Landing_Page/Logo.png';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    // Secure the route
    useEffect(() => {
        const isAdmin = sessionStorage.getItem('isAdmin');
        if (!isAdmin) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('isAdmin');
        navigate('/admin');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/admin/requests', icon: '🚨', label: 'Help Requests' },
        { path: '/admin/volunteers', icon: '👥', label: 'Volunteers' },
        { path: '/admin/donations', icon: '📦', label: 'Donations & Resources' },
    ];

    return (
        <div className="adminLayout">
            {/* Sidebar */}
            <aside className="adminSidebar">
                <div className="sidebarHeader">
                    <img src={logo} alt="Resilio" className="sidebarLogo"/>
                    <h2>Resilio Admin</h2>
                </div>

                <nav className="sidebarNav">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`navItem ${location.pathname.includes(item.path) ? 'active' : ''}`}
                        >
                            <span className="navIcon">{item.icon}</span>
                            <span className="navLabel">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebarFooter">
                    <button className="logoutBtn" onClick={handleLogout}>
                        <span className="navIcon">🚪</span>
                        <span className="navLabel">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="adminMain">
                <header className="adminTopbar">
                    <div className="topbarLeft">
                        <h3>System Control Center</h3>
                    </div>
                    <div className="topbarRight">
                        <div className="adminAvatar">A</div>
                        <span className="adminName">System Administrator</span>
                    </div>
                </header>
                
                <div className="adminContentArea">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
