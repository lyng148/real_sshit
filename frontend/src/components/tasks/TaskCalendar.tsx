
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Task } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface TaskCalendarProps {
  tasks: Task[];
  tasksLoading: boolean;
  tasksError: string | null;
  isGroupLeader: boolean;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  tasksLoading,
  tasksError,
  isGroupLeader,
  onAddTask,
  onTaskClick
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Prepare task data for calendar
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!task.dueDate) return acc;
    
    const date = task.dueDate.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  // Get tasks for selected date
  const getTasksForDate = (date: Date | undefined): Task[] => {
    if (!date) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasksByDate[dateStr] || [];
  };
  
  // Generate calendar day content with task indicators
  const getDayContent = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const tasksOnDate = tasksByDate[dateStr] || [];
    
    if (tasksOnDate.length > 0) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {day.getDate()}
          <span className="absolute bottom-1 w-5 h-1 rounded-full bg-blue-500"></span>
        </div>
      );
    }
    
    return day.getDate();
  };
  
  // Tasks for selected date
  const selectedDateTasks = getTasksForDate(selectedDate);
  
  const getPriorityColor = (task: Task) => {
    if (!task.originalTask) return "bg-gray-200";
    
    const priority = task.originalTask.priority;
    switch (priority) {
      case 'CRITICAL': return "bg-red-500";
      case 'HIGH': return "bg-orange-500";
      case 'MEDIUM': return "bg-amber-400";
      case 'LOW': return "bg-blue-300";
      default: return "bg-gray-200";
    }
  };
  
  if (tasksLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-lg text-gray-600">Loading calendar...</span>
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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          Calendar View
        </h3>
        {isGroupLeader && (
          <Button variant="outline" size="sm" onClick={onAddTask} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="col-span-1 md:col-span-5 lg:col-span-5">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border p-3 pointer-events-auto"
            components={{
              DayContent: ({ day }) => getDayContent(day),
            }}
          />
        </div>
        
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </h3>
              <Badge variant="outline">
                {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'}
              </Badge>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDateTasks.length > 0 ? (
                selectedDateTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task)}`}></div>
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                    {task.assignee && (
                      <div className="text-xs text-gray-500 mt-2">
                        Assigned to: {task.assignee}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No tasks scheduled for this day
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskCalendar;
