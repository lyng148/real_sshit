import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ContributionScoreResponse } from '@/types/contribution';
import contributionScoreService from '@/services/contributionScoreService';
import ContributionDetailsDialog from './ContributionDetailsDialog';
import { useAuth } from '@/contexts/AuthContext';

interface ContributionTabProps {
  projectId: number;
}

const ContributionTab: React.FC<ContributionTabProps> = ({ projectId }) => {
  const [contributions, setContributions] = useState<ContributionScoreResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { currentUser } = useAuth();
  
  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');
  const canModifyScores = isAdmin || isInstructor;

  useEffect(() => {
    const fetchContributions = async () => {
      setIsLoading(true);
      try {
        const response = await contributionScoreService.getScoresByProject(projectId);
        if (response.success) {
          setContributions(response.data);
        } else {
          setError(response.message || 'Failed to fetch contributions');
        }
      } catch (err) {
        setError('Error fetching contribution data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributions();
  }, [projectId]);

  const chartData = contributions.map(contribution => ({
    name: contribution.fullName,
    score: contribution.adjustedScore || contribution.calculatedScore
  }));

  const handleSuccessfulUpdate = (updatedScore: ContributionScoreResponse) => {
    // Update the local state with the updated score
    setContributions(prevScores => 
      prevScores.map(score => 
        score.id === updatedScore.id ? updatedScore : score
      )
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading contribution data...</div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-800 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Contribution Scores</CardTitle>
          <CardDescription>
            Overview of contribution scores for all students in this project
          </CardDescription>
        </CardHeader>
        <CardContent>          {chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}`, 'Score']} />
                  <Bar 
                    dataKey="score" 
                    name="Contribution Score"
                    fill="#3B82F6"isAnimationActive={true}
                    animationDuration={1000}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} 
                        fill={entry.score >= 80 ? '#10B981' : entry.score >= 50 ? '#F59E0B' : '#EF4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No contribution data available</p>
          )}

          <div className="mt-6 flex justify-between">            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs">High (≥80)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                <span className="text-xs">Medium (≥50)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-xs">Low (&lt;50)</span>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              View Detailed Scores
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contribution details dialog */}
      <ContributionDetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        contributions={contributions}
        canModifyScores={canModifyScores}
        onScoreUpdated={handleSuccessfulUpdate}
        projectId={projectId}
      />
    </div>
  );
};

export default ContributionTab;
