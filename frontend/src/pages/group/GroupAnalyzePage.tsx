import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
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

const GroupAnalyzePage: React.FC = () => {
  const { groupId, projectId } = useParams<{ groupId: string, projectId: string }>();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [statistics, setStatistics] = useState<GroupStatisticsResponse | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');

  // Fetch group statistics
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
          fakeProgress += Math.random() * 5 + 1; // tăng ngẫu nhiên 1-6%
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
        }, 30000); // 30s
        const response = await projectService.getGroupStatistics(Number(groupId));
        if (timeout) clearTimeout(timeout);
        if (interval) clearInterval(interval);
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
      } catch (error) {
        setAnalyzing(false);
        setProgress(100);
        if (interval) clearInterval(interval);
        if (timeout) clearTimeout(timeout);
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
    fetchStatistics();
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [groupId, toast]);

  // Fetch all groups for admin/instructor
  useEffect(() => {
    if ((isAdmin || isInstructor) && projectId) {
      groupService.getAllGroups(Number(projectId)).then(res => {
        if (res.success) setAllGroups(res.data || []);
      });
    }
  }, [isAdmin, isInstructor, projectId]);

  const taskStatusData = statistics?.taskStatistics ? [
    { name: 'Not Started', value: statistics.taskStatistics.tasksByStatus.notStarted },
    { name: 'In Progress', value: statistics.taskStatistics.tasksByStatus.inProgress },
    { name: 'Completed', value: statistics.taskStatistics.tasksByStatus.completed },
  ] : [];

  const contributionData = statistics?.memberContributions?.map(member => ({
    name: member.name,
    contribution: member.contributionScore
  })) || [];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
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
                  &#60;
                </button>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={groupId}
                  onChange={e => navigate(`/projects/${projectId}/groups/${e.target.value}/analyze`)}
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
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
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
                                member.contributionScore >= 80 ? 'text-green-600' : 
                                member.contributionScore >= 50 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {member.contributionScore}
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
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar name="Contribution Score" dataKey="contribution" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Contribution Score Factors</CardTitle>
                    <CardDescription>Breakdown of factors contributing to scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Task Completion</TableHead>
                          <TableHead>Peer Review</TableHead>
                          <TableHead>Commits</TableHead>
                          <TableHead>Late Tasks</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statistics?.memberContributions?.map((member, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.contributionFactors.taskCompletion}</TableCell>
                            <TableCell>{member.contributionFactors.peerReview}</TableCell>
                            <TableCell>{member.contributionFactors.commitCount}</TableCell>
                            <TableCell>{member.contributionFactors.lateTaskCount}</TableCell>
                            <TableCell className="font-bold">{member.contributionScore}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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

export default GroupAnalyzePage;
