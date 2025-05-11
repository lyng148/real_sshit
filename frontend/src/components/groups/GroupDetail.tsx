
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart, Calendar, List, Clock, Link as LinkIcon, GitBranch } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Group } from '@/services/groupService';
import { Badge } from "@/components/ui/badge";

interface GroupDetailProps {
  group: Group;
  projectId: string | undefined;
  isAdmin: boolean;
  isInstructor: boolean;
  isGroupLeader: (projectId: number) => boolean;
  currentView: 'kanban' | 'analytics' | 'timeline' | 'calendar';
  setCurrentView: (view: 'kanban' | 'analytics' | 'timeline' | 'calendar') => void;
  getInitials: (name: string) => string;
  onViewMembers: (group: Group) => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({
  group,
  projectId,
  isAdmin,
  isInstructor,
  isGroupLeader,
  currentView,
  setCurrentView,
  getInitials,
  onViewMembers
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
            <Badge variant="outline" className="text-xs">
              {group.memberCount}/{group.maxMembers} members
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">{group.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewMembers(group)}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Members
          </Button>
          
          {/* Only student leader has Analytics button */}
          {(!isAdmin && !isInstructor && isGroupLeader(Number(projectId))) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (currentView === 'kanban' || currentView === 'timeline' || currentView === 'calendar') {
                  navigate(`/projects/${projectId}/groups/${group.id}/analyze`);
                } else {
                  navigate(`/projects/${projectId}/groups/${group.id}`);
                }
              }}
              className="flex items-center gap-2"
            >
              {currentView === 'kanban' || currentView === 'timeline' || currentView === 'calendar' ? (
                <>
                  <BarChart className="h-4 w-4" />
                  Analytics
                </>
              ) : (
                <>
                  <List className="h-4 w-4" />
                  Tasks
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* View tabs */}
      <Tabs 
        value={currentView} 
        onValueChange={(value) => setCurrentView(value as 'kanban' | 'analytics' | 'timeline' | 'calendar')}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Task List</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Group Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
              <a 
                href={group.repositoryUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline break-all text-sm"
              >
                {group.repositoryUrl ? group.repositoryUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '') : "Not set"}
              </a>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Team Members</CardTitle>
          </CardHeader>          <CardContent>
            <div className="flex -space-x-2 overflow-hidden">
              {group.members.slice(0, 4).map((member, index) => (
                <Avatar key={index} className="border-2 border-white">
                  {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.fullName} />}
                  <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(member.fullName)}</AvatarFallback>
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
            <CardTitle className="text-sm font-medium text-gray-500">Project</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <span className="font-medium text-sm">{group.projectName}</span>
            <div className="ml-auto flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupDetail;
