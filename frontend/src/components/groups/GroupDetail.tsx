import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart, Calendar, List, Clock, Link as LinkIcon, GitBranch, UserSquare2, Settings, Eye, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Group } from '@/services/groupService';
import { Badge } from "@/components/ui/badge";
import ReviewTriggerButton from '../peer-review/ReviewTriggerButton';
import PeerReviewModal from '../peer-review/PeerReviewModal';
import PeerReviewResults from '../peer-review/PeerReviewResults';
import  peerReviewService  from '@/services/peerReviewService';


interface GroupDetailProps {
  group: Group;
  projectId: string | undefined;
  isAdmin: boolean;
  isInstructor: boolean;
  isGroupLeader: (projectId: number) => boolean;
  currentView: 'kanban' | 'timeline' | 'calendar' | 'peer-reviews';
  setCurrentView: (view: 'kanban' | 'timeline' | 'calendar' | 'peer-reviews') => void;
  getInitials: (name: string) => string;
  onViewMembers: (group: Group) => void;
  renderKanban?: React.ReactNode;
  renderTimeline?: React.ReactNode;
  renderCalendar?: React.ReactNode;
}

const GroupDetail: React.FC<GroupDetailProps> = ({
  group,
  projectId,
  isAdmin,
  isInstructor,
  isGroupLeader,
  currentView,
  setCurrentView,
  getInitials,
  onViewMembers,
  renderKanban,
  renderTimeline,
  renderCalendar
}) => {
  const navigate = useNavigate();
  const [showPeerReviewModal, setShowPeerReviewModal] = useState(false);
  const projectIdNumber = projectId ? parseInt(projectId, 10) : 0;
  // We handle peer review checks at the page level instead of component level
  // to avoid duplicate modals
  
  // If current view is peer-reviews but user is admin/instructor, redirect to kanban
  useEffect(() => {
    if ((isAdmin || isInstructor) && currentView === 'peer-reviews') {
      setCurrentView('kanban');
    }
  }, [isAdmin, isInstructor, currentView, setCurrentView]);

  // Check if user is a regular student (not admin or instructor)
  const isRegularStudent = !isAdmin && !isInstructor;
  
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-purple-50 via-white to-pink-50 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 px-3 py-1"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      {group.memberCount}/{group.maxMembers} thành viên
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Hoạt động
                    </Badge>
                  </div>
                </div>
              </div>
              {group.description && (
                <p className="text-lg text-gray-600 leading-relaxed">{group.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-3 ml-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewMembers(group)}
                className="border-purple-200 text-purple-600 flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Xem thành viên
              </Button>

              {isRegularStudent && (
                <ReviewTriggerButton 
                  groupId={group.id}
                  projectId={projectIdNumber} 
                  isGroupLeader={isGroupLeader(group.projectId)}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Enhanced Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-blue-500" />
              Repository
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
              <a 
                href={group.repositoryUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 break-all text-sm font-medium transition-colors"
              >
                {group.repositoryUrl ? group.repositoryUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '') : "Chưa thiết lập"}
              </a>
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Thành viên nhóm
            </CardTitle>
          </CardHeader>          
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2 overflow-hidden">                
                {group.members.slice(0, 4).map((member, index) => (
                  <Avatar key={index} className="border-2 border-white shadow-sm transition-transform duration-200">
                    {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.fullName} />}
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-bold">
                      {getInitials(member.fullName)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {group.members.length > 4 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-xs font-medium text-gray-600 border-2 border-white shadow-sm">
                    +{group.members.length - 4}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {group.members.length} người
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-500" />
              Thông tin dự án
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-800">{group.projectName}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>Tạo ngày {new Date(group.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced View Tabs */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <Tabs 
            value={currentView} 
            onValueChange={(value) => setCurrentView(value as 'kanban' | 'timeline' | 'calendar' | 'peer-reviews')}
          >
            <TabsList className={`grid ${isRegularStudent ? 'grid-cols-4' : 'grid-cols-3'} w-full mb-6 bg-gray-100 p-1 rounded-lg`}>
              <TabsTrigger 
                value="kanban" 
                className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-700"
              >
                <BarChart className="h-4 w-4" />
                <span className="font-medium">Kanban Board</span>
              </TabsTrigger>
              <TabsTrigger 
                value="timeline" 
                className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-700"
              >
                <Clock className="h-4 w-4" />
                <span className="font-medium">Timeline</span>
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-700"
              >
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Calendar</span>
              </TabsTrigger>
              
              {/* Only show Peer Reviews tab for regular students */}
              {isRegularStudent && (
                <TabsTrigger 
                  value="peer-reviews" 
                  className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-700"
                >
                  <UserSquare2 className="h-4 w-4" />
                  <span className="font-medium">Peer Reviews</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="kanban" className="space-y-4 mt-0">
              {renderKanban || (
                <div className="text-center py-12">
                  <BarChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Nội dung Kanban chưa có sẵn</p>
                  <p className="text-gray-400 text-sm">Hãy thêm task đầu tiên để bắt đầu</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4 mt-0">
              {renderTimeline || (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Nội dung Timeline chưa có sẵn</p>
                  <p className="text-gray-400 text-sm">Timeline sẽ hiển thị khi có task</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-4 mt-0">
              {renderCalendar || (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Nội dung Calendar chưa có sẵn</p>
                  <p className="text-gray-400 text-sm">Lịch làm việc sẽ hiển thị khi có task</p>
                </div>
              )}
            </TabsContent>
            
            {/* Only render peer reviews content if user is a regular student */}
            {isRegularStudent && (
              <TabsContent value="peer-reviews" className="space-y-4 mt-0">
                <div>
                  <PeerReviewResults projectId={projectIdNumber} />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* We've moved the automatic peer review check to the page level to avoid duplicate modals */}
      {/* This modal will only appear when the user clicks "Peer Review" in the Review button */}
      {isRegularStudent && (
        <PeerReviewModal
          projectId={projectIdNumber}
          open={showPeerReviewModal}
          onOpenChange={setShowPeerReviewModal}
        />
      )}
    </div>
  );
};

export default GroupDetail;
