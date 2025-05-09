import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectStatisticsResponse } from '@/types/statistics';
import projectService from '@/services/projectService';
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
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectAnalyzePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [statistics, setStatistics] = useState<ProjectStatisticsResponse | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  // Fetch project statistics
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setProgress(0);
        setAnalyzing(true);
        let fakeProgress = 0;
        interval = setInterval(() => {
          fakeProgress += Math.random() * 5 + 1;
          if (fakeProgress < 90) {
            setProgress(Math.floor(fakeProgress));
          } else {
            setProgress(90);
            clearInterval(interval!);
          }
        }, 300);
        timeout = setTimeout(() => {
          setAnalyzing(false);
          setLoading(false);
          setProgress(100);
          clearInterval(interval!);
          toast({
            title: "Timeout",
            description: "Phân tích quá lâu, vui lòng thử lại sau.",
            variant: "destructive",
          });
        }, 30000);
        const response = await projectService.getProjectStatistics(Number(projectId));
        if (timeout) clearTimeout(timeout);
        if (interval) clearInterval(interval);
        setProgress(100);
        setAnalyzing(false);
        if (response.success) {
          setStatistics(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load project statistics",
            variant: "destructive",
          });
        }
      } catch (error) {
        setAnalyzing(false);
        setProgress(100);
        if (interval) clearInterval(interval);
        if (timeout) clearTimeout(timeout);
        console.error("Error fetching project statistics:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [projectId, toast]);

  const taskStatusData = statistics?.taskStatistics ? [
    { name: 'Not Started', value: statistics.taskStatistics.tasksByStatus.notStarted },
    { name: 'In Progress', value: statistics.taskStatistics.tasksByStatus.inProgress },
    { name: 'Completed', value: statistics.taskStatistics.tasksByStatus.completed },
  ] : [];

  const taskDifficultyData = statistics?.taskStatistics ? [
    { name: 'Easy', value: statistics.taskStatistics.tasksByDifficulty.easy },
    { name: 'Medium', value: statistics.taskStatistics.tasksByDifficulty.medium },
    { name: 'Hard', value: statistics.taskStatistics.tasksByDifficulty.hard },
  ] : [];

  const activityData = statistics?.timeStatistics?.weeklyActivity || [];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Project Analysis</h1>
            <p className="text-gray-600">Analytics and statistics for the entire project</p>
          </div>

          {analyzing && (
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <span className="font-medium text-blue-700 animate-pulse">Analyzing...</span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="w-12 text-right text-sm text-gray-700">{progress}%</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-3/4 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
                <TabsTrigger value="pressure">Pressure Score</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Total Groups</CardTitle>
                      <CardDescription>Active project groups</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{statistics?.projectSummary.totalGroups}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Total Students</CardTitle>
                      <CardDescription>Enrolled in the project</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{statistics?.projectSummary.totalStudents}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Completion Rate</CardTitle>
                      <CardDescription>Overall project progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{statistics?.projectSummary.completionRate}%</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Activity</CardTitle>
                      <CardDescription>Tasks and commits by week</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={activityData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" label={{ value: 'Week', position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value) => [`${value}`, '']} />
                            <Legend />
                            <Bar name="Tasks" dataKey="taskCount" fill="#1E40AF" />
                            <Bar name="Commits" dataKey="commitCount" fill="#60A5FA" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Status Distribution</CardTitle>
                      <CardDescription>Current status of all tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={taskStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {taskStatusData.map((entry, index) => {
                                const colors = ['#EF4444', '#F59E0B', '#10B981'];
                                return <Sector key={`cell-${index}`} fill={colors[index % colors.length]} />;
                              })}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} tasks`, name]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Total Tasks</CardTitle>
                      <CardDescription>All project tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{statistics?.taskStatistics.totalTasks}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Average Completion Time</CardTitle>
                      <CardDescription>From start to completion</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{statistics?.taskStatistics.avgCompletionTime}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>On-Time Completion</CardTitle>
                      <CardDescription>Tasks completed before deadline</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{statistics?.taskStatistics.onTimeCompletionRate}%</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Task Difficulty Breakdown</CardTitle>
                    <CardDescription>Distribution of task difficulty levels</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={taskDifficultyData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar name="Tasks" dataKey="value" fill="#3B82F6">
                            {taskDifficultyData.map((entry, index) => {
                              const colors = ['#22C55E', '#F59E0B', '#EF4444'];
                              return <Sector key={`cell-${index}`} fill={colors[index % colors.length]} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="contributions" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Average Score</CardTitle>
                      <CardDescription>Mean contribution score</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{statistics?.contributionStatistics.avgContributionScore.toFixed(1)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Highest Score</CardTitle>
                      <CardDescription>Top contribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{statistics?.contributionStatistics.groupDistribution.max.toFixed(1)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Free-Rider Alerts</CardTitle>
                      <CardDescription>Students below threshold</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{statistics?.contributionStatistics.freeRiderCount}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Contributors</CardTitle>
                    <CardDescription>Students with highest scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {statistics?.contributionStatistics.topContributors.map((contributor, index) => (
                        <li key={index} className="flex justify-between items-center p-2 border-b">
                          <span className="font-medium">{contributor.studentId}</span>
                          <span className="text-green-600 font-bold">{contributor.score.toFixed(1)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Low Contributors</CardTitle>
                    <CardDescription>Students that need support</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {statistics?.contributionStatistics.lowContributors.map((contributor, index) => (
                        <li key={index} className="flex justify-between items-center p-2 border-b">
                          <span className="font-medium">{contributor.studentId}</span>
                          <span className="text-red-600 font-bold">{contributor.score.toFixed(1)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pressure" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Average Pressure Score</CardTitle>
                      <CardDescription>Mean workload pressure</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{statistics?.pressureScoreAnalysis.avgPressureScore}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>High Pressure Count</CardTitle>
                      <CardDescription>Students above threshold</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{statistics?.pressureScoreAnalysis.highPressureCount}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Pressure Score Trend</CardTitle>
                    <CardDescription>Weekly pressure score average</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={statistics?.pressureScoreAnalysis.pressureTrend || []}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" label={{ value: 'Week', position: 'insideBottom', offset: -5 }} />
                          <YAxis label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [`${value}`, 'Pressure Score']} />
                          <Line
                            type="monotone"
                            name="Pressure Score"
                            dataKey="avgScore"
                            stroke="#EF4444"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalyzePage;