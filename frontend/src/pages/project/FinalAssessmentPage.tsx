import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Award,
  Download,
  Edit,
  FileText,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Save,
  Lock,
  Unlock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';
import finalAssessmentService, { ProjectAssessment, StudentScore, ScoreAdjustment } from '@/services/finalAssessmentService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const FinalAssessmentPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const [assessment, setAssessment] = useState<ProjectAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentScore | null>(null);
  const [adjustmentDialog, setAdjustmentDialog] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    newScore: 0,
    reason: ''
  });
  const [finalizing, setFinalizing] = useState(false);

  // Animation effect
  useEffect(() => {
    if (containerRef.current && !loading) {
      // Simple fade-in animation without anime.js complications
      const elements = Array.from(containerRef.current.children) as HTMLElement[];
      elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }
  }, [loading]);

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!projectId) return;
      
      setLoading(true);
      try {
        const response = await finalAssessmentService.getProjectAssessment(Number(projectId));
        if (response.success && response.data) {
          setAssessment(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load assessment data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [projectId, toast]);

  // Handle score adjustment
  const handleScoreAdjustment = async () => {
    if (!selectedStudent || !projectId) return;

    try {
      const adjustment: ScoreAdjustment = {
        studentId: selectedStudent.studentId,
        adjustmentReason: adjustmentForm.reason,
        newScore: adjustmentForm.newScore
      };

      const response = await finalAssessmentService.adjustStudentScore(
        Number(projectId),
        selectedStudent.studentId,
        adjustment
      );

      if (response.success && response.data) {
        // Update the assessment data
        setAssessment(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            students: prev.students.map(student =>
              student.studentId === selectedStudent.studentId
                ? { ...student, ...response.data }
                : student
            )
          };
        });
        setAdjustmentDialog(false);
        setSelectedStudent(null);
        setAdjustmentForm({ newScore: 0, reason: '' });
      }
    } catch (error) {
      console.error('Error adjusting score:', error);
    }
  };

  // Handle finalize assessment
  const handleFinalizeAssessment = async () => {
    if (!projectId) return;

    setFinalizing(true);
    try {
      const response = await finalAssessmentService.finalizeAssessment(Number(projectId));
      if (response.success) {
        setAssessment(prev => prev ? { ...prev, assessmentStatus: 'FINALIZED' } : prev);
      }
    } catch (error) {
      console.error('Error finalizing assessment:', error);
    } finally {
      setFinalizing(false);
    }
  };

  // Handle export report
  const handleExportReport = async () => {
    if (!projectId) return;
    await finalAssessmentService.exportAssessmentReport(Number(projectId));
  };

  // Calculate statistics and chart data
  const stats = {
    totalStudents: assessment?.students.length || 0,
    averageScore: assessment?.averageScore || 0,
    highPerformers: assessment?.students.filter(s => s.finalScore >= 8).length || 0,
    atRiskStudents: assessment?.students.filter(s => s.finalScore < 6).length || 0,
  };

  // Chart data
  const chartData = assessment?.students.map(s => ({
    name: s.studentName ? s.studentName.split(' ').slice(-1)[0] : 'N/A', // Last name only for chart
    fullName: s.studentName || 'Unknown',
    taskCompletion: s.taskScore,
    peerReview: s.peerReviewScore,
    finalScore: s.finalScore,
    commits: s.commitScore,
    latePenalty: s.latePenalty
  })) || [];

  const pieData = [
    { name: 'Xuất sắc (8-10)', value: assessment?.students.filter(s => s.finalScore >= 8).length || 0, color: '#10b981' },
    { name: 'Tốt (6-8)', value: assessment?.students.filter(s => s.finalScore >= 6 && s.finalScore < 8).length || 0, color: '#f59e0b' },
    { name: 'Cần cải thiện (<6)', value: assessment?.students.filter(s => s.finalScore < 6).length || 0, color: '#ef4444' }
  ];

  const radarData = assessment?.students.map(s => ({
    name: s.studentName ? s.studentName.split(' ').slice(-1)[0] : 'N/A',
    taskCompletion: s.taskScore,
    peerReview: s.peerReviewScore,
    commits: s.commitScore,
    punctuality: Math.max(10 - s.latePenalty, 0) // Convert late penalty to punctuality score
  })) || [];

  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 8) return 'default';
    if (score >= 6) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" variant="spinner" />
          <p className="text-gray-500 mt-4">Đang tải dữ liệu đánh giá...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy dữ liệu</h2>
          <p className="text-gray-600">Không thể tải dữ liệu đánh giá cho dự án này.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div ref={containerRef} className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Đánh giá cuối kỳ
              </h1>
              <p className="text-gray-600 mt-1">
                {assessment.projectName} • {assessment.students.length} sinh viên
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {assessment.assessmentStatus === 'FINALIZED' ? (
              <Badge variant="default" className="bg-green-600 text-white">
                <Lock className="w-4 h-4 mr-1" />
                Đã hoàn thành
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-500 text-white">
                <Unlock className="w-4 h-4 mr-1" />
                Đang soạn thảo
              </Badge>
            )}
            
            <Button
              onClick={handleExportReport}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
            
            {assessment.assessmentStatus !== 'FINALIZED' && (
              <Button
                onClick={handleFinalizeAssessment}
                disabled={finalizing}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {finalizing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Hoàn thành đánh giá
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tổng sinh viên</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Điểm trung bình</p>
                  <p className="text-3xl font-bold text-gray-900">{(stats.averageScore || 0).toFixed(1)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Xuất sắc</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.highPerformers}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Cần hỗ trợ</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.atRiskStudents}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <PieChartIcon className="w-4 h-4 mr-2" />
              Phân tích
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Danh sách sinh viên
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* At Risk Students */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Sinh viên cần chú ý
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Những sinh viên có điểm số thấp cần hỗ trợ thêm
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {assessment.students
                      .filter(s => s.finalScore < 6)
                      .slice(0, 5)
                      .map(student => (
                        <div key={student.studentId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={student.studentAvatar} />
                              <AvatarFallback className="bg-red-600 text-white text-xs">
                                {getInitials(student.studentName || 'Unknown')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-gray-900 font-medium text-sm">{student.studentName || 'Unknown'}</p>
                              <p className="text-gray-500 text-xs">{student.groupName}</p>
                            </div>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {(student.finalScore || 0).toFixed(1)}
                          </Badge>
                        </div>
                      ))}
                    {assessment.students.filter(s => s.finalScore < 6).length === 0 && (
                      <p className="text-gray-500 text-center py-4">Không có sinh viên nào cần chú ý đặc biệt</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-600" />
                    Sinh viên xuất sắc
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Những sinh viên có thành tích cao nhất
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {assessment.students
                      .filter(s => s.finalScore >= 8)
                      .slice(0, 5)
                      .map(student => (
                        <div key={student.studentId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={student.studentAvatar} />
                              <AvatarFallback className="bg-green-600 text-white text-xs">
                                {getInitials(student.studentName || 'Unknown')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-gray-900 font-medium text-sm">{student.studentName || 'Unknown'}</p>
                              <p className="text-gray-500 text-xs">{student.groupName}</p>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-600 text-xs">
                            {(student.finalScore || 0).toFixed(1)}
                          </Badge>
                        </div>
                      ))}
                    {assessment.students.filter(s => s.finalScore >= 8).length === 0 && (
                      <p className="text-gray-500 text-center py-4">Chưa có sinh viên nào đạt mức xuất sắc</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Score Distribution Chart */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-gray-900">Phân bố điểm số</CardTitle>
                <CardDescription className="text-gray-600">
                  Biểu đồ thể hiện điểm số của tất cả sinh viên
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          color: '#111827',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="finalScore" fill="#1f2937" name="Điểm cuối kỳ" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900">Phân loại thành tích</CardTitle>
                  <CardDescription className="text-gray-600">
                    Tỷ lệ sinh viên theo mức độ thành tích
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900">Phân tích đa chiều</CardTitle>
                  <CardDescription className="text-gray-600">
                    So sánh các tiêu chí đánh giá
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData.slice(0, 5)}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                        <PolarRadiusAxis tick={{ fill: '#6b7280' }} />
                        <Radar
                          name="Điểm số"
                          dataKey="taskCompletion"
                          stroke="#1f2937"
                          fill="#1f2937"
                          fillOpacity={0.3}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-gray-900">Danh sách sinh viên</CardTitle>
                <CardDescription className="text-gray-600">
                  Chi tiết điểm số và thông tin của từng sinh viên
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-700 font-semibold">Sinh viên</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Nhóm</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Task</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Peer Review</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Commit</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Penalty</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Điểm cuối kỳ</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Trạng thái</TableHead>
                        {assessment.assessmentStatus !== 'FINALIZED' && <TableHead className="text-gray-700 font-semibold">Thao tác</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessment.students.map((student) => (
                        <TableRow key={student.studentId} className="border-gray-200 hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={student.studentAvatar} />
                                <AvatarFallback className="bg-gray-600 text-white text-xs">
                                  {getInitials(student.studentName || 'Unknown')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-gray-900 font-medium text-sm">{student.studentName || 'Unknown'}</p>
                                <p className="text-gray-500 text-xs">{student.studentEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-gray-700 border-gray-300">
                              {student.groupName}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700">{(student.taskScore || 0).toFixed(1)}</TableCell>
                          <TableCell className="text-gray-700">{(student.peerReviewScore || 0).toFixed(1)}</TableCell>
                          <TableCell className="text-gray-700">{(student.commitScore || 0).toFixed(1)}</TableCell>
                          <TableCell className="text-red-600">-{(student.latePenalty || 0).toFixed(1)}</TableCell>
                          <TableCell>
                            <Badge variant={getScoreBadgeVariant(student.finalScore || 0)} className="text-xs">
                              {(student.finalScore || 0).toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {student.isFreerider ? (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Free-rider
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-600 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Bình thường
                              </Badge>
                            )}
                          </TableCell>
                          {assessment.assessmentStatus !== 'FINALIZED' && (
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setAdjustmentForm({
                                    newScore: student.finalScore,
                                    reason: ''
                                  });
                                  setAdjustmentDialog(true);
                                }}
                                className="text-gray-700 border-gray-300 hover:bg-gray-50"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Chỉnh sửa
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Score Adjustment Dialog */}
        <Dialog open={adjustmentDialog} onOpenChange={setAdjustmentDialog}>
          <DialogContent className="bg-white border border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Chỉnh sửa điểm số</DialogTitle>
              <DialogDescription className="text-gray-600">
                Điều chỉnh điểm số cho sinh viên: {selectedStudent?.studentName || 'Unknown'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newScore" className="text-gray-700">Điểm số mới</Label>
                <Input
                  id="newScore"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={adjustmentForm.newScore}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, newScore: parseFloat(e.target.value) || 0 }))}
                  className="bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="reason" className="text-gray-700">Lý do điều chỉnh</Label>
                <Textarea
                  id="reason"
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900 focus:border-gray-500"
                  placeholder="Nhập lý do điều chỉnh điểm số..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdjustmentDialog(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Hủy
              </Button>
              <Button 
                onClick={handleScoreAdjustment}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FinalAssessmentPage; 