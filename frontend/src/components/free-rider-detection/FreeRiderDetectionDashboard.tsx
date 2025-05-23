import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { usePeerReviewService } from '@/services/peerReviewService';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const FreeRiderDetectionDashboard = ({ projectId }) => {
  const [freeRiders, setFreeRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [riskScores, setRiskScores] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const peerReviewService = usePeerReviewService();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingProgress(20);
        
        // Load free riders data
        const freeRidersData = await peerReviewService.detectFreeRiders(projectId);
        setLoadingProgress(40);
        
        // Load risk scores data
        const riskScoresData = await peerReviewService.getFreeRiderRiskScores(projectId);
        setLoadingProgress(60);
          // Get active free rider cases to filter out users who already have cases
        const freeRiderCasesResponse = await peerReviewService.getFreeRiderCases(projectId);
        console.log('Free Rider Cases:', freeRiderCasesResponse);
        const freeRiderCases = Array.isArray(freeRiderCasesResponse) 
          ? freeRiderCasesResponse 
          : (freeRiderCasesResponse?.data || []);
          
        setLoadingProgress(80);
        
        // Filter out users who already have active cases or were resolved recently
        const activeUserIds = new Set(
          freeRiderCases
            .filter(frCase => frCase.status !== 'resolved')
            .map(frCase => frCase.student.id)
        );
        
        // Additional filtering: check if users can be detected again (not resolved within current month/week)
        const filteredFreeRiders = [];
        for (const user of freeRidersData) {
          if (!activeUserIds.has(user.id)) {
            const canBeDetected = await peerReviewService.canBeDetectedAgain(projectId, user.id);
            if (canBeDetected) {
              filteredFreeRiders.push(user);
            }
          }
        }
        
        setFreeRiders(filteredFreeRiders);
        setRiskScores(riskScoresData);
        setLoadingProgress(100);
        
        if (filteredFreeRiders.length > 0) {
          setSelectedUser(filteredFreeRiders[0]);
        }
      } catch (error) {
        console.error('Error fetching free-rider detection data:', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500); // Small delay to ensure progress bar shows 100% before hiding
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);
  const getRiskLevel = (score) => {
    if (score >= 0.7) return { level: 'High', color: 'destructive' };
    if (score >= 0.4) return { level: 'Medium', color: 'warning' };
    return { level: 'Low', color: 'success' };
  };
  
  // Navigate to detailed evidence page
  const viewEvidenceDetail = (userId) => {
    navigate(`/freerider-detection/evidence/${projectId}/${userId}`);
  };
  const handleTriggerDetection = async () => {
    if (isTriggering) return;
    
    try {
      setIsTriggering(true);
      await peerReviewService.triggerFreeRiderDetection(projectId);
      
      // Refresh the data
      const freeRidersData = await peerReviewService.detectFreeRiders(projectId);
      const riskScoresData = await peerReviewService.getFreeRiderRiskScores(projectId);
        // Get active free rider cases to filter out users who already have cases
      const freeRiderCasesResponse = await peerReviewService.getFreeRiderCases(projectId);
      const freeRiderCases = Array.isArray(freeRiderCasesResponse) 
        ? freeRiderCasesResponse 
        : (freeRiderCasesResponse?.data || []);
      
      // Filter out users who already have active cases or were resolved recently
      const activeUserIds = new Set(
        freeRiderCases
          .filter(frCase => frCase.status !== 'resolved')
          .map(frCase => frCase.student.id)
      );
      
      // Additional filtering: check if users can be detected again (not resolved within current month/week)
      const filteredFreeRiders = [];
      for (const user of freeRidersData) {
        if (!activeUserIds.has(user.id)) {
          const canBeDetected = await peerReviewService.canBeDetectedAgain(projectId, user.id);
          if (canBeDetected) {
            filteredFreeRiders.push(user);
          }
        }
      }
      
      setFreeRiders(filteredFreeRiders);
      setRiskScores(riskScoresData);
      
      if (filteredFreeRiders.length > 0 && !selectedUser) {
        setSelectedUser(filteredFreeRiders[0]);
      }
      
      // Show success message
      toast.success("Free rider detection completed and notifications sent (if any detected)");
    } catch (error) {
      console.error("Error triggering free rider detection:", error);
      toast.error("Error occurred while checking for free riders");
    } finally {
      setIsTriggering(false);
    }
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Progress className="w-full max-w-md" value={loadingProgress} />
        <p className="mt-2 text-center">Analyzing free rider detection data... {loadingProgress}%</p>
      </div>
    );
  }  return (

    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 mt-5">
        <h2 className="text-2xl font-bold">Free Rider Detection System</h2>
        <Button
          onClick={handleTriggerDetection}
          isLoading={isTriggering}
          className="
            relative inline-flex items-center justify-center overflow-hidden
            rounded-xl border border-white bg-black px-6 py-3
            font-semibold tracking-wide text-white shadow-sm
            transition-all duration-300 ease-out
            hover:bg-white hover:text-black hover:shadow-lg
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70
          "
        >
          Check for free riders now
        </Button>

      </div>
      
      {freeRiders.length === 0 ? (
        <Alert className="bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle>No free riders detected</AlertTitle>
          <AlertDescription>
            Currently, no free riders have been detected in this project.
            All members are contributing at a reasonable level.
          </AlertDescription>
        </Alert>
      ) : (        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Free Riders</CardTitle>
                <CardDescription>
                  Detected {freeRiders.length} members showing free-rider signs
                </CardDescription>
              </CardHeader>              
              <CardContent className="space-y-2">
                {freeRiders.map((user) => (
                  <div 
                    key={user.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 
                      ${selectedUser?.id === user.id ? 'bg-gray-100 border-l-4 border-primary' : ''}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <Avatar className="h-10 w-10 mr-2">
                      <AvatarImage src={user.avatarUrl} alt={user.username} />
                      <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Badge 
                      variant={getRiskLevel(riskScores[user.id] || 0).color}
                      className="ml-2"
                    >
                      {Math.round((riskScores[user.id] || 0) * 100)}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
              {selectedUser && (
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => viewEvidenceDetail(selectedUser.id)}
                  >                    <ExternalLink className="h-4 w-4 mr-2" />
                    View detailed evidence
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
          
          {selectedUser && (
            <div className="lg:col-span-3">
              <FreeRiderEvidence user={selectedUser} projectId={projectId} />            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FreeRiderEvidence = ({ user, projectId }) => {
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const peerReviewService = usePeerReviewService();  useEffect(() => {
    const fetchEvidence = async () => {      
      try {
        setLoading(true);
        setLoadingProgress(30);
        const evidenceData = await peerReviewService.getFreeRiderEvidence(projectId, user.id);
        setLoadingProgress(90);
        setEvidence(evidenceData);
        setLoadingProgress(100);
      } catch (error) {
        console.error('Error fetching free-rider evidence:', error);
        setEvidence(null);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500); // Small delay to ensure progress bar shows 100% before hiding
      }
    };

    if (user && projectId) {
      fetchEvidence();
    }
  }, [user, projectId]);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3">
        <Progress className="w-full max-w-md" value={loadingProgress} />
        <p className="text-center">Loading evidence... {loadingProgress}%</p>
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

  return (    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Free Rider Evidence - {user.firstName} {user.lastName}</CardTitle>
            <CardDescription>
              Analysis data about member's activities and contributions
            </CardDescription>
          </div>
          <Badge variant="destructive" className="text-lg">
            Risk Score: {Math.round(evidence.percentageBelowAverage)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="contribution">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contribution">Contribution Score</TabsTrigger>
            <TabsTrigger value="tasks">Task Completion</TabsTrigger>
            <TabsTrigger value="commits">Code Contribution</TabsTrigger>
            <TabsTrigger value="reviews">Peer Reviews</TabsTrigger>
          </TabsList>
            <TabsContent value="contribution" className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Contribution Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{evidence.calculatedScore.toFixed(2)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Group Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{evidence.groupAverageScore.toFixed(2)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Difference</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">-{evidence.percentageBelowAverage.toFixed(0)}%</div>
                </CardContent>
              </Card>
            </div>
              <div className="pt-4">
              <h3 className="text-lg font-semibold mb-2">Task Status</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm font-medium">{evidence.taskEvidence.completionPercentage}%</span>
                  </div>
                  <Progress value={evidence.taskEvidence.completionPercentage} className="h-2" />
                </div>
                
                <Alert variant="warning" className="bg-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <AlertTitle>Low Task Completion</AlertTitle>
                  <AlertDescription>
                    Member has only completed {evidence.taskEvidence.completedTasks}/{evidence.taskEvidence.totalTasks} assigned tasks,
                    including {evidence.taskEvidence.lateTasks} late tasks.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
            <TabsContent value="commits" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Code Contribution Statistics</CardTitle>
                <CardDescription>
                  Analysis of commit quantity and quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total commits:</span>
                  <span className="text-lg">{evidence.commitEvidence.totalCommits}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Relative to group average:</span>
                  <Badge variant="destructive">{evidence.commitEvidence.percentageOfGroupAverage}%</Badge>
                </div>
                
                <Alert className="bg-red-50 mt-4">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <AlertTitle>Low Code Contribution</AlertTitle>
                  <AlertDescription>
                    Member has only contributed {evidence.commitEvidence.percentageOfGroupAverage}% of commits compared to the group average.
                    This is one of the key indicators of a free rider.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
            <TabsContent value="reviews" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Peer Review Evaluations</CardTitle>
                <CardDescription>
                  Results from peer reviews in the group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Average rating:</span>
                  <div className="flex items-center">
                    <span className="text-lg font-bold mr-2">{evidence.peerReviewEvidence.averageRating}/5</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star}
                          className={`w-5 h-5 ${star <= Math.round(evidence.peerReviewEvidence.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Number of low ratings (≤ 2):</span>
                  <Badge variant="destructive">{evidence.peerReviewEvidence.lowRatingCount}</Badge>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Feedback from other members:</h4>
                  <div className="space-y-2">
                    {evidence.peerReviewEvidence.feedback.map((feedback, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="italic text-gray-700">"{feedback}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>      
      <CardFooter className="flex justify-between">
        <Button>Contact Member</Button>
      </CardFooter>
    </Card>
  );
};

export default FreeRiderDetectionDashboard;
