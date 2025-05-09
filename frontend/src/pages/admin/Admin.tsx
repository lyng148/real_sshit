import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Admin = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not admin
  if (!currentUser?.user.roles.includes('ADMIN')) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your application settings and users</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-2">User Management</h3>
            <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
            <Button 
              variant="link" 
              className="text-blue-600 hover:text-blue-800 p-0"
              onClick={() => navigate('/admin/users')}
            >
              View Users →
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-2">Project Settings</h3>
            <p className="text-gray-600 mb-4">Configure projects and access controls</p>
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-800 p-0"
            >
              Manage Projects →
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-2">System Settings</h3>
            <p className="text-gray-600 mb-4">Configure system-wide settings</p>
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-800 p-0"
            >
              View Settings →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
