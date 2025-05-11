
import { useState, useEffect, useCallback } from 'react';
import taskService, { Task as ApiTask } from '@/services/taskService';
import { Task } from '@/types/task';

interface UseTasksDataProps {
  groupId?: string;
  userGroup: any;
  viewedGroup: any;
}

export const useTasksData = ({ groupId, userGroup, viewedGroup }: UseTasksDataProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState<boolean>(false);

  // Convert API task status to UI status
  const mapApiStatusToUIStatus = (apiStatus: string): 'todo' | 'inProgress' | 'completed' => {
    switch(apiStatus) {
      case 'NOT_STARTED': return 'todo';
      case 'IN_PROGRESS': return 'inProgress';
      case 'COMPLETED': return 'completed';
      default: return 'todo';
    }
  };
  
  // Convert UI status to API status
  const mapUIStatusToApiStatus = (uiStatus: string): 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' => {
    switch(uiStatus) {
      case 'todo': return 'NOT_STARTED';
      case 'inProgress': return 'IN_PROGRESS';
      case 'completed': return 'COMPLETED';
      default: return 'NOT_STARTED';
    }
  };

  const handleTaskClick = useCallback((task: Task) => {
    if (task.originalTask) {
      setSelectedTask(task.originalTask);
      setTaskDetailOpen(true);
    }
  }, []);

  const handleAddTask = useCallback(() => {
    setAddTaskDialogOpen(true);
  }, []);

  const fetchTasks = useCallback(async () => {
    // Determine which group ID to use for fetching tasks
    let currentGroupId: number | null = null;
      
    if (userGroup) {
      currentGroupId = userGroup.id;
    } else if (viewedGroup) {
      currentGroupId = viewedGroup.id;
    } else if (groupId) {
      currentGroupId = Number(groupId);
    }
      
    if (!currentGroupId) {
      setTasksLoading(false);
      return;
    }
      
    try {
      setTasksLoading(true);
      setTasksError(null);
        
      const tasksResponse = await taskService.getTasks(currentGroupId);
        
      // Backend API returns data in structure: { data: Task[], message: string, status: number }
      const apiTasks = tasksResponse?.data || [];
        
      if (apiTasks.length === 0) {
        setTasks([]);
        setTasksLoading(false);
        return; // No tasks to display
      }
        
      // Map API tasks to UI tasks
      const uiTasks = apiTasks.map((apiTask: ApiTask) => ({
        id: apiTask.id.toString(),
        title: apiTask.title,
        description: apiTask.description,
        status: mapApiStatusToUIStatus(apiTask.status),
        assignee: apiTask.assigneeName || undefined,
        dueDate: apiTask.deadline,
        originalTask: apiTask
      }));
        
      setTasks(uiTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasksError('Failed to load tasks. Please try again later.');
    } finally {
      setTasksLoading(false);
    }
  }, [userGroup, viewedGroup, groupId]);
  const refreshTasks = useCallback(() => {
    // Trigger tasks refresh when a new task is added
    setTasksLoading(true);
    fetchTasks();
  }, [fetchTasks]);
  
  const handleTaskUpdated = useCallback(async () => {
    if (selectedTask && selectedTask.id) {
      try {
        console.log("Fetching updated task with ID:", selectedTask.id);
        
        // Refetch the specific task that was updated
        const response = await taskService.getTaskById(selectedTask.id);
        const updatedTask = response?.data || response; // Handle both response formats
        
        console.log("Updated task data:", updatedTask);
        
        if (!updatedTask) {
          console.error("Failed to fetch updated task data");
          return;
        }
        
        // Update the task in our local state
        setTasks(prevTasks => 
          prevTasks.map(task => {
            if (task.id === String(selectedTask.id)) {
              return {
                ...task,
                title: updatedTask.title,
                description: updatedTask.description,
                status: mapApiStatusToUIStatus(updatedTask.status),
                assignee: updatedTask.assigneeName || undefined,
                dueDate: updatedTask.deadline,
                originalTask: updatedTask
              };
            }
            return task;
          })
        );
        
        // Update the selected task
        setSelectedTask(updatedTask);
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  }, [selectedTask, mapApiStatusToUIStatus]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks by status for Kanban
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'inProgress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return {
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
    fetchTasks,
    mapApiStatusToUIStatus,
    mapUIStatusToApiStatus,
    setTasks
  };
};
