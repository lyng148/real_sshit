
import React from 'react';
import { Calendar, CheckCircle2, Clock, Circle, ArrowRight } from 'lucide-react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TaskTimelineProps {
  tasks: Task[];
  tasksLoading: boolean;
  tasksError: string | null;
  isGroupLeader: boolean;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({
  tasks,
  tasksLoading,
  tasksError,
  isGroupLeader,
  onAddTask,
  onTaskClick
}) => {
  // Group tasks by due date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!task.dueDate) return acc;
    
    const date = task.dueDate.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  // Sort dates
  const sortedDates = Object.keys(tasksByDate).sort();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'inProgress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (task: Task) => {
    if (!task.originalTask) return null;
    
    const priority = task.originalTask.priority;
    switch (priority) {
      case 'CRITICAL':
        return <Badge className="bg-red-500">Critical</Badge>;
      case 'HIGH':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Medium</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="text-gray-500">Low</Badge>;
      default:
        return null;
    }
  };

  if (tasksLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-lg text-gray-600">Loading timeline...</span>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
        <p>{tasksError}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded flex flex-col items-center">
        <p className="mb-4 text-lg">No tasks found for this group.</p>
        {isGroupLeader && (
          <Button onClick={onAddTask}>
            Create your first task
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Timeline View
        </h3>
        {isGroupLeader && (
          <Button variant="outline" size="sm" onClick={onAddTask}>
            Add Task
          </Button>
        )}
      </div>

      <div className="p-6">
        {sortedDates.length > 0 ? (
          <div className="space-y-8">
            {sortedDates.map(date => (
              <div key={date} className="relative">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-medium">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </h3>
                </div>
                
                <div className="ml-2 pl-6 border-l-2 border-gray-200 space-y-4">
                  {tasksByDate[date].map(task => (
                    <div 
                      key={task.id} 
                      className="relative bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="absolute -left-8 top-4 bg-white rounded-full p-1">
                        {getStatusIcon(task.status)}
                      </div>
                      
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800">{task.title}</h4>
                        {getPriorityBadge(task)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        {task.assignee && (
                          <div className="flex items-center">
                            <span className="bg-gray-200 w-5 h-5 rounded-full flex items-center justify-center mr-1">
                              {task.assignee.charAt(0).toUpperCase()}
                            </span>
                            <span>{task.assignee}</span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Due {format(new Date(task.dueDate), 'h:mm a')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No tasks with due dates to display on the timeline
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTimeline;
