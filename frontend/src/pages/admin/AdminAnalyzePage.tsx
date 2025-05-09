
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useParams, Navigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

const AdminAnalyzePage = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  
  // Redirect if not admin
  if (!currentUser?.user.roles.includes('ADMIN')) {
    return <Navigate to="/" />;
  }
  
  // Mock data for the charts
  const taskDistributionData = [
    { name: 'Group A', value: 25 },
    { name: 'Group B', value: 35 },
    { name: 'Group C', value: 20 },
    { name: 'Group D', value: 10 },
    { name: 'Group E', value: 10 },
  ];
  
  const timelineData = [
    { date: 'Week 1', Group_A: 4, Group_B: 3, Group_C: 2 },
    { date: 'Week 2', Group_A: 7, Group_B: 5, Group_C: 6 },
    { date: 'Week 3', Group_A: 5, Group_B: 9, Group_C: 8 },
    { date: 'Week 4', Group_A: 10, Group_B: 7, Group_C: 12 },
    { date: 'Week 5', Group_A: 8, Group_B: 11, Group_C: 9 },
    { date: 'Week 6', Group_A: 12, Group_B: 10, Group_C: 11 },
  ];
  
  const groupPerformanceData = [
    { name: 'Group A', performance: 85, velocity: 75, quality: 90 },
    { name: 'Group B', performance: 90, velocity: 85, quality: 80 },
    { name: 'Group C', performance: 78, velocity: 90, quality: 75 },
    { name: 'Group D', performance: 70, velocity: 65, quality: 85 },
    { name: 'Group E', performance: 80, velocity: 70, quality: 70 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Analytics</h1>
          <p className="text-gray-600">Project ID: {projectId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium mb-4">Task Distribution by Group</h3>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium mb-4">Group Performance Metrics</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={groupPerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="performance" fill="#60a5fa" />
                  <Bar dataKey="velocity" fill="#f59e0b" />
                  <Bar dataKey="quality" fill="#34d399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">Progress Timeline</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Group_A" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Group_B" stroke="#82ca9d" />
                <Line type="monotone" dataKey="Group_C" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium mb-4">Project Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-md p-3">
              <div className="text-sm text-gray-500">Total Groups</div>
              <div className="text-2xl font-semibold">5</div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-3">
              <div className="text-sm text-gray-500">Total Members</div>
              <div className="text-2xl font-semibold">23</div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-3">
              <div className="text-sm text-gray-500">Tasks Completed</div>
              <div className="text-2xl font-semibold">127</div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-3">
              <div className="text-sm text-gray-500">Project Progress</div>
              <div className="text-2xl font-semibold">65%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyzePage;
