
import React from 'react';
import { Eye, Users, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Group } from '@/services/groupService';
import { Badge } from "@/components/ui/badge";

interface GroupsListProps {
  groups: Group[];
  isAdmin: boolean;
  isInstructor: boolean;
  projectId: string | undefined;
  onViewMembers: (group: Group) => void;
  onJoinGroup: (groupId: number, projectId: number) => void;
  onViewGroup: (groupId: number) => void;
}

const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  isAdmin,
  isInstructor,
  projectId,
  onViewMembers,
  onJoinGroup,
  onViewGroup
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Project Groups</h3>
        <div className="text-sm text-gray-500">{groups.length} groups</div>
      </div>
      
      {groups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No groups found for this project.</p>
          {!isAdmin && !isInstructor && (
            <Button onClick={() => {}} className="mt-4">
              Create a New Group
            </Button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {groups.map(group => (
            <div key={group.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-lg text-gray-900">{group.name}</h3>
                <Badge variant={group.memberCount >= group.maxMembers ? "destructive" : "outline"}>
                  {group.memberCount}/{group.maxMembers} members
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {group.description || "No description provided."}
              </p>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                {isAdmin || isInstructor ? (
                  <Button 
                    onClick={() => onViewGroup(group.id)} 
                    variant="default" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Group
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onViewMembers(group)} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      View Members
                    </Button>
                    <Button 
                      onClick={() => projectId && onJoinGroup(group.id, Number(projectId))} 
                      variant={group.memberCount >= group.maxMembers ? "secondary" : "default"}
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={group.memberCount >= group.maxMembers}
                    >
                      {group.memberCount >= group.maxMembers ? "Full" : (
                        <>
                          Join
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsList;
