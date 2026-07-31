import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, loading, error, isAuthenticated, login, logout } = useAuth();

  const testLogin = async () => {
    try {
      console.log('Testing login with test@example.com');
      await login('test@example.com', 'password123');
    } catch (err) {
      console.error('Test login failed:', err);
    }
  };

  const testLogout = () => {
    console.log('Testing logout');
    logout();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <h3 className="font-bold text-sm mb-2">Auth Debug</h3>
      <div className="text-xs space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.name : 'None'}</div>
        {error && <div className="text-red-500">Error: {error}</div>}
      </div>
      <div className="mt-2 space-x-2">
        <button
          onClick={testLogin}
          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Test Login
        </button>
        <button
          onClick={testLogout}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Test Logout
        </button>
      </div>
    </div>
  );
};

export default AuthDebug; 