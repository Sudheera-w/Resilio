import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import logo from '../../assets/Landing_Page/Logo.png';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Hardcoded admin auth for simplicity
        if (password === 'admin123') {
            sessionStorage.setItem('isAdmin', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="adminLoginContainer">
            <div className="adminLoginCard">
                <div className="adminHeader">
                    <img src={logo} alt="Resilio Logo" className="adminLogo" />
                    <h2>Resilio Admin Control</h2>
                </div>
                
                <p className="adminSubtitle">Sign in to orchestrate disaster relief operations.</p>
                
                <form onSubmit={handleLogin} className="adminForm">
                    <div className="formGroup">
                        <label>Admin Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter password (admin123)"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            className="adminInput"
                        />
                    </div>
                    
                    {error && <div className="adminError">{error}</div>}
                    
                    <button type="submit" className="adminLoginBtn">Access Control Panel</button>
                    
                    <button type="button" className="adminReturnBtn" onClick={() => navigate('/')}>
                        Return to Public Site
                    </button>
                </form>
            </div>
        </div>
    );
}
