import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Group } from '@/services/groupService';
import { peerReviewService } from '@/services/peerReviewService';
import PeerReviewModal from '@/components/peer-review/PeerReviewModal';
import { getInitials } from '@/lib/utils';

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

const GroupsPage = () => {
  const { projectId, groupId } = useParams();
  const navigate = useNavigate();
  
  // State for member dialog
  const [viewMembersDialogOpen, setViewMembersDialogOpen] = useState<boolean>(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<any[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");  const [currentView, setCurrentView] = useState<'kanban' | 'timeline' | 'calendar' | 'peer-reviews'>('kanban');
  const [showPeerReviewModal, setShowPeerReviewModal] = useState<boolean>(false);
  
  // Check for pending peer reviews when component mounts or projectId changes
  useEffect(() => {
    const checkPendingReviews = async () => {
      if (!projectId) return;
      
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
  }, [projectId]);

  // Use custom hooks
  const { 
    groups, 
    loading, 
    userGroup,
    viewedGroup, 
    setViewedGroup,
    isAdmin, 
    isInstructor, 
    isGroupLeader,
    handleJoinGroup,
    handleAutoJoin
  } = useGroupsData({ projectId });

  const {
    tasks,
    tasksLoading,
    tasksError,
    selectedTask,
    taskDetailOpen,
    addTaskDialogOpen,
    setTaskDetailOpen,
    setAddTaskDialogOpen,
    todoTasks,
    inProgressTasks,
    completedTasks,
    handleTaskClick,
    handleAddTask,
    handleTaskUpdated,
    refreshTasks,
    mapUIStatusToApiStatus,
    setTasks
  } = useTasksData({ groupId, userGroup, viewedGroup });

  const { onDragEnd, moveTaskForward, moveTaskBackward } = useTaskManagement({ 
    tasks, 
    setTasks, 
    mapUIStatusToApiStatus 
  });

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
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
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
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Project Groups</h1>
            <p className="text-gray-600">Project ID: {projectId}</p>
          </div>
          
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
    }
    
    // For students who haven't joined a group yet - show available groups
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Project Groups</h1>
            <p className="text-gray-600">Project ID: {projectId}</p>
          </div>
          
          {/* Only show Create Group and Auto Join buttons for students who are not admins/instructors */}
          {!isAdmin && !isInstructor && (
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateGroup} 
                variant="default"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Create Group
              </Button>
              <Button 
                onClick={handleAutoJoin} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Users size={16} />
                Auto Join
              </Button>
            </div>
          )}
        </div>

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6 relative">
        {/* Overlay spinner when joined group is loading */}
        {userGroup && loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        )}
        
        {renderContent()}

        {/* Members Dialog */}
        <Dialog open={viewMembersDialogOpen} onOpenChange={setViewMembersDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedGroupName} - Members</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
              {selectedGroupMembers.map(member => (                <div 
                  key={member.id} 
                  className="p-3 bg-gray-50 rounded-md flex items-center"
                >
                  <Avatar className="h-8 w-8 mr-3">
                    {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.fullName} />}
                    <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.fullName}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <DialogClose asChild>
              <Button variant="outline" className="w-full mt-2">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        
        {/* Peer Review Modal - Will be automatically shown when there are pending reviews */}
        {projectId && (
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
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
          task={selectedTask}
          groupMembers={userGroup?.members || viewedGroup?.members || []}
          onTaskUpdated={handleTaskUpdated}
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
    </div>
  );
};

export default GroupsPage;
