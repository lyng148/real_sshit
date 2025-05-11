import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/task';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface KanbanBoardProps {
  tasks: Task[];
  tasksLoading: boolean;
  tasksError: string | null;
  isGroupLeader: boolean;
  projectId: string | undefined;
  todoTasks: Task[];
  inProgressTasks: Task[];
  completedTasks: Task[];
  onDragEnd: (result: any) => void;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  onMoveTaskForward: (taskId: string) => void;
  onMoveTaskBackward: (taskId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  tasksLoading,
  tasksError,
  isGroupLeader,
  projectId,
  todoTasks,
  inProgressTasks,
  completedTasks,
  onDragEnd,
  onAddTask,
  onTaskClick,
  onMoveTaskForward,
  onMoveTaskBackward,
}) => {
  
  // Helper function to get initials from a name
  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  return (
    <>
      {isGroupLeader && (
        <div className="mb-4">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={onAddTask}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </div>
      )}
      
      {tasksLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-2 text-lg text-gray-600">Loading tasks...</span>
        </div>
      )}
      
      {tasksError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
          <p>{tasksError}</p>
        </div>
      )}
      
      {!tasksLoading && !tasksError && tasks.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded flex flex-col items-center">
          <p className="mb-4 text-lg">No tasks found for this group.</p>
          {isGroupLeader && (
            <Button onClick={onAddTask}>
              Create your first task
            </Button>
          )}
        </div>
      )}
      
      {!tasksLoading && !tasksError && tasks.length > 0 && (
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
                            className="bg-white border border-gray-200 rounded-md p-3 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => onTaskClick(task)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-800">{task.title}</h4>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveTaskForward(task.id);
                                }}
                                className="text-gray-500 hover:text-blue-600"
                                aria-label="Move task forward"
                                title="Move task forward"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                                  <path d="M5 12h14"/>
                                  <path d="m12 5 7 7-7 7"/>
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            {task.assignee && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Avatar className="h-5 w-5 mr-1">
                                  {task.assigneeAvatarUrl && <AvatarImage src={task.assigneeAvatarUrl} alt={task.assignee} />}
                                  <AvatarFallback className="text-xs">{getInitials(task.assignee)}</AvatarFallback>
                                </Avatar>
                                <span>{task.assignee}</span>
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
                            className="bg-white border border-gray-200 rounded-md p-3 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => onTaskClick(task)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveTaskBackward(task.id);
                                }}
                                className="text-gray-500 hover:text-blue-600"
                                aria-label="Move task backward"
                                title="Move task backward"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
                                  <path d="M19 12H5"/>
                                  <path d="m12 19-7-7 7-7"/>
                                </svg>
                              </button>
                              <h4 className="font-medium text-gray-800 flex-1 mx-2">{task.title}</h4>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveTaskForward(task.id);
                                }}
                                className="text-gray-500 hover:text-blue-600"
                                aria-label="Move task forward"
                                title="Move task forward"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                                  <path d="M5 12h14"/>
                                  <path d="m12 5 7 7-7 7"/>
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            {task.assignee && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Avatar className="h-5 w-5 mr-1">
                                  {task.assigneeAvatarUrl && <AvatarImage src={task.assigneeAvatarUrl} alt={task.assignee} />}
                                  <AvatarFallback className="text-xs">{getInitials(task.assignee)}</AvatarFallback>
                                </Avatar>
                                <span>{task.assignee}</span>
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
                            className="bg-white border border-gray-200 rounded-md p-3 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => onTaskClick(task)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveTaskBackward(task.id);
                                }}
                                className="text-gray-500 hover:text-blue-600"
                                aria-label="Move task backward"
                                title="Move task backward"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
                                  <path d="M19 12H5"/>
                                  <path d="m12 19-7-7 7-7"/>
                                </svg>
                              </button>
                              <h4 className="font-medium text-gray-800 flex-1 mx-2">{task.title}</h4>
                              <span className="text-green-500" title="Completed" aria-label="Task completed">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                                  <path d="M20 6 9 17l-5-5"/>
                                </svg>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            {task.assignee && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Avatar className="h-5 w-5 mr-1">
                                  {task.assigneeAvatarUrl && <AvatarImage src={task.assigneeAvatarUrl} alt={task.assignee} />}
                                  <AvatarFallback className="text-xs">{getInitials(task.assignee)}</AvatarFallback>
                                </Avatar>
                                <span>{task.assignee}</span>
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
      )}
    </>
  );
};

export default KanbanBoard;
