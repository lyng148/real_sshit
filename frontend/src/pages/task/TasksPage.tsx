
import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import taskService, { Task as ApiTask } from '@/services/taskService';
import axiosInstance from '@/services/axiosInstance';

// Task interface for the frontend
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'completed';
  assignee?: string;
  dueDate?: string;
  originalTask?: ApiTask; // Store the original API task for reference
}

const TasksPage = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) return;
      
      try {
        setIsLoading(true);        // First we need to get all groups in the project
        const groupsResponse = await axiosInstance.get(`/api/groups/project/${projectId}`);
        const groupsData = groupsResponse.data;
        
        if (!groupsData.data || groupsData.data.length === 0) {
          setError('No groups found for this project');
          setIsLoading(false);
          return;
        }
        
        // For simplicity, we'll get tasks from the first group
        const groupId = groupsData.data[0].id;        // Now get all tasks for this group
        const tasksResponse = await taskService.getTasks(groupId);
        
        // Backend API returns data in structure: { data: Task[], message: string, status: number }
        const apiTasks = tasksResponse?.data || [];
        
        if (apiTasks.length === 0) {
          setTasks([]);
          setIsLoading(false);
          return; // No tasks to display
        }
        
        // Map API tasks to UI tasks
        const uiTasks = apiTasks.map(apiTask => ({
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
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [projectId]);  // Handle drag and drop
  const onDragEnd = async (result: any) => {
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
      // Could show an error toast here
    }
  };// Move task to next column
  const moveTaskForward = async (taskId: string) => {
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
      // Could show an error toast here
    }
  };
  // Move task to previous column
  const moveTaskBackward = async (taskId: string) => {
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
      // Could show an error toast here
    }
  };
  // Filter tasks by status
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'inProgress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Project Tasks</h1>
          <p className="text-gray-600">Project ID: {projectId}</p>
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <span className="ml-2 text-lg text-gray-600">Loading tasks...</span>
          </div>
        )}
          {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {!isLoading && !error && tasks.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded flex flex-col items-center">
            <p className="mb-4 text-lg">No tasks found for this project.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Create your first task
            </button>
          </div>
        )}{!isLoading && !error && tasks.length > 0 && (
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
                          >                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-800">{task.title}</h4>
                              <button 
                                onClick={() => moveTaskForward(task.id)}
                                className="text-gray-500 hover:text-blue-600"
                                aria-label="Move task forward"
                                title="Move task forward"
                              >
                                <ArrowRight size={16} />
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
                          >                            <div className="flex justify-between items-start mb-2">
                              <button 
                                onClick={() => moveTaskBackward(task.id)}
                                className="text-gray-500 hover:text-blue-600"
                                aria-label="Move task backward"
                                title="Move task backward"
                              >
                                <ArrowLeft size={16} />
                              </button>
                              <h4 className="font-medium text-gray-800 flex-1 mx-2">{task.title}</h4>
                              <button 
                                onClick={() => moveTaskForward(task.id)}
                                className="text-gray-500 hover:text-blue-600"
                                aria-label="Move task forward"
                                title="Move task forward"
                              >
                                <ArrowRight size={16} />
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
                          >                            <div className="flex justify-between items-start mb-2">
                              <button 
                                onClick={() => moveTaskBackward(task.id)}
                                className="text-gray-500 hover:text-blue-600"
                                aria-label="Move task backward"
                                title="Move task backward"
                              >
                                <ArrowLeft size={16} />
                              </button>
                              <h4 className="font-medium text-gray-800 flex-1 mx-2">{task.title}</h4>
                              <span className="text-green-500" title="Completed" aria-label="Task completed">
                                <Check size={16} />
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
            </div>          </div>
        </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
