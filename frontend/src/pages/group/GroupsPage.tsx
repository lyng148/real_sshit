import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Users, TrendingUp, Shield, BarChart3, Calendar, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Group } from '@/services/groupService';
import peerReviewService from '@/services/peerReviewService';
import PeerReviewModal from '@/components/peer-review/PeerReviewModal';

// Import custom components
import GroupsList from '@/components/groups/GroupsList';
import GroupDetail from '@/components/groups/GroupDetail';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import TaskDetailDialog from '@/components/tasks/TaskDetailDialog';
import AddTaskDialog from '@/components/tasks/AddTaskDialog';
import TaskTimeline from '@/components/tasks/TaskTimeline';
import TaskCalendar from '@/components/tasks/TaskCalendar';

// Import custom hooks
import { useGroupsData } from '@/hooks/useGroupsData';
import { useTasksData } from '@/hooks/useTasksData';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const GroupsPage = () => {
  const { projectId, groupId } = useParams<{ projectId: string; groupId?: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // State for showing peer review modal
  const [showPeerReviewModal, setShowPeerReviewModal] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<any[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [viewMembersDialogOpen, setViewMembersDialogOpen] = useState(false);

  // Authentication role checks
  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');
  const isStudent = currentUser?.user.roles?.includes('STUDENT');
  const isRegularStudent = isStudent && !isAdmin && !isInstructor;

  // Different view state for different user types
  const [currentView, setCurrentView] = useState<'kanban' | 'timeline' | 'calendar'>('kanban');
  
  // Use custom hooks
  const { 
    groups, 
    loading, 
    userGroup,
    viewedGroup, 
    setViewedGroup,
    isGroupLeader,
    handleJoinGroup,
    handleAutoJoin,
    // Pagination data
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    handlePageChange,
    usePagination
  } = useGroupsData({ 
    projectId, 
    usePagination: isAdmin || isInstructor, // Enable pagination for admin/instructor
    initialPageSize: 10 
  });

  const {
    tasks,
    tasksLoading,
    tasksError,
    todoTasks,
    inProgressTasks,
    completedTasks,
    selectedTask,
    setSelectedTask,
    addTaskDialogOpen,
    setAddTaskDialogOpen,
    handleTaskClick,
    handleAddTask,
    handleTaskUpdated,
    refreshTasks,
    setTasks,
    mapApiStatusToUIStatus,
    mapUIStatusToApiStatus
  } = useTasksData({ groupId: userGroup?.id || viewedGroup?.id, userGroup, viewedGroup });

  // Task management functionality
  const { onDragEnd, moveTaskForward, moveTaskBackward } = useTaskManagement({ 
    tasks, 
    setTasks, 
    mapUIStatusToApiStatus 
  });

  const handleSaveTask = () => {
    handleTaskUpdated();
  };

  const handleDeleteTask = () => {
    handleTaskUpdated();
  };

  // Check for pending peer reviews when component mounts or projectId changes
  // Only check for regular students
  useEffect(() => {
    const checkPendingReviews = async () => {
      if (!projectId || !isRegularStudent) return;
      
      try {
        const projectIdNumber = parseInt(projectId, 10);
        // Check if there are pending peer reviews
        const response = await peerReviewService.getMembersToReview(projectIdNumber);
        
        // If there are members to review, show the modal automatically
        if (response.success && response.data && response.data.length > 0) {
          setShowPeerReviewModal(true);
        }
      } catch (error) {
        console.error("Error checking pending reviews:", error);
      }
    };
    
    checkPendingReviews();
  }, [projectId, isRegularStudent]);

  // Helper functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleViewMembers = (group: Group) => {
    setSelectedGroupMembers(group.members);
    setSelectedGroupName(group.name);
    setViewMembersDialogOpen(true);
  };

  const handleCreateGroup = () => {
    navigate(`/projects/${projectId}/create-group`);
  };

  const handleViewGroup = (groupId: number) => {
    navigate(`/projects/${projectId}/groups/${groupId}`);
  };

  // Check for admin or instructor viewing a specific group
  React.useEffect(() => {
    if ((isAdmin || isInstructor) && groupId && groups.length > 0) {
      const found = groups.find(g => g.id === Number(groupId));
      if (found) setViewedGroup(found);
      else setViewedGroup(null);
    }
  }, [isAdmin, isInstructor, groupId, groups, setViewedGroup]);

  // Entrance animations
  useEffect(() => {
    if (!loading && pageRef.current && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [loading, hasAnimated]);

  // Render group detail view (student or admin/instructor)
  const renderGroupDetailView = (groupParam?: Group) => {
    const group = groupParam || userGroup;
    if (!group) return null;
    
    return (      <div>
        <GroupDetail
          group={group}
          projectId={projectId}
          isAdmin={isAdmin}
          isInstructor={isInstructor}
          isGroupLeader={isGroupLeader}
          currentView={currentView}
          setCurrentView={setCurrentView}
          getInitials={getInitials}
          onViewMembers={handleViewMembers}
          renderKanban={
            <KanbanBoard
              tasks={tasks}
              tasksLoading={tasksLoading}
              tasksError={tasksError}
              isGroupLeader={isGroupLeader(Number(projectId))}
              projectId={projectId}
              todoTasks={todoTasks}
              inProgressTasks={inProgressTasks}
              completedTasks={completedTasks}
              onDragEnd={onDragEnd}
              onAddTask={handleAddTask}
              onTaskClick={handleTaskClick}
              onMoveTaskForward={moveTaskForward}
              onMoveTaskBackward={moveTaskBackward}
            />
          }
          renderTimeline={
            <TaskTimeline
              tasks={tasks}
              tasksLoading={tasksLoading}
              tasksError={tasksError}
              isGroupLeader={isGroupLeader(Number(projectId))}
              onAddTask={handleAddTask}
              onTaskClick={handleTaskClick}
            />
          }
          renderCalendar={
            <TaskCalendar
              tasks={tasks}
              tasksLoading={tasksLoading}
              tasksError={tasksError}
              isGroupLeader={isGroupLeader(Number(projectId))}
              onAddTask={handleAddTask}
              onTaskClick={handleTaskClick}
            />
          }
        />
          {/* We no longer need the portal logic since we're passing the components directly as props */}
      </div>
    );
  };

  // Render content based on user role and group status
  const renderContent = () => {
    // Show spinner when loading
    if (loading) {
      return (
        <div className="h-[60vh] flex items-center justify-center bg-gradient-to-br from-white to-purple-50">
          <div className="text-center">
            <LoadingSpinner size="lg" variant="spinner" />
            <p className="text-gray-500 mt-4 text-lg">Đang tải thông tin nhóm...</p>
          </div>
        </div>
      );
    }

    // After loading, show appropriate content
    if (userGroup) {
      return renderGroupDetailView();
    }
    
    if ((isAdmin || isInstructor) && groupId && viewedGroup) {
      return renderGroupDetailView(viewedGroup);
    }

    // For admins and instructors, show all groups with view option
    if (isAdmin || isInstructor) {
      return (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center justify-between">
        <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Tổng quan dự án</h2>
                <p className="text-gray-600">Quản lý tất cả các nhóm trong dự án #{projectId}</p>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
          </div>
          </Card>
          
          <GroupsList
            groups={groups}
            isAdmin={isAdmin}
            isInstructor={isInstructor}
            projectId={projectId}
            onViewMembers={handleViewMembers}
            onJoinGroup={handleJoinGroup}
            onViewGroup={handleViewGroup}
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={handlePageChange}
            pageSize={pageSize}
          />
        </div>
      );
    }
    
    // For students who haven't joined a group yet - show available groups
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tham gia nhóm</h2>
              <p className="text-gray-600 mb-4">Chọn nhóm phù hợp hoặc tạo nhóm mới cho dự án #{projectId}</p>
          </div>
          
          {/* Only show Create Group and Auto Join buttons for students who are not admins/instructors */}
          {!isAdmin && !isInstructor && (
              <div className="flex gap-3">
              <Button 
                onClick={handleCreateGroup} 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 shadow-lg"
              >
                <Plus size={16} />
                  Tạo nhóm mới
              </Button>
              <Button 
                onClick={handleAutoJoin} 
                variant="outline" 
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 flex items-center gap-2"
              >
                  <Shield size={16} />
                  Tham gia tự động
              </Button>
            </div>
          )}
        </div>
        </Card>

        <GroupsList
          groups={groups}
          isAdmin={isAdmin}
          isInstructor={isInstructor}
          projectId={projectId}
          onViewMembers={handleViewMembers}
          onJoinGroup={handleJoinGroup}
          onViewGroup={handleViewGroup}
        />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
        {renderContent()}

      {/* Enhanced Members Dialog */}
        <Dialog open={viewMembersDialogOpen} onOpenChange={setViewMembersDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              {selectedGroupName} - Thành viên
            </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
            {selectedGroupMembers.map(member => (
              <Card 
                  key={member.id} 
                className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg flex items-center hover:shadow-md transition-all duration-300"
                >
                <Avatar className="h-10 w-10 mr-3 ring-2 ring-purple-200">
                    {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.fullName} />}
                  <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold">
                    {getInitials(member.fullName)}
                  </AvatarFallback>
                  </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{member.fullName}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </Card>
              ))}
            </div>
            <DialogClose asChild>
            <Button variant="outline" className="w-full mt-4">
              Đóng
            </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        
        {/* Peer Review Modal - Will be automatically shown when there are pending reviews */}
        {projectId && isRegularStudent && (
          <PeerReviewModal
            projectId={parseInt(projectId, 10)}
            open={showPeerReviewModal}
            onOpenChange={(open) => {
              // Only allow closing if all reviews are complete
              setShowPeerReviewModal(open);
            }}
          />
        )}

        {/* Task Detail Dialog */}
        <TaskDetailDialog
        open={!!selectedTask && selectedTask !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTask(null);
          }
        }}
          task={selectedTask}
          groupMembers={userGroup?.members || viewedGroup?.members || []}
        onTaskUpdated={handleSaveTask}
        onTaskDeleted={handleDeleteTask}
          isGroupLeader={isGroupLeader(Number(projectId))}
        />

        {/* Add Task Dialog */}
        <AddTaskDialog 
          open={addTaskDialogOpen}
          onOpenChange={setAddTaskDialogOpen}
          groupId={userGroup?.id || viewedGroup?.id || 0}
          onTaskAdded={refreshTasks}
        />
    </div>
  );
};

export default GroupsPage;
