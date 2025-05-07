
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GroupAnalyzePage = () => {
  const { projectId } = useParams();
  
  // Mock data for the charts
  const taskCompletionData = [
    { name: 'Week 1', completed: 5, inProgress: 3, todo: 7 },
    { name: 'Week 2', completed: 7, inProgress: 4, todo: 4 },
    { name: 'Week 3', completed: 9, inProgress: 5, todo: 2 },
    { name: 'Week 4', completed: 12, inProgress: 3, todo: 1 },
  ];
  
  const memberActivityData = [
    { name: 'John', tasks: 8, commits: 15 },
    { name: 'Alice', tasks: 12, commits: 10 },
    { name: 'Bob', tasks: 6, commits: 20 },
    { name: 'Mary', tasks: 10, commits: 8 },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Group Analytics</h1>
          <p className="text-gray-600">Project ID: {projectId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium mb-4">Task Completion</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={taskCompletionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#4ade80" />
                  <Bar dataKey="inProgress" stackId="a" fill="#60a5fa" />
                  <Bar dataKey="todo" stackId="a" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium mb-4">Member Activity</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={memberActivityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#60a5fa" />
                  <Bar dataKey="commits" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-md p-3">
              <div className="text-sm text-gray-500">Tasks Completed</div>
              <div className="text-2xl font-semibold">33</div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-3">
              <div className="text-sm text-gray-500">Completion Rate</div>
              <div className="text-2xl font-semibold">78%</div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-3">
              <div className="text-sm text-gray-500">Active Members</div>
              <div className="text-2xl font-semibold">4/5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupAnalyzePage;
