import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useParams, Navigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/services/axiosInstance';

const AdminAnalyzePage = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const [taskDistributionData, setTaskDistributionData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [groupPerformanceData, setGroupPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectSummary, setProjectSummary] = useState({
    totalGroups: 0,
    totalMembers: 0,
    tasksCompleted: 0,
    projectProgress: 0
  });
  
  // Redirect if not admin
  if (!currentUser?.user.roles.includes('ADMIN')) {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      
      setLoading(true);
      try {
        // Fetch real data from backend
        const analyticsResponse = await axiosInstance.get(`/api/admin/analytics/project/${projectId}`);
        
        if (analyticsResponse.data && analyticsResponse.data.success) {
          const data = analyticsResponse.data.data;
          
          if (data.taskDistribution) {
            setTaskDistributionData(data.taskDistribution);
          }
          
          if (data.timeline) {
            setTimelineData(data.timeline);
          }
          
          if (data.groupPerformance) {
            setGroupPerformanceData(data.groupPerformance);
          }
          
          if (data.summary) {
            setProjectSummary(data.summary);
          }
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Analytics</h1>
          <p className="text-gray-600">Project ID: {projectId}</p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
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
                    {timelineData.length > 0 && Object.keys(timelineData[0] || {}).filter(key => key !== 'date').map((key, index) => (
                      <Line 
                        key={key}
                        type="monotone" 
                        dataKey={key} 
                        stroke={COLORS[index % COLORS.length]} 
                        activeDot={{ r: 8 }} 
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-medium mb-4">Project Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border border-gray-200 rounded-md p-3">
                  <div className="text-sm text-gray-500">Total Groups</div>
                  <div className="text-2xl font-semibold">{projectSummary.totalGroups}</div>
                </div>
                
                <div className="border border-gray-200 rounded-md p-3">
                  <div className="text-sm text-gray-500">Total Members</div>
                  <div className="text-2xl font-semibold">{projectSummary.totalMembers}</div>
                </div>
                
                <div className="border border-gray-200 rounded-md p-3">
                  <div className="text-sm text-gray-500">Tasks Completed</div>
                  <div className="text-2xl font-semibold">{projectSummary.tasksCompleted}</div>
                </div>
                
                <div className="border border-gray-200 rounded-md p-3">
                  <div className="text-sm text-gray-500">Project Progress</div>
                  <div className="text-2xl font-semibold">{projectSummary.projectProgress}%</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyzePage;
