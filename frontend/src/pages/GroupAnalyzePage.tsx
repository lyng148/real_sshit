import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import projectService from '@/services/projectService';
import { GroupStatisticsResponse } from '@/types/statistics';

// Mock data for charts
const activityOverTime = [
  { date: '2025-01-01', commits: 5, issues: 2, pullRequests: 1 },
  { date: '2025-01-02', commits: 7, issues: 3, pullRequests: 2 },
  { date: '2025-01-03', commits: 10, issues: 1, pullRequests: 3 },
  { date: '2025-01-04', commits: 4, issues: 2, pullRequests: 0 },
  { date: '2025-01-05', commits: 12, issues: 4, pullRequests: 2 },
  { date: '2025-01-06', commits: 8, issues: 1, pullRequests: 1 },
  { date: '2025-01-07', commits: 15, issues: 3, pullRequests: 4 },
];

const commitDistribution = [
  { name: 'John Doe', commits: 23 },
  { name: 'Jane Smith', commits: 17 },
  { name: 'Alex Wong', commits: 12 },
  { name: 'Maria Garcia', commits: 19 },
];

const taskStatusData = [
  { name: 'Completed', value: 25, fill: '#10B981' },
  { name: 'In Progress', value: 15, fill: '#3B82F6' },
  { name: 'Todo', value: 10, fill: '#6B7280' },
];

// Generate some mock data for contributor score comparison
const generateMockContributorData = () => {
  const contributors = ['John Doe', 'Jane Smith', 'Alex Wong', 'Maria Garcia'];
  return contributors.map(name => {
    return {
      name,
      score: Math.floor(Math.random() * 50) + 50, // Random score between 50-100
      attendance: Math.floor(Math.random() * 30) + 70, // Random attendance % between 70-100
      taskCompletion: Math.floor(Math.random() * 40) + 60, // Random completion % between 60-100
      // Other metrics...
    };
  });
};

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow rounded">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const GroupAnalyzePage = () => {
  const { projectId, groupId } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<GroupStatisticsResponse | null>(null);
  const [contributorData] = useState(generateMockContributorData());
  
  useEffect(() => {
    const fetchGroupStatistics = async () => {
      if (!groupId) return;
      
      try {
        setLoading(true);
        const response = await projectService.getGroupStatistics(Number(groupId));
        if (response.success) {
          setStatistics(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load statistics",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching group statistics:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroupStatistics();
  }, [groupId, toast]);

  const getPressureScoreColor = (score: number) => {
    if (score < 30) return "text-green-500";
    if (score < 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Group Analysis</h1>
          <p className="text-gray-600">Project ID: {projectId}, Group ID: {groupId}</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contributors">Contributors</TabsTrigger>
            <TabsTrigger value="commits">Commits</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">COMMITS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics?.commitMetrics.totalCommits || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last 7 days: {statistics?.commitMetrics.recentCommits || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">TASKS COMPLETED</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics?.taskMetrics.completedTasks || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Total tasks: {statistics?.taskMetrics.totalTasks || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">CONTRIBUTOR SCORE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics?.contributionFactors.averageContributorScore.toFixed(1) || 0}/100
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Based on {statistics?.groupMemberCount || 0} contributors
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">PRESSURE SCORE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getPressureScoreColor(statistics?.contributionFactors.pressureScore || 0)}`}>
                    {statistics?.contributionFactors.pressureScore.toFixed(1) || 0}/100
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Based on deadlines and completion rate
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Activity Over Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Over Time</CardTitle>
                <CardDescription>Commits, issues, and pull requests over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="commits" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="issues" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="pullRequests" stroke="#F59E0B" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Two Charts in a Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commit Distribution</CardTitle>
                  <CardDescription>Commits by team member</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={commitDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="commits" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Task Status</CardTitle>
                  <CardDescription>Current status of all tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={taskStatusData} 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={80} 
                          fill="#8884d8" 
                          dataKey="value" 
                          nameKey="name" 
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Contributors Tab */}
          <TabsContent value="contributors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contributor Performance</CardTitle>
                <CardDescription>Analysis of team member contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {contributorData.map((contributor, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{contributor.name}</div>
                        <div className="text-sm font-medium">{contributor.score}/100</div>
                      </div>
                      <Progress value={contributor.score} />
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div>
                          <div>Attendance</div>
                          <div className="font-medium text-gray-700">{contributor.attendance}%</div>
                        </div>
                        <div>
                          <div>Task Completion</div>
                          <div className="font-medium text-gray-700">{contributor.taskCompletion}%</div>
                        </div>
                        <div>
                          <div>Code Quality</div>
                          <div className="font-medium text-gray-700">
                            {Math.floor(Math.random() * 30) + 70}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Other tabs would be implemented similarly */}
          <TabsContent value="commits">
            <Card>
              <CardHeader>
                <CardTitle>Commit History</CardTitle>
                <CardDescription>Recent code changes and contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-500">Commit history and detailed analysis will be displayed here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Task Analytics</CardTitle>
                <CardDescription>Analysis of task completion and assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-500">Task analytics and performance metrics will be displayed here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupAnalyzePage;
