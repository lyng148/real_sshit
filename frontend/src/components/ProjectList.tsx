
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Users, Check, List, UserCog } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: number;
  name: string;
  path?: string;
  isActive?: boolean;
}

interface Group {
  id: number;
  name: string;
  members: number;
}

export const ProjectList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  console.log(currentUser)
  
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  
  const projects: Project[] = [
    { id: 1, name: 'MerahPutih - Saas Dashboard', path: '/projects/1', isActive: true },
    { id: 2, name: 'NexaAgency - Landing Page', path: '/projects/2' },
    { id: 3, name: 'Tomoro - POS Dashboard', path: '/projects/3' },
    { id: 4, name: 'GOTO Project', path: '/projects/4' },
  ];

  const groups: Group[] = [
    { id: 1, name: 'Group A', members: 5 },
    { id: 2, name: 'Group B', members: 3 },
    { id: 3, name: 'Group C', members: 7 },
  ];

  const handleProjectClick = (projectId: number) => {
    if (selectedProject === projectId) {
      setSelectedProject(null);
    } else {
      setSelectedProject(projectId);
      if (!selectedGroup) {
        navigate(`/projects/${projectId}/groups`);
      }
    }
  };

  const handleGroupJoin = (groupId: number) => {
    setSelectedGroup(groupId);
  };

  return (
    <div className="mt-1">
      {projects.map((project) => (
        <div key={project.id}>
          <div 
            onClick={() => handleProjectClick(project.id)}
            className={cn(
              "flex items-center px-4 py-1.5 my-0.5 text-sm hover:bg-gray-100 cursor-pointer",
              selectedProject === project.id ? "text-blue-600" : "text-gray-800"
            )}
          >
            <div className={cn(
              "w-4 h-4 mr-3 rounded-full border flex items-center justify-center",
              selectedProject === project.id ? "border-blue-500" : "border-gray-300"
            )}>
              {selectedProject === project.id && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
            </div>
            <span className="truncate">{project.name}</span>
          </div>
          
          {selectedProject === project.id && (
            <div className="ml-9 border-l border-gray-200">
              {!selectedGroup ? (
                <div className="pl-3 pr-4 py-2">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between mb-2">
                      <button 
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => navigate(`/projects/${project.id}/create-group`)}
                      >
                        <Plus size={14} /> Create Group
                      </button>
                      <button 
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
                        onClick={() => {
                          // Auto-join logic would go here
                          if (groups.length > 0) {
                            handleGroupJoin(groups[0].id);
                          }
                        }}
                      >
                        <Users size={14} /> Auto Join
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 font-medium mt-2 mb-1">AVAILABLE GROUPS</div>
                    {groups.map(group => (
                      <button
                        key={group.id}
                        className="flex justify-between items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
                        onClick={() => handleGroupJoin(group.id)}
                      >
                        <span>{group.name}</span>
                        <span className="text-xs text-gray-500">{group.members} members</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center pl-3 pr-4 py-1.5 text-sm hover:bg-gray-100 w-full text-left">
                      <List size={14} className="mr-2" />
                      <span>Tasks</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Link 
                        to={`/projects/${project.id}/tasks`}
                        className="flex items-center pl-9 pr-4 py-1.5 text-xs hover:bg-gray-100"
                      >
                        View Kanban
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center pl-3 pr-4 py-1.5 text-sm hover:bg-gray-100 w-full text-left">
                      <Users size={14} className="mr-2" />
                      <span>Group Analyze</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Link 
                        to={`/projects/${project.id}/group-analyze`}
                        className="flex items-center pl-9 pr-4 py-1.5 text-xs hover:bg-gray-100"
                      >
                        View Analytics
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {isAdmin && (
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center pl-3 pr-4 py-1.5 text-sm hover:bg-gray-100 w-full text-left">
                        <UserCog size={14} className="mr-2" />
                        <span>Admin Analyze</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <Link 
                          to={`/projects/${project.id}/admin-analyze`}
                          className="flex items-center pl-9 pr-4 py-1.5 text-xs hover:bg-gray-100"
                        >
                          View Admin Analytics
                        </Link>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
