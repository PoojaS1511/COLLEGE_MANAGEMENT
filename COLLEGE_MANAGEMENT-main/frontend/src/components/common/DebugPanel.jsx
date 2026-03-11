import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DebugPanel = () => {
  const { user, isInitialized } = useAuth();

  let lastError = null;
  try {
    const raw = localStorage.getItem('last_client_error');
    if (raw) lastError = JSON.parse(raw);
  } catch (e) {
    lastError = { message: 'Failed to read last error' };
  }

  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 9999 }}>
      <div className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-xs w-72">
        <div className="flex items-center justify-between mb-2">
          <strong className="text-sm">Debug</strong>
          <button
            onClick={() => localStorage.removeItem('last_client_error')}
            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
          >Clear</button>
        </div>
        <div className="mb-2">
          <div className="text-[11px] text-gray-500">User</div>
          <div className="text-[13px] text-gray-900 truncate">{user?.email ?? 'not signed in'}</div>
          <div className="text-[11px] text-gray-500">Role</div>
          <div className="text-[13px] text-gray-900 truncate">{user?.role ?? 'unknown'}</div>
        </div>
        <div>
          <div className="text-[11px] text-gray-500">Last client error</div>
          {lastError ? (
            <div className="text-[12px] text-red-700 break-words">{lastError.message}<div className="text-[10px] text-gray-500">{lastError.url} • {new Date(lastError.timestamp).toLocaleString()}</div></div>
          ) : (
            <div className="text-[12px] text-gray-500">(none)</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
