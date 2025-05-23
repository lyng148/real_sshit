import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/services/taskService';
import axiosInstance from '@/services/axiosInstance';
import { Member } from '@/services/groupService';
import { AlertCircle, AlertTriangle, Loader2, Send } from 'lucide-react';
import commentService, { Comment as ApiComment } from '@/services/commentService';
import taskService from '@/services/taskService';

// Interface for commit data
interface Commit {
  id: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorAvatarUrl?: string;
  timestamp: string;
  url?: string;
}

// Interface for UI representation of comment data
interface Comment extends ApiComment {
  // Additional UI-specific properties can be added here if needed
}

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  groupMembers?: Member[];
  onTaskUpdated?: () => void;
  isGroupLeader: boolean;
}

const TaskDetailDialog = ({ 
  open, 
  onOpenChange,
  task, 
  groupMembers = [],
  onTaskUpdated,
  isGroupLeader
}: TaskDetailDialogProps) => {  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [commits, setCommits] = useState<Commit[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);  
  
  // States for pressure warning popup
  const [showPressureWarning, setShowPressureWarning] = useState(false);
  const [warningMember, setWarningMember] = useState<string>('');
  const [pendingAssignment, setPendingAssignment] = useState<string | null>(null);
  
  // Scroll to the latest comment when a new comment is added
  useEffect(() => {
    if (comments.length > 0 && commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments.length]);

  // Fetch commits and comments when task is opened
  useEffect(() => {
    if (open && task && task.id) {
      console.log("Fetching commits and comments for task:", task);
      fetchCommits();
      fetchComments();
    }
  }, [open, task]);

  // Format a date string to a more readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get initials from a name
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Get color based on priority
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'LOW': return 'bg-blue-100 text-blue-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get color based on difficulty  
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'HARD': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get color based on status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to complete task assignment after warning confirmation
  const completeAssignment = async () => {
    if (!pendingAssignment || !task) return;
    
    try {
      setIsAssigning(true);
      const memberId = pendingAssignment;
      
      // Clear the pending assignment
      setPendingAssignment(null);
      setShowPressureWarning(false);
      
      const response = await axiosInstance.put(`/api/tasks/${task.id}/assign/${memberId}`);
      
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Task assigned successfully",
        });
        
        // Call onTaskUpdated to update the task data
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      toast({
        title: "Error",
        description: "Failed to assign task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };
  
  // Handle assigning task to a member
  const handleAssignTask = async (memberId: string) => {
    if (!task) return;
    
    try {
      setIsAssigning(true);
      // Gọi API để kiểm tra cảnh báo áp lực
      const response = await axiosInstance.put(`/api/tasks/${task.id}/assign/${memberId}`);
      
      if (response.status === 200) {
        const updatedTask = response.data.data;
        
        // Kiểm tra nếu có cảnh báo áp lực
        if (updatedTask.pressureWarning != null) {
          // Tìm thông tin thành viên cho dialog cảnh báo
          const member = groupMembers.find(m => m.id.toString() === memberId);
          setWarningMember(member?.fullName || 'Thành viên này');
          
          // Lưu ID thành viên để gán nhiệm vụ sau khi xác nhận
          setPendingAssignment(memberId);
          
          // Hiển thị dialog cảnh báo
          setShowPressureWarning(true);
          setIsAssigning(false);
          return;
        }
        
        // Không có cảnh báo, hiển thị thông báo thành công
        toast({
          title: "Thành công",
          description: "Nhiệm vụ đã được gán thành công",
        });
        
        // Gọi onTaskUpdated để cập nhật dữ liệu nhiệm vụ
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      toast({
        title: "Error",
        description: "Failed to assign task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };  

  // Fetch commits for a task
  const fetchCommits = async () => {
    if (!task || !task.id) {
      console.error("Cannot fetch commits: Task or task ID is missing", task);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`Fetching commits for task ID: ${task.id}`);
      const response = await axiosInstance.get(`/api/github/commits/task/${task.id}`);
      
      if (response.data && response.data.data) {
        setCommits(response.data.data);
      } else {
        console.log("No commits found or unexpected response format", response.data);
      }
    } catch (error) {
      console.error("Error fetching commits:", error);
      toast({
        title: "Error",
        description: "Failed to load commit history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch comments for a task
  const fetchComments = async () => {
    if (!task || !task.id) {
      console.error("Cannot fetch comments: Task or task ID is missing", task);
      return;
    }
    
    try {
      setIsCommentsLoading(true);
      console.log(`Fetching comments for task ID: ${task.id}`);
      const commentsData = await commentService.getCommentsByTaskId(task.id);
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCommentsLoading(false);
    }
  };  // Track newly added comments for animation effects
  const [newCommentIds, setNewCommentIds] = useState<Set<number>>(new Set());
  
  // Handle submitting a new comment with optimistic UI update
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const content = newCommentContent.trim();
    if (!content) {
      toast({
        title: "Error",
        description: "Comment content cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    if (!task || !task.id || !currentUser) {
      console.error("Cannot submit comment: Missing task, task ID, or user", { task, currentUser });
      return;
    }
    
    // Clear the input field immediately for better UX
    setNewCommentContent('');
    
    // Create an optimistic comment to add to the UI immediately
    const optimisticComment: Comment = {
      id: Date.now(), // Temporary ID that will be replaced with the real one
      content: content,
      authorId: currentUser.user.id,
      authorName: currentUser.user.fullName,
      authorAvatarUrl: currentUser.user.avatarUrl,
      taskId: task.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add the optimistic comment to the UI and mark it as new for animation
    setNewCommentIds(prev => new Set(prev).add(optimisticComment.id));
    setComments(prevComments => [...prevComments, optimisticComment]);
    
    try {
      // Send to server in the background without blocking the UI
      setIsCommentSubmitting(true);
      const savedComment = await commentService.createComment({
        content: content,
        taskId: task.id,
      });
      
      // Replace the optimistic comment with the real one from the server
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === optimisticComment.id ? savedComment : comment
        )
      );
      
      // Update the new comment id set
      setNewCommentIds(prev => {
        const updated = new Set(prev);
        updated.delete(optimisticComment.id);
        updated.add(savedComment.id);
        
        // Clear the highlight after 2 seconds
        setTimeout(() => {
          setNewCommentIds(current => {
            const next = new Set(current);
            next.delete(savedComment.id);
            return next;
          });
        }, 2000);
        
        return updated;
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      
      // Remove the optimistic comment if the request failed
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== optimisticComment.id)
      );
      
      // Remove from new comments
      setNewCommentIds(prev => {
        const updated = new Set(prev);
        updated.delete(optimisticComment.id);
        return updated;
      });
      
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleEditTask = async () => {
    try {
      const response = await taskService.updateTask(editedTask.id, editedTask);
      if (response.success) {
        toast({ title: "Success", description: response.message });
        onTaskUpdated?.();
        setIsEditing(false);
      } else {
        toast({ title: "Error", description: response.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;

    try {
      const response = await taskService.deleteTask(task.id);
      if (response.success) {
        toast({ title: "Success", description: response.message });
        onOpenChange(false);
        onTaskUpdated?.();
      } else {
        toast({ title: "Error", description: response.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };
  
  if (!task) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Task Selected</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">Please select a task to view its details.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">        <DialogHeader className="relative">          
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <span>Task: {task.title}</span>
            <Badge className={getStatusColor(task.status)}>{typeof task.status === 'string' ? task.status.replace('_', ' ') : String(task.status)}</Badge>
          </DialogTitle>          {isGroupLeader && (
            <div className="absolute top-0 right-0 flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={() => {
                    setIsEditing(false);
                    setEditedTask(task); // Reset to original task data
                  }} variant="outline" size="sm">Cancel</Button>
                  <Button onClick={handleEditTask} variant="default" size="sm">Apply</Button>
                </>
              ) : (
                <Button onClick={() => {
                  setIsEditing(true);
                  setEditedTask(task);
                }} variant="outline" size="sm">Edit Task</Button>
              )}
              <Button onClick={handleDeleteTask} variant="destructive" size="sm">Delete Task</Button>
            </div>
          )}
        </DialogHeader>
        
        <div className="mt-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 mb-4 rounded-md">
            <p className="text-sm font-medium">Convention Alert</p>
            <p className="text-sm">All commits for this task must follow the convention: <span className="font-bold">[TASK-{task.id}]</span> at the beginning of the commit message.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Details Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border p-4 mb-6">                
                <h3 className="font-medium text-lg mb-3">Task Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    {isEditing ? (
                      <Select 
                        value={editedTask.priority}
                        onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => setEditedTask({ ...editedTask, priority: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">LOW</SelectItem>
                          <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                          <SelectItem value="HIGH">HIGH</SelectItem>
                          <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Difficulty</p>
                    {isEditing ? (                      
                      <Select 
                        value={editedTask.difficulty}
                        onValueChange={(value: 'EASY' | 'MEDIUM' | 'HARD') => setEditedTask({ ...editedTask, difficulty: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EASY">EASY</SelectItem>
                          <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                          <SelectItem value="HARD">HARD</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getDifficultyColor(task.difficulty)}>{typeof task.difficulty === "string" ? task.difficulty.replace('_', ' '): String(task.difficulty)}</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium">{formatDate(task.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    {isEditing ? (                      <input
                        type="datetime-local"
                        value={editedTask.deadline.split('.')[0]} // Remove milliseconds
                        onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                        className="w-full text-sm border rounded-md p-1"
                        aria-label="Deadline"
                      />
                    ) : (
                      <p className="text-sm font-medium">{formatDate(task.deadline)}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Title</p>
                    {isEditing ? (                      
                      <input
                        type="text"
                        value={editedTask.title}
                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                        className="w-full text-sm border rounded-md p-1 mt-1"
                        aria-label="Task title"
                        placeholder="Task title"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{task.title}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Description</p>
                    {isEditing ? (                      <textarea
                        value={editedTask.description}
                        onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                        className="w-full text-sm border rounded-md p-1 mt-1"
                        rows={3}
                        aria-label="Task description"
                        placeholder="Enter task description"
                      />
                    ) : (
                      <p className="text-sm mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Assignee</p>                    
                    {task.assigneeName ? (
                      <div className="flex items-center mt-1">
                        <Avatar className="h-6 w-6 mr-2">
                          {task.assigneeAvatarUrl && <AvatarImage src={task.assigneeAvatarUrl} alt={task.assigneeName} />}
                          <AvatarFallback>{getInitials(task.assigneeName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.assigneeName}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Unassigned</p>
                    )}
                  </div>
                  
                  {/* Display pressure warning if present */}
                  {task.pressureWarning && (
                    <div className="col-span-2 mt-2">
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <p className="text-amber-700 text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Warning: Assignee has a high pressure score and may be overloaded
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {isGroupLeader && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Assign Task</p>
                    <div className="flex gap-2">
                      <Select 
                        disabled={isAssigning} 
                        onValueChange={(value) => handleAssignTask(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isAssigning && (
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Commit History */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium text-lg mb-3">Commit History</h3>
                
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <p>Loading commits...</p>
                  </div>
                ) : commits.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No commits found for this task.</p>
                  </div>
                ) : (
                  <div className="relative pl-8">
                    {/* Timeline line */}
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {commits.map((commit, index) => (
                      <div key={commit.id} className="mb-4 relative">
                        {/* Timeline circle */}
                        <div className="absolute -left-6 h-3 w-3 rounded-full border-2 border-blue-500 bg-white"></div>
                        
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between items-start">                          
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                {commit.authorAvatarUrl && <AvatarImage src={commit.authorAvatarUrl} alt={commit.authorName} />}
                                <AvatarFallback>{getInitials(commit.authorName)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{commit.authorName}</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(commit.timestamp)}</span>
                          </div>
                          <p className="text-sm mt-2 break-words">{commit.message}</p>
                          {commit.url && (
                            <a 
                              href={commit.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 mt-1 inline-block hover:underline"
                            >
                              View on GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
              {/* Comments Column */}
            <div>
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium text-lg mb-3">Comments</h3>
                
                {isCommentsLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <p>Loading comments...</p>
                  </div>                ) : comments.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No comments yet.</p>
                  </div>
                ) : (                  <div ref={commentsContainerRef} className="mb-4 max-h-80 overflow-y-auto">
                    {comments.map(comment => (
                      <div 
                        key={comment.id} 
                        className={`mb-3 pb-3 border-b last:border-b-0 ${newCommentIds.has(comment.id) ? 'animate-pulse bg-blue-50' : ''} transition-colors duration-300 rounded-md p-2`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              {comment.authorAvatarUrl && <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} />}
                              <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.authorName}</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm mt-1 break-words">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                  {/* Comment form */}
                <div className="mt-4">
                  <form onSubmit={handleSubmitComment} className="relative">
                    <textarea
                      ref={commentInputRef}
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      onKeyDown={(e) => {
                        // Submit form on Ctrl+Enter or Command+Enter
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          e.preventDefault();
                          handleSubmitComment(e);
                        }
                      }}
                      placeholder="Add a comment... (Ctrl+Enter to send)"
                      className="w-full border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] pr-10"
                      disabled={isCommentSubmitting}
                    />
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute bottom-2 right-2 text-blue-600 hover:bg-blue-50"
                      disabled={isCommentSubmitting || !newCommentContent.trim()}
                    >
                      {isCommentSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className="sr-only">Send comment</span>
                    </Button>
                  </form>
                </div>
              </div>
            </div>          
            </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
        
        {/* Pressure warning dialog */}
        <Dialog open={showPressureWarning} onOpenChange={setShowPressureWarning}>
          <DialogContent className="max-w-md">            
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
                Consider Assigning to Another Member
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 bg-amber-50 rounded-md border border-amber-200">              
              <p className="text-sm text-gray-700">
                The member <span className="font-semibold">{warningMember}</span> has a high pressure score and may be overloaded with tasks.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Consider redistributing work to other team members if possible.
              </p>
            </div>
            <DialogFooter className="flex justify-center mt-4">
              <Button 
                variant="default" 
                onClick={() => {
                  setShowPressureWarning(false);
                  completeAssignment();
                }}
              >
                I understand, proceed with assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
