import React from 'react';
import { useNetwork } from "../context/useNetwork";

export default function SyncStatusBar() {
    const { isOnline, isSyncing } = useNetwork();

    if (isOnline && !isSyncing) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            padding: '10px',
            textAlign: 'center',
            backgroundColor: isOnline ? '#3b82f6' : '#ef4444',
            color: 'white',
            fontWeight: 'bold',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px'
        }}>
            {isOnline && isSyncing ? (
                <>
                    <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                    Syncing offline data to server...
                </>
            ) : (
                <>
                    ⚠️ You are offline. Changes will be saved locally and pushed when you reconnect.
                </>
            )}
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
