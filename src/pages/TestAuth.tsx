import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../components/NotificationSystem';

const TestAuth: React.FC = () => {
  const { user, loading, error, login, register, logout, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');

  const handleTestLogin = async () => {
    try {
      await login(testEmail, testPassword);
      addNotification({
        type: 'success',
        title: 'Login Test',
        message: 'Login successful!'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Login Test Failed',
        message: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  const handleTestRegister = async () => {
    try {
      await register({
        name: 'Test User',
        email: testEmail,
        location: 'Test City',
        skills: ['React', 'TypeScript'],
        phone: '+1234567890'
      });
      addNotification({
        type: 'success',
        title: 'Register Test',
        message: 'Registration successful!'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Register Test Failed',
        message: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  const handleTestLogout = () => {
    logout();
    addNotification({
      type: 'info',
      title: 'Logout Test',
      message: 'Logged out successfully!'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test Page</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Current State */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Current State</h2>
              <div className="space-y-2 text-sm">
                <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
                <div><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
                <div><strong>User:</strong> {user ? user.name : 'None'}</div>
                <div><strong>Email:</strong> {user ? user.email : 'None'}</div>
                {error && (
                  <div className="text-red-600"><strong>Error:</strong> {error}</div>
                )}
              </div>
            </div>

            {/* Test Controls */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Test Email:</label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Test Password:</label>
                  <input
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleTestLogin}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Test Login
                  </button>
                  <button
                    onClick={handleTestRegister}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Test Register
                  </button>
                  <button
                    onClick={handleTestLogout}
                    disabled={!isAuthenticated}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Test Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User Details */}
          {user && (
            <div className="mt-8 bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">User Details</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Name:</strong> {user.name}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Location:</strong> {user.location}</div>
                <div><strong>Experience:</strong> {user.experience}</div>
                <div><strong>Phone:</strong> {user.phone || 'Not provided'}</div>
                <div><strong>Skills:</strong> {user.skills.join(', ')}</div>
                <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
                <div><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleDateString()}</div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Use this page to test the authentication functionality</li>
              <li>Try logging in with different email/password combinations</li>
              <li>Test registration with various data</li>
              <li>Check the browser console for detailed logs</li>
              <li>Verify that localStorage is being updated correctly</li>
              <li>Test the logout functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuth; 