import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupStatisticsResponse } from '@/types/statistics';
import projectService from '@/services/projectService';
import groupService, { Group } from '@/services/groupService';
import { useAuth } from '@/contexts/AuthContext';
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
import { pressureScoreService } from '@/services/pressureScoreService';
import { PressureScoreResponse } from '@/types/pressure';
import { PressureStatus } from '@/types/enums';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Helper functions for pressure status display
const getPressureStatusColor = (status: PressureStatus) => {
  switch (status) {
    case PressureStatus.SAFE:
      return 'bg-green-100 text-green-800 border-green-200';
    case PressureStatus.AT_RISK:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case PressureStatus.OVERLOADED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPressureStatusText = (status: PressureStatus) => {
  switch (status) {
    case PressureStatus.SAFE:
      return 'Safe';
    case PressureStatus.AT_RISK:
      return 'At Risk';
    case PressureStatus.OVERLOADED:
      return 'Overloaded';
    default:
      return 'Unknown';
  }
};

const GroupAnalyzePage: React.FC = () => {
  const { groupId, projectId } = useParams<{ groupId: string, projectId: string }>();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [statistics, setStatistics] = useState<GroupStatisticsResponse | null>(null);  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [pressureScores, setPressureScores] = useState<PressureScoreResponse[]>([]);
  const [loadingPressureScores, setLoadingPressureScores] = useState<boolean>(false);
  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');

  // Calculate pressure score metrics
  const avgPressureScore = pressureScores.length > 0 
    ? (pressureScores.reduce((sum, score) => sum + score.pressureScore, 0) / pressureScores.length).toFixed(2) 
    : '0';
  const safeCount = pressureScores.filter(score => score.status === PressureStatus.SAFE).length;
  const atRiskCount = pressureScores.filter(score => score.status === PressureStatus.AT_RISK).length;
  const overloadedCount = pressureScores.filter(score => score.status === PressureStatus.OVERLOADED).length;

  // Prepare data for pressure distribution chart
  const pressureDistributionData = [
    { name: 'Safe', value: safeCount },
    { name: 'At Risk', value: atRiskCount },
    { name: 'Overloaded', value: overloadedCount },
  ];

  // Fetch group statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setProgress(25); // Start with 25% to indicate request is being made
        setAnalyzing(true);
        
        // Set a timeout for the API call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 30000); // 30s timeout
        
        try {
          // Increase progress to show request is in progress
          setProgress(50);
          
          // Make the API call with abort signal
          const response = await projectService.getGroupStatistics(Number(groupId));
          
          // API call successful, update progress
          setProgress(100);
          setAnalyzing(false);
          
          if (response.success) {
            setStatistics(response.data);
          } else {
            toast({
              title: "Error",
              description: response.message || "Failed to load group statistics",
              variant: "destructive",
            });
          }
          
          // Clear the timeout since the API call is complete
          clearTimeout(timeoutId);
        } catch (apiError) {
          if (apiError.name === 'AbortError') {
            toast({
              title: "Timeout",
              description: "Phân tích quá lâu, vui lòng thử lại sau.",
              variant: "destructive",
            });
          } else {
            throw apiError; // Re-throw for the outer catch block
          }
        }
      } catch (error: any) {
        setAnalyzing(false);
        setProgress(100);
        console.error("Error fetching group statistics:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "An unexpected error occurred while loading statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, [groupId, toast]);

  // Fetch all groups for admin/instructor
  useEffect(() => {
    if ((isAdmin || isInstructor) && projectId) {
      groupService.getAllGroups(Number(projectId)).then(res => {
        if (res.success) setAllGroups(res.data || []);
      });
    }  }, [isAdmin, isInstructor, projectId]);

  // Fetch pressure scores for the group
  useEffect(() => {
    if (groupId) {
      const fetchPressureScores = async () => {
        try {
          setLoadingPressureScores(true);
          const data = await pressureScoreService.getGroupPressureScores(Number(groupId));
          setPressureScores(data);
        } catch (error: any) {
          console.error("Error fetching pressure scores:", error);
          toast({
            title: "Error",
            description: error.response?.data?.message || error.message || "Failed to load pressure scores",
            variant: "destructive",
          });
        } finally {
          setLoadingPressureScores(false);
        }
      };
      fetchPressureScores();
    }
  }, [groupId, toast]);

  const taskStatusData = statistics?.taskStatistics ? [
    { name: 'Not Started', value: statistics.taskStatistics.tasksByStatus.notStarted },
    { name: 'In Progress', value: statistics.taskStatistics.tasksByStatus.inProgress },
    { name: 'Completed', value: statistics.taskStatistics.tasksByStatus.completed },
  ] : [];
  const contributionData = statistics?.memberContributions?.map(member => ({
    name: member.name,
    contribution: member.contributionScore  })) || [];

  return (
    <div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Group Analysis</h1>
              <p className="text-gray-600">Analytics and statistics for this project group</p>
            </div>
            {(isAdmin || isInstructor) && allGroups.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  className="border rounded px-2 py-1 text-sm bg-white disabled:opacity-50"
                  disabled={allGroups.findIndex(g => String(g.id) === String(groupId)) === 0}
                  onClick={() => {
                    const idx = allGroups.findIndex(g => String(g.id) === String(groupId));
                    if (idx > 0) {
                      navigate(`/projects/${projectId}/groups/${allGroups[idx - 1].id}/analyze`);
                    }
                  }}
                >
                  &#60;                </button>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={groupId}
                  onChange={e => navigate(`/projects/${projectId}/groups/${e.target.value}/analyze`)}
                  aria-label="Select group"
                  title="Select group"
                >
                  {allGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <button
                  className="border rounded px-2 py-1 text-sm bg-white disabled:opacity-50"
                  disabled={allGroups.findIndex(g => String(g.id) === String(groupId)) === allGroups.length - 1}
                  onClick={() => {
                    const idx = allGroups.findIndex(g => String(g.id) === String(groupId));
                    if (idx < allGroups.length - 1) {
                      navigate(`/projects/${projectId}/groups/${allGroups[idx + 1].id}/analyze`);
                    }
                  }}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>

          {analyzing && (
            <div className="mb-6">
              <div className="flex items-center gap-4">                <span className="font-medium text-blue-700 animate-pulse">Analyzing...</span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <Progress value={progress} className="h-3" />
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
                <TabsTrigger value="overview">Overview</TabsTrigger>                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
                <TabsTrigger value="pressure">Pressure Scores</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Group Name</CardTitle>
                      <CardDescription>Active project group</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics?.groupInfo.name}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Total Members</CardTitle>
                      <CardDescription>Students in group</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics?.groupInfo.memberCount}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Completion Rate</CardTitle>
                      <CardDescription>Overall task progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics?.taskStatistics.completionRate}%</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Group Activity</CardTitle>
                    <CardDescription>Weekly task completion and commits</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statistics?.timeStatistics?.weeklyActivity || []}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar name="Tasks" dataKey="taskCount" fill="#1E40AF" />
                          <Bar name="Commits" dataKey="commitCount" fill="#60A5FA" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tasks" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Total Tasks</CardTitle>
                      <CardDescription>All group tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics?.taskStatistics.totalTasks}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Average Completion Time</CardTitle>
                      <CardDescription>From start to completion</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics?.taskStatistics.avgCompletionTime}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>On-Time Completion</CardTitle>
                      <CardDescription>Tasks completed before deadline</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics?.taskStatistics.onTimeCompletionRate}%</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Task Status</CardTitle>
                    <CardDescription>Current status of tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Tasks</CardTitle>
                    <CardDescription>Latest tasks in the group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Assignee</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Deadline</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statistics?.recentTasks?.map((task, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{task.title}</TableCell>
                            <TableCell>{task.assigneeName}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {task.status}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(task.deadline).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="members" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Group Members</CardTitle>
                    <CardDescription>All members in this group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Completed Tasks</TableHead>
                          <TableHead>Contribution Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statistics?.memberContributions?.map((member, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.isLeader ? 'Leader' : 'Member'}</TableCell>
                            <TableCell>{member.completedTasks}</TableCell>
                            <TableCell>
                              <span className={`font-medium ${
                                member.contributionScore >= 7 ? 'text-green-600' : 
                                member.contributionScore >= 4 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {member.contributionScore.toFixed(1)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Task Distribution</CardTitle>
                    <CardDescription>Assignment of tasks to members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statistics?.memberContributions?.map(member => ({
                            name: member.name,
                            tasks: member.completedTasks,
                            inProgress: member.inProgressTasks,
                            notStarted: member.notStartedTasks
                          }))}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar name="Completed" dataKey="tasks" stackId="a" fill="#10B981" />
                          <Bar name="In Progress" dataKey="inProgress" stackId="a" fill="#F59E0B" />
                          <Bar name="Not Started" dataKey="notStarted" stackId="a" fill="#EF4444" />
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
                      <div className="text-2xl font-bold">{statistics?.contributionStatistics.avgContributionScore}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Highest Score</CardTitle>
                      <CardDescription>Top contribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics?.contributionStatistics.highestScore}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Lowest Score</CardTitle>
                      <CardDescription>Lowest contribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics?.contributionStatistics.lowestScore}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Member Contribution Scores</CardTitle>
                    <CardDescription>Relative contribution of each member</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={contributionData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                          <YAxis domain={[0, 10]} />
                          <Tooltip formatter={(value) => [`${value.toFixed(1)}`, 'Normalized Score (0-10)']} />
                          <Legend />
                          <Bar name="Normalized Contribution Score" dataKey="contribution" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Contribution Score Factors</CardTitle>
                    <CardDescription>Breakdown of factors contributing to scores (0-10 scale)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Task Completion</TableHead>
                          <TableHead>Peer Review</TableHead>
                          <TableHead>Code Score</TableHead>
                          <TableHead>Late Tasks</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statistics?.memberContributions?.map((member, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.contributionFactors.taskCompletion.toFixed(1)}</TableCell>
                            <TableCell>{member.contributionFactors.peerReview.toFixed(1)}</TableCell>
                            <TableCell>{member.contributionFactors.codeContributionScore.toFixed(1)}</TableCell>
                            <TableCell>{member.contributionFactors.lateTaskCount}</TableCell>
                            <TableCell className="font-bold">{member.contributionScore.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pressure" className="space-y-6">
                {loadingPressureScores ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="ml-2 text-lg text-gray-600">Loading pressure scores...</span>
                  </div>
                ) : pressureScores.length === 0 ? (
                  <Card>
                    <CardContent className="flex justify-center items-center h-32">
                      <p className="text-gray-500">No pressure score data available</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle>Average Pressure Score</CardTitle>
                          <CardDescription>Mean workload pressure</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{avgPressureScore}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle>At Risk Members</CardTitle>
                          <CardDescription>Members approaching threshold</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{atRiskCount}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle>Overloaded Members</CardTitle>
                          <CardDescription>Members exceeding threshold</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{overloadedCount}</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Pressure Status Distribution</CardTitle>
                        <CardDescription>Members by pressure level</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pressureDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {pressureDistributionData.map((entry, index) => {
                                  const colors = ['#10B981', '#F59E0B', '#EF4444'];
                                  return <Sector key={`cell-${index}`} fill={colors[index]} />;
                                })}
                              </Pie>
                              <Tooltip formatter={(value, name) => [`${value} members`, name]} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Member Pressure Scores</CardTitle>
                        <CardDescription>Detailed pressure metrics for each member</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Member</TableHead>
                              <TableHead>Tasks</TableHead>
                              <TableHead>Pressure Score</TableHead>
                              <TableHead>% of Threshold</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pressureScores.map((score) => (
                              <TableRow key={score.userId}>
                                <TableCell className="font-medium">{score.fullName}</TableCell>
                                <TableCell>{score.taskCount}</TableCell>
                                <TableCell>{score.pressureScore.toFixed(2)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress 
                                      value={score.thresholdPercentage} 
                                      className={`h-2 ${
                                        score.status === PressureStatus.OVERLOADED 
                                          ? 'bg-red-200' 
                                          : score.status === PressureStatus.AT_RISK 
                                            ? 'bg-yellow-200' 
                                            : 'bg-green-200'
                                      }`}
                                    />
                                    <span>{score.thresholdPercentage.toFixed(0)}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getPressureStatusColor(score.status)}>
                                    {getPressureStatusText(score.status)}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupAnalyzePage;

