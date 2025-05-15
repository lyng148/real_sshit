import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart, Calendar, List, Clock, Link as LinkIcon, GitBranch, UserSquare2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Group } from '@/services/groupService';
import { Badge } from "@/components/ui/badge";
import ReviewTriggerButton from '../peer-review/ReviewTriggerButton';
import PeerReviewModal from '../peer-review/PeerReviewModal';
import PeerReviewResults from '../peer-review/PeerReviewResults';
import { peerReviewService } from '@/services/peerReviewService';


interface GroupDetailProps {
  group: Group;
  projectId: string | undefined;
  isAdmin: boolean;
  isInstructor: boolean;
  isGroupLeader: (projectId: number) => boolean;
  currentView: 'kanban' | 'timeline' | 'calendar' | 'peer-reviews';
  setCurrentView: (view: 'kanban' | 'timeline' | 'calendar' | 'peer-reviews') => void;
  getInitials: (name: string) => string;
  onViewMembers: (group: Group) => void;
  renderKanban?: React.ReactNode;
  renderTimeline?: React.ReactNode;
  renderCalendar?: React.ReactNode;
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
  onViewMembers,
  renderKanban,
  renderTimeline,
  renderCalendar
}) => {
  const navigate = useNavigate();
  const [showPeerReviewModal, setShowPeerReviewModal] = useState(false);
  const projectIdNumber = projectId ? parseInt(projectId, 10) : 0;
    // We handle peer review checks at the page level instead of component level
  // to avoid duplicate modals
  
  return (    <div className="mb-6">
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

          <ReviewTriggerButton 
            groupId={group.id}
            projectId={projectIdNumber} 
            isGroupLeader={isGroupLeader(group.projectId)}
          />
        </div>
      </div>
      
      {/* Group Information Cards - Moved above tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
          </CardHeader>          
          <CardContent>
            <div className="flex -space-x-2 overflow-hidden">              
              {group.members.slice(0, 4).map((member, index) => (
                <Avatar key={index} className="border-2 border-white">
                  {/* Member doesn't have avatarUrl property in the interface */}
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
      </div>{/* View tabs */}      <Tabs 
        value={currentView} 
        onValueChange={(value) => setCurrentView(value as 'kanban' | 'timeline' | 'calendar' | 'peer-reviews')}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-4 w-full mb-4">
          <TabsTrigger value="kanban" className="flex items-center gap-1.5">
            <BarChart className="h-4 w-4" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>          <TabsTrigger value="peer-reviews" className="flex items-center gap-1.5">
            <UserSquare2 className="h-4 w-4" />
            Peer Reviews
          </TabsTrigger>
        </TabsList><TabsContent value="kanban" className="space-y-4">
          {renderKanban || <div className="text-center py-6 text-gray-500">No Kanban content available</div>}
        </TabsContent>
        <TabsContent value="timeline" className="space-y-4">
          {renderTimeline || <div className="text-center py-6 text-gray-500">No Timeline content available</div>}
        </TabsContent>        <TabsContent value="calendar" className="space-y-4">
          {renderCalendar || <div className="text-center py-6 text-gray-500">No Calendar content available</div>}
        </TabsContent>
        <TabsContent value="peer-reviews" className="space-y-4">
          <div>
            <PeerReviewResults projectId={projectIdNumber} />
          </div>
        </TabsContent>
      </Tabs>
      
    {/* We've moved the automatic peer review check to the page level to avoid duplicate modals */}
    {/* This modal will only appear when the user clicks "Peer Review" in the Review button */}
    <PeerReviewModal
      projectId={projectIdNumber}
      open={showPeerReviewModal}
      onOpenChange={(open) => {
        setShowPeerReviewModal(open);
      }}
    />    </div>
  );
};

export default GroupDetail;
