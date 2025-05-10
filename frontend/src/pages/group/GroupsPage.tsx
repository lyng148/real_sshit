import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Users, Eye, X, PlusCircle, BarChart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/AuthContext';
import groupService, { Group, Member } from '@/services/groupService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupStatisticsResponse } from '@/types/statistics';
import {
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
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

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'completed';
  assignee?: string;
  dueDate?: string;
}

const GroupsPage = () => {
  const { projectId, groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMembersDialogOpen, setViewMembersDialogOpen] = useState<boolean>(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<Member[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [ledGroups, setLedGroups] = useState<Group[]>([]);
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'kanban' | 'analytics'>('kanban');
  const [statisticsLoading, setStatisticsLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<GroupStatisticsResponse | null>(null);
  const [viewedGroup, setViewedGroup] = useState<Group | null>(null);
  
  // For Kanban board
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Research competitors', description: 'Analyze top 5 competitors', status: 'todo', assignee: 'John Doe', dueDate: '2025-05-15' },
    { id: '2', title: 'Create wireframes', description: 'Design wireframes for key pages', status: 'todo', assignee: 'Jane Smith', dueDate: '2025-05-20' },
    { id: '3', title: 'Setup project structure', description: 'Initialize repository and setup project structure', status: 'inProgress', assignee: 'Alex Johnson', dueDate: '2025-05-10' },
    { id: '4', title: 'User research', description: 'Conduct user interviews', status: 'inProgress', assignee: 'Maria Garcia', dueDate: '2025-05-12' },
    { id: '5', title: 'Define MVP features', description: 'Identify core features for MVP', status: 'completed', assignee: 'Mike Smith', dueDate: '2025-05-05' },
  ]);

  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');
  
  useEffect(() => {
    // Reset state khi projectId thay đổi
    setUserGroup(null);
    setGroups([]);
    setLoading(true);
    setViewedGroup(null);
    setStatistics(null);
    setCurrentView('kanban');
    // ...reset thêm nếu cần
  }, [projectId]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        const response = await groupService.getAllGroups(Number(projectId));
        if (response.success) {
          setGroups(response.data || []);
          
          // Check if the user is in any of these groups
          if (!isAdmin && !isInstructor && currentUser) {
            const userGroups = response.data.filter((group: Group) => 
              group.members.some(member => member.id === currentUser.user.id)
            );
            
            if (userGroups.length > 0) {
              setUserGroup(userGroups[0]);
            }
          }
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load groups",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading groups",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchLedGroups = async () => {
      try {
        const response = await groupService.getMyLedGroups();
        if (response.success) {
          setLedGroups(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching led groups:", error);
      }
    };

    fetchGroups();
    if (!isAdmin && !isInstructor) {
      fetchLedGroups();
    }
  }, [projectId, toast, isAdmin, isInstructor, currentUser]);

  // Fetch group for admin/instructor view
  useEffect(() => {
    if ((isAdmin || isInstructor) && groupId && groups.length > 0) {
      const found = groups.find(g => g.id === Number(groupId));
      if (found) setViewedGroup(found);
      else setViewedGroup(null);
    }
  }, [isAdmin, isInstructor, groupId, groups]);

  // Handle drag and drop for tasks
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // Drop outside the list
    if (!destination) return;

    // Drop position didn't change
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update task status
    const updatedTasks = tasks.map(task => {
      if (task.id === draggableId) {
        return {
          ...task,
          status: destination.droppableId as 'todo' | 'inProgress' | 'completed'
        };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  // Move task to next column
  const moveTaskForward = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          if (task.status === 'todo') return { ...task, status: 'inProgress' };
          if (task.status === 'inProgress') return { ...task, status: 'completed' };
        }
        return task;
      })
    );
  };

  // Move task to previous column
  const moveTaskBackward = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          if (task.status === 'inProgress') return { ...task, status: 'todo' };
          if (task.status === 'completed') return { ...task, status: 'inProgress' };
        }
        return task;
      })
    );
  };

  const handleAutoJoinGroup = async (groupId: number) => {
    // make a placeholder function to simulate auto-join
    const autoJoinGroup = async () => {
      try {
        const response = await groupService.joinGroup(groupId);
        if (response.success) {
          toast({
            title: "Success",
            description: "You have successfully joined the group",
          });
          setUserGroup(groups.find(group => group.id === groupId) || null);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to join group",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error joining group:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };
  }

  const handleJoinGroup = async (groupId: number, projectId: number) => {
    try {
      const response = await groupService.joinGroup(groupId, projectId);
      if (response.success) {
        toast({
          title: "Success",
          description: "You have successfully joined the group",
        });
        
        // Refresh groups after joining to update the view
        const updatedResponse = await groupService.getAllGroups(Number(projectId));
        if (updatedResponse.success) {
          setGroups(updatedResponse.data || []);
          
          // Find the group user just joined and set it as userGroup
          const joinedGroup = updatedResponse.data.find((g: Group) => g.id === groupId);
          if (joinedGroup) {
            setUserGroup(joinedGroup);
          }
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to join group",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleViewGroup = (groupId: number) => {
    navigate(`/projects/${projectId}/groups/${groupId}`);
  };

  const handleCreateGroup = () => {
    navigate(`/projects/${projectId}/create-group`);
  };

  const handleAutoJoin = async () => {
    if (groups.length > 0) {
      // Find a group with available spots
      const availableGroup = groups.find(group => group.memberCount < group.maxMembers);
      if (availableGroup) {
        await handleAutoJoinGroup(availableGroup.id);
      } else {
        toast({
          title: "No Available Groups",
          description: "There are no groups with available spots.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Groups",
        description: "There are no groups available to join.",
        variant: "destructive",
      });
    }
  };

  const handleViewMembers = (group: Group) => {
    setSelectedGroupMembers(group.members);
    setSelectedGroupName(group.name);
    setViewMembersDialogOpen(true);
  };

  const handleAddTask = () => {
    setShowNewTaskForm(true);
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Check if user is a leader of a group in this project
  const isGroupLeader = (projectId: number): boolean => {
    return ledGroups.some(group => group.projectId === Number(projectId));
  };

  // Fetch group statistics
  const fetchGroupStatistics = async (groupId: number) => {
    try {
      setStatisticsLoading(true);
      const response = await projectService.getGroupStatistics(groupId);
      if (response.success) {
        setStatistics(response.data);
        setCurrentView('analytics');
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load group statistics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching group statistics:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading statistics",
        variant: "destructive",
      });
    } finally {
      setStatisticsLoading(false);
    }
  };

  // Filter tasks by status for Kanban
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'inProgress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  // Render Kanban board for student or group view
  const renderKanbanBoard = () => {
    return (
      <>
        {isGroupLeader(Number(projectId)) && (
          <div className="mb-4">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={handleAddTask}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </div>
        )}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Todo Column */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-800">Todo</h3>
              </div>
              <Droppable droppableId="todo">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="p-4 min-h-[300px]"
                  >
                    {todoTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white border border-gray-200 rounded-md p-3 mb-3 shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-800">{task.title}</h4>
                              <button 
                                onClick={() => moveTaskForward(task.id)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                                  <path d="M5 12h14"/>
                                  <path d="m12 5 7 7-7 7"/>
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            {task.assignee && (
                              <div className="text-xs text-gray-500">
                                Assignee: {task.assignee}
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="text-xs text-gray-500">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            {/* In Progress Column */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-800">In Progress</h3>
              </div>
              <Droppable droppableId="inProgress">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="p-4 min-h-[300px]"
                  >
                    {inProgressTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white border border-gray-200 rounded-md p-3 mb-3 shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <button 
                                onClick={() => moveTaskBackward(task.id)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
                                  <path d="M19 12H5"/>
                                  <path d="m12 19-7-7 7-7"/>
                                </svg>
                              </button>
                              <h4 className="font-medium text-gray-800 flex-1 mx-2">{task.title}</h4>
                              <button 
                                onClick={() => moveTaskForward(task.id)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                                  <path d="M5 12h14"/>
                                  <path d="m12 5 7 7-7 7"/>
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            {task.assignee && (
                              <div className="text-xs text-gray-500">
                                Assignee: {task.assignee}
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="text-xs text-gray-500">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            {/* Completed Column */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-800">Completed</h3>
              </div>
              <Droppable droppableId="completed">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="p-4 min-h-[300px]"
                  >
                    {completedTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white border border-gray-200 rounded-md p-3 mb-3 shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <button 
                                onClick={() => moveTaskBackward(task.id)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
                                  <path d="M19 12H5"/>
                                  <path d="m12 19-7-7 7-7"/>
                                </svg>
                              </button>
                              <h4 className="font-medium text-gray-800 flex-1 mx-2">{task.title}</h4>
                              <span className="text-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                                  <path d="M20 6 9 17l-5-5"/>
                                </svg>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            {task.assignee && (
                              <div className="text-xs text-gray-500">
                                Assignee: {task.assignee}
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="text-xs text-gray-500">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </>
    );
  };

    const renderGroupDetailView = (groupParam?: Group) => {
    const group = groupParam || userGroup;
    if (!group) return null;
    return (
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
              <p className="text-gray-600">{group.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleViewMembers(group)}
              >
                <Users className="mr-2 h-4 w-4" />
                Members ({group.memberCount}/{group.maxMembers})
              </Button>
              {/* Chỉ student leader mới có nút Analytics */}
              {(!isAdmin && !isInstructor && isGroupLeader(Number(projectId))) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (currentView === 'kanban') {
                      navigate(`/projects/${projectId}/groups/${group.id}/analyze`);
                    } else {
                      navigate(`/projects/${projectId}/groups/${group.id}`);
                    }
                  }}
                >
                  {currentView === 'kanban' ? (
                    <>
                      <BarChart className="mr-2 h-4 w-4" />
                      Group Analytics
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                        <path d="M3 3h18v18H3z"></path>
                        <path d="M8 12h8"></path>
                        <path d="M12 8v8"></path>
                      </svg>
                      Kanban Board
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          {/* Group Information Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Repository</CardTitle>
                <CardDescription>GitHub repository</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href={group.repositoryUrl || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline break-all"
                >
                  {group.repositoryUrl || "Not set"}
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Members</CardTitle>
                <CardDescription>Team composition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex -space-x-2">
                  {group.members.slice(0, 4).map((member, index) => (
                    <Avatar key={index} className="border-2 border-white">
                      <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {group.members.length > 4 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-xs font-medium text-gray-600 border-2 border-white">
                      +{group.members.length - 4}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Project</CardTitle>
                <CardDescription>Associated project</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="font-medium">{group.projectName}</span>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="mt-8 mb-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Tasks</h2>
          {renderKanbanBoard()}
        </div>
      </div>
    );
  };

  // Render different content based on user role and group status
  const renderContent = () => {
    // Just show the spinner when loading
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No groups found for this project.</p>
              </div>
            ) : (
              groups.map(group => (
                <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">{group.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{group.description || "No description provided."}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{group.memberCount}/{group.maxMembers} members</span>
                    <Button 
                      onClick={() => handleViewGroup(group.id)} 
                      variant="outline" 
                      className="ml-auto"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Group
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">No groups found for this project.</p>
              {!isAdmin && !isInstructor && (
                <Button onClick={handleCreateGroup} className="mt-4">
                  Create a New Group
                </Button>
              )}
            </div>
          ) : (
            groups.map(group => (
              <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-lg">{group.name}</h3>
                </div>
                <p className="text-gray-600 mb-4">{group.description || "No description provided."}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{group.memberCount}/{group.maxMembers} members</span>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleViewMembers(group)} 
                      variant="ghost" 
                      size="sm"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      View Members
                    </Button>
                    <Button 
                      onClick={() => handleJoinGroup(group.id, projectId)} 
                      variant="outline" 
                      size="sm"
                      className="ml-auto"
                      disabled={group.memberCount >= group.maxMembers}
                    >
                      {group.memberCount >= group.maxMembers ? "Full" : "Join Group"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6 relative">
        {/* Overlay spinner khi đã join group và loading */}
        {userGroup && loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        )}
        {renderContent()}

        <Dialog open={viewMembersDialogOpen} onOpenChange={setViewMembersDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedGroupName} - Members</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
              {selectedGroupMembers.map(member => (
                <div 
                  key={member.id} 
                  className="p-3 bg-gray-50 rounded-md flex items-center"
                >
                  <Avatar className="h-8 w-8 mr-3">
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
      </div>
    </div>
  );
};

export default GroupsPage;
