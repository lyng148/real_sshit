
import { useState, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import taskService from '@/services/taskService';
import { Task } from '@/types/task';

interface UseTaskManagementProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  mapUIStatusToApiStatus: (uiStatus: string) => 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export const useTaskManagement = ({ tasks, setTasks, mapUIStatusToApiStatus }: UseTaskManagementProps) => {
  const { toast } = useToast();

  const onDragEnd = useCallback(async (result: any) => {
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

    // Find the task that was moved
    const taskToUpdate = tasks.find(task => task.id === draggableId);
    if (!taskToUpdate || !taskToUpdate.originalTask) return;

    // New status based on the destination droppable
    const newUIStatus = destination.droppableId as 'todo' | 'inProgress' | 'completed';
    const newApiStatus = mapUIStatusToApiStatus(newUIStatus);

    try {
      // Optimistically update UI
      const updatedTasks = tasks.map(task => {
        if (task.id === draggableId) {
          return {
            ...task,
            status: newUIStatus
          };
        }
        return task;
      });
      setTasks(updatedTasks);

      // Call API to update task status
      const response = await taskService.updateTaskStatus(parseInt(draggableId), newApiStatus);
      
      // If we get a successful response with updated task data, update the originalTask reference
      if (response && response.data) {
        setTasks(prevTasks => 
          prevTasks.map(task => {
            if (task.id === draggableId) {
              return { ...task, originalTask: response.data };
            }
            return task;
          })
        );
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Revert to original status on error
      setTasks(prevState => [...prevState]);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  }, [tasks, setTasks, mapUIStatusToApiStatus, toast]);

  const moveTaskForward = useCallback(async (taskId: string) => {
    // Find the task to update
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate || !taskToUpdate.originalTask) return;
    
    // Determine the new status
    let newUIStatus: 'todo' | 'inProgress' | 'completed' = 'todo';
    if (taskToUpdate.status === 'todo') newUIStatus = 'inProgress';
    else if (taskToUpdate.status === 'inProgress') newUIStatus = 'completed';
    else return; // Already completed, can't move forward
    
    const newApiStatus = mapUIStatusToApiStatus(newUIStatus);
    
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            return { ...task, status: newUIStatus };
          }
          return task;
        })
      );
      
      // Call API to update task status
      const response = await taskService.updateTaskStatus(parseInt(taskId), newApiStatus);
      
      // If we get a successful response with updated task data, update the originalTask reference
      if (response && response.data) {
        setTasks(prevTasks => 
          prevTasks.map(task => {
            if (task.id === taskId) {
              return { ...task, originalTask: response.data };
            }
            return task;
          })
        );
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Revert on error
      setTasks(prevState => [...prevState]); 
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  }, [tasks, setTasks, mapUIStatusToApiStatus, toast]);

  const moveTaskBackward = useCallback(async (taskId: string) => {
    // Find the task to update
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate || !taskToUpdate.originalTask) return;
    
    // Determine the new status
    let newUIStatus: 'todo' | 'inProgress' | 'completed' = 'completed';
    if (taskToUpdate.status === 'inProgress') newUIStatus = 'todo';
    else if (taskToUpdate.status === 'completed') newUIStatus = 'inProgress';
    else return; // Already in todo, can't move backward
    
    const newApiStatus = mapUIStatusToApiStatus(newUIStatus);
    
    try {
      // Optimistically update UI
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            return { ...task, status: newUIStatus };
          }
          return task;
        })
      );
      
      // Call API to update task status
      const response = await taskService.updateTaskStatus(parseInt(taskId), newApiStatus);
      
      // If we get a successful response with updated task data, update the originalTask reference
      if (response && response.data) {
        setTasks(prevTasks => 
          prevTasks.map(task => {
            if (task.id === taskId) {
              return { ...task, originalTask: response.data };
            }
            return task;
          })
        );
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Revert on error
      setTasks(prevState => [...prevState]); 
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  }, [tasks, setTasks, mapUIStatusToApiStatus, toast]);

  return {
    onDragEnd,
    moveTaskForward,
    moveTaskBackward
  };
};
