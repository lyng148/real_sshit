import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Line, LineChart, Legend 
} from 'recharts';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { usePeerReviewService } from '@/services/peerReviewService';
import { Progress } from '@/components/ui/progress';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const FreeRiderEvidenceDisplay = ({ projectId, groupId }) => {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [evidence, setEvidence] = useState(null);
  const [freeRiders, setFreeRiders] = useState([]);
  const [riskScores, setRiskScores] = useState({});
  const peerReviewService = usePeerReviewService();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingProgress(10);
        
        // Load free riders data
        const freeRidersData = await peerReviewService.detectFreeRiders(projectId);
        setLoadingProgress(30);
        
        // Load risk scores data
        const riskScoresData = await peerReviewService.getFreeRiderRiskScores(projectId);
        setLoadingProgress(60);
        
        // Load evidence data
        const evidenceData = await peerReviewService.getFreeRiderGroupEvidence(projectId, groupId);
        setLoadingProgress(90);
        
        console.log('Free Riders:', freeRidersData);
        console.log('Evidence Data:', evidenceData);
        console.log('Weekly Contribution Data:', evidenceData.weeklyContribution);
        
        setFreeRiders(freeRidersData);
        setRiskScores(riskScoresData);
        setEvidence(evidenceData);
        setLoadingProgress(100);
      } catch (error) {
        console.error('Error fetching free-rider evidence:', error);
        setFreeRiders([]);
        setEvidence(null);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500); // Small delay to ensure progress bar shows 100% before hiding
      }
    };
 
    if (projectId) {
      fetchData();
    }
  }, [projectId, groupId]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Progress value={loadingProgress} className="w-full max-w-md" />
        <p className="text-center text-gray-600">Loading evidence data... {loadingProgress}%</p>
      </div>
    );
  }

  if (!evidence) {
    return (
      <Alert className="bg-yellow-50">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertTitle>Unable to load evidence</AlertTitle>
        <AlertDescription>
          An error occurred while loading evidence data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Tạo dữ liệu cho biểu đồ tròn
  const contributionPieData = evidence.groupMembers.map(member => ({
    name: member.name,
    value: member.contributionScore,
    isFreeRider: member.isFreeRider
  }));
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Free Rider Detection Evidence</h2>
      
      {freeRiders.length === 0 ? (
        <Alert className="bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle>No free riders detected</AlertTitle>
          <AlertDescription>
            Currently, no free riders have been detected in this group.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle>Detected {freeRiders.length} potential free riders</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {freeRiders.map(user => (
                <div key={user.id} className="flex items-center">                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.fullName}</span>
                  <Badge 
                    variant="destructive"
                    className="ml-2"
                  >
                    Risk Score: {riskScores[user.id] ? Math.round(riskScores[user.id] * 100) : '—'}%
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart: Contribution scores */}
        <Card>
          <CardHeader>
            <CardTitle>Member Contribution Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contributionPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {contributionPieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isFreeRider ? '#ff0000' : COLORS[index % COLORS.length]} 
                        stroke={entry.isFreeRider ? '#aa0000' : '#fff'}
                        strokeWidth={entry.isFreeRider ? 2 : 1}
                      />
                    ))}
                  </Pie>                  <Tooltip formatter={(value) => [`${value.toFixed(1)}`, 'Contribution Score']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar chart: Task completion */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={evidence.taskCompletionStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
                  <Legend />                  <Bar dataKey="percentage" name="Completion Rate" fill="#8884d8">
                    {evidence.taskCompletionStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.percentage < 30 ? '#ff0000' : '#8884d8'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar chart: Commits */}
        <Card>
          <CardHeader>
            <CardTitle>Commit Count and Group Average Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={evidence.commitStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="commits" name="Number of commits" fill="#8884d8">
                    {evidence.commitStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.commits < 10 ? '#ff0000' : '#8884d8'} 
                      />
                    ))}
                  </Bar>                  <Bar yAxisId="right" dataKey="percentage" name="% of group average" fill="#82ca9d">
                    {evidence.commitStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.percentage < 30 ? '#ff0000' : '#82ca9d'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar chart: Peer reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Peer Review Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={evidence.peerReviewStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}/5`, 'Rating']} />
                  <Legend />
                  <Bar dataKey="rating" name="Average review rating" fill="#8884d8">
                    {evidence.peerReviewStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.rating < 3 ? '#ff0000' : '#8884d8'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>        {/* Line chart: Contribution over time */}        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contribution Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {!evidence.weeklyContribution || evidence.weeklyContribution.length === 0 ? (
              <div className="flex items-center justify-center h-80 bg-gray-50 border border-gray-200 rounded-md">
                <div className="text-center p-6">
                  <p className="text-gray-500 mb-2">No time-series data available</p>
                  <p className="text-sm text-gray-400">Weekly contribution data for this group has not been recorded yet</p>
                </div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={evidence.weeklyContribution}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {evidence.groupMembers.map((member, index) => (
                      <Line 
                        key={member.id}
                        type="monotone" 
                        dataKey={member.name} 
                        stroke={member.isFreeRider ? '#ff0000' : COLORS[index % COLORS.length]} 
                        strokeWidth={member.isFreeRider ? 3 : 2}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreeRiderEvidenceDisplay;
