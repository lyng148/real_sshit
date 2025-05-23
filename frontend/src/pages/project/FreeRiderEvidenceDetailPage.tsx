import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { usePeerReviewService, FreeRiderEvidence } from '@/services/peerReviewService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import userService from '@/services/userService';
import projectService from '@/services/projectService';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, AlertTriangle, CheckCircle2, Clock, GitBranch, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FreeRiderEvidenceDetailPage = () => {
  const { projectId, userId } = useParams();
  const navigate = useNavigate();
  const peerReviewService = usePeerReviewService();
  const { toast } = useToast();
  
  const [evidence, setEvidence] = useState<FreeRiderEvidence | null>(null);
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAsFreeRider, setMarkingAsFreeRider] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the evidence data
        if (projectId && userId) {
          const parsedProjectId = parseInt(projectId, 10);
          const parsedUserId = parseInt(userId, 10);
          
          // Fetch in parallel
          const [evidenceData, userData, projectData] = await Promise.all([
            peerReviewService.getFreeRiderEvidence(parsedProjectId, parsedUserId),
            userService.getUserById(parsedUserId),
            projectService.getProjectById(parsedProjectId)
          ]);
          
          setEvidence(evidenceData);
          
          if (userData.success) {
            setUser(userData.data);
          }
          
          if (projectData.success) {
            setProject(projectData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching evidence:', error);
        setError('Failed to load free-rider evidence data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, userId]);
  const getRiskLevel = (percentageBelowAverage) => {
    if (percentageBelowAverage >= 70) return { level: 'High', color: 'destructive' };
    if (percentageBelowAverage >= 40) return { level: 'Medium', color: 'warning' };
    return { level: 'Low', color: 'success' };
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleMarkAsFreeRider = async () => {
    if (!projectId || !userId) return;
    
    try {
      setMarkingAsFreeRider(true);
      const parsedProjectId = parseInt(projectId, 10);
      const parsedUserId = parseInt(userId, 10);
      
      const result = await peerReviewService.createFreeRiderCase(parsedProjectId, parsedUserId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "User has been marked as a free rider and a case has been created.",
          variant: "success"
        });
        
        // Navigate to the case management tab
        navigate(`/projects/${projectId}/free-rider-detection`);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to mark user as free rider.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error marking user as free rider:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred while creating the case.",
        variant: "destructive"
      });
    } finally {
      setMarkingAsFreeRider(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-10 w-1/2 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64 mt-6" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 p-4 rounded-md">
              <h2 className="text-lg font-medium text-red-800">Error</h2>
              <p className="mt-2 text-red-700">{error}</p>
              <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mr-4">
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-2xl font-bold">Chi tiết Bằng chứng Free-Rider</h1>
          </div>
          
          {user && project && evidence && (
            <>
              <div className="flex flex-col md:flex-row mb-6 gap-4">
                <Card className="md:w-1/3">
                  <CardHeader>
                    <CardTitle>Thông tin Sinh viên</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.avatarUrl} alt={user.username} />
                      <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold mt-2">{user.firstName} {user.lastName}</h3>
                    <p className="text-gray-500">{user.email}</p>
                    <Badge 
                      variant={getRiskLevel(evidence.percentageBelowAverage).color}
                      className="mt-2"
                    >
                      Mức độ rủi ro: {getRiskLevel(evidence.percentageBelowAverage).level}
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card className="md:w-2/3">
                  <CardHeader>
                    <CardTitle>Thống kê Đóng góp</CardTitle>
                    <CardDescription>Dự án: {project.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Điểm đóng góp</span>
                          <span className="text-sm font-medium">{evidence.calculatedScore.toFixed(2)} / {evidence.groupAverageScore.toFixed(2)}</span>
                        </div>
                        <Progress value={evidence.calculatedScore / evidence.groupAverageScore * 100} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {evidence.percentageBelowAverage.toFixed(1)}% thấp hơn điểm trung bình nhóm
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-100 p-3 rounded-md">
                          <div className="flex justify-between">
                            <span className="text-xs">Task đã hoàn thành</span>
                            <Badge variant="outline">{evidence.taskEvidence.completedTasks}/{evidence.taskEvidence.totalTasks}</Badge>
                          </div>
                          <Progress value={evidence.taskEvidence.completionPercentage} className="h-1 mt-2" />
                        </div>
                        
                        <div className="bg-gray-100 p-3 rounded-md">
                          <div className="flex justify-between">
                            <span className="text-xs">Số lượng commit</span>
                            <Badge variant="outline">{evidence.commitEvidence.totalCommits}</Badge>
                          </div>
                          <Progress value={evidence.commitEvidence.percentageOfGroupAverage} className="h-1 mt-2" />
                        </div>
                        
                        <div className="bg-gray-100 p-3 rounded-md">
                          <div className="flex justify-between">
                            <span className="text-xs">Đánh giá từ đồng đội</span>
                            <Badge variant="outline">{evidence.peerReviewEvidence.averageRating.toFixed(1)}/5</Badge>
                          </div>
                          <Progress value={evidence.peerReviewEvidence.averageRating / 5 * 100} className="h-1 mt-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tasks">
                    <Clock className="h-4 w-4 mr-2" /> Tasks
                  </TabsTrigger>
                  <TabsTrigger value="commits">
                    <GitBranch className="h-4 w-4 mr-2" /> Commits
                  </TabsTrigger>
                  <TabsTrigger value="reviews">
                    <MessageSquare className="h-4 w-4 mr-2" /> Peer Reviews
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="tasks" className="p-4 border rounded-md mt-2">
                  <h3 className="text-lg font-bold mb-3">Chi tiết công việc</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Hoàn thành: {evidence.taskEvidence.completedTasks}/{evidence.taskEvidence.totalTasks} tasks</p>
                        <p className="text-sm text-gray-500">Tỷ lệ hoàn thành: {evidence.taskEvidence.completionPercentage}%</p>
                      </div>
                      <Badge variant={evidence.taskEvidence.completionPercentage < 50 ? "destructive" : "outline"}>
                        {evidence.taskEvidence.lateTasks} task trễ hạn
                      </Badge>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-sm">Không có dữ liệu chi tiết về task. Vui lòng kiểm tra trong task manager.</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="commits" className="p-4 border rounded-md mt-2">
                  <h3 className="text-lg font-bold mb-3">Hoạt động trên GitHub</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Tổng số commit: {evidence.commitEvidence.totalCommits}</p>
                        <p className="text-sm text-gray-500">Chiếm {evidence.commitEvidence.percentageOfGroupAverage}% so với trung bình nhóm</p>
                      </div>
                      <Badge variant={evidence.commitEvidence.percentageOfGroupAverage < 30 ? "destructive" : "outline"}>
                        Đóng góp thấp
                      </Badge>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-sm">Không có dữ liệu chi tiết về commit. Vui lòng kiểm tra trên GitHub.</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="p-4 border rounded-md mt-2">
                  <h3 className="text-lg font-bold mb-3">Đánh giá từ thành viên khác</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Điểm đánh giá trung bình: {evidence.peerReviewEvidence.averageRating.toFixed(1)}/5</p>
                        <p className="text-sm text-gray-500">Nhận {evidence.peerReviewEvidence.lowRatingCount} đánh giá thấp</p>
                      </div>
                      <Badge variant={evidence.peerReviewEvidence.averageRating < 3 ? "destructive" : "outline"}>
                        {evidence.peerReviewEvidence.averageRating < 3 ? "Đánh giá tiêu cực" : "Đánh giá trung bình"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Phản hồi từ đồng nghiệp:</h4>
                      {evidence.peerReviewEvidence.feedback.map((feedback, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded border">
                          <p className="text-sm italic">"{feedback}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
                <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleMarkAsFreeRider}
                  disabled={markingAsFreeRider}
                >
                  {markingAsFreeRider ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" /> Mark as Free-Rider
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeRiderEvidenceDetailPage;
