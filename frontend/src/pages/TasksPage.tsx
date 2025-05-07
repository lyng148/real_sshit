
import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'completed';
  assignee?: string;
  dueDate?: string;
}

const TasksPage = () => {
  const { projectId } = useParams();
  
  // Initial tasks data
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Research competitors', description: 'Analyze top 5 competitors', status: 'todo', assignee: 'John Doe', dueDate: '2025-05-15' },
    { id: '2', title: 'Create wireframes', description: 'Design wireframes for key pages', status: 'todo', assignee: 'Jane Smith', dueDate: '2025-05-20' },
    { id: '3', title: 'Setup project structure', description: 'Initialize repository and setup project structure', status: 'inProgress', assignee: 'Alex Johnson', dueDate: '2025-05-10' },
    { id: '4', title: 'User research', description: 'Conduct user interviews', status: 'inProgress', assignee: 'Maria Garcia', dueDate: '2025-05-12' },
    { id: '5', title: 'Define MVP features', description: 'Identify core features for MVP', status: 'completed', assignee: 'Mike Smith', dueDate: '2025-05-05' },
  ]);

  // Handle drag and drop
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
                          >
                            <div className="flex justify-between items-start mb-2">
                              <button 
                                onClick={() => moveTaskBackward(task.id)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <ArrowLeft size={16} />
                              </button>
                              <h4 className="font-medium text-gray-800 flex-1 mx-2">{task.title}</h4>
                              <button 
                                onClick={() => moveTaskForward(task.id)}
                                className="text-gray-500 hover:text-blue-600"
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
                          >
                            <div className="flex justify-between items-start mb-2">
                              <button 
                                onClick={() => moveTaskBackward(task.id)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <ArrowLeft size={16} />
                              </button>
                              <h4 className="font-medium text-gray-800 flex-1 mx-2">{task.title}</h4>
                              <span className="text-green-500">
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
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default TasksPage;
