import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Users, Check, List, UserCog, BarChart } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import projectService from '@/services/projectService';
import { useToast } from '@/components/ui/use-toast';

interface Project {
  id: number;
  name: string;
  description: string;
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
  const { toast } = useToast();
  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');
  const isLeader = currentUser?.user.roles?.includes('LEADER');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  // Fetch projects from the API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.getAllProjects();
        if (response.success) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

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
      {loading ? (
        <div className="p-4 text-center text-sm text-gray-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-500">No projects found</div>
      ) : (
        projects.map((project) => (
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
                      {/* Show different options based on user role */}
                      {(isAdmin || isInstructor || isLeader) ? (
                        <div className="flex flex-col space-y-2">
                          {/* Project Analysis option for admin, instructors and leaders */}
                          <Link 
                            to={`/projects/${selectedProject}/project-analyze`}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <BarChart size={14} /> Project Analysis
                          </Link>
                          
                          {/* Group Analysis option for admin, instructors and leaders */}
                          <Link 
                            to={`/projects/${selectedProject}/group-analyze`}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
                          >
                            <Users size={14} /> Group Analysis
                          </Link>
                          
                          {/* Project Management for admins and instructors only */}
                          {(isAdmin || isInstructor) && (
                            <Link 
                              to={`/projects/${selectedProject}/edit`}
                              className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800"
                            >
                              <UserCog size={14} /> Manage Project
                            </Link>
                          )}
                        </div>
                      ) : (
                        /* Regular options for normal students */
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
                      )}
                      
                      {/* Only show available groups to regular students */}
                      {!(isAdmin || isInstructor || isLeader) && (
                        <>
                          <div className="text-xs text-gray-500 font-medium mt-2 mb-1">AVAILABLE GROUPS</div>
                          {groups.length > 0 ? (
                            groups.map(group => (
                              <button
                                key={group.id}
                                className="flex justify-between items-center px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
                                onClick={() => handleGroupJoin(group.id)}
                              >
                                <span>{group.name}</span>
                                <span className="text-xs text-gray-500">{group.members} members</span>
                              </button>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500 py-2">No groups available</div>
                          )}
                        </>
                      )}
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
                    
                    {(isAdmin || isInstructor || isLeader) && (
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center pl-3 pr-4 py-1.5 text-sm hover:bg-gray-100 w-full text-left">
                          <BarChart size={14} className="mr-2" />
                          <span>Project Analyze</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Link 
                            to={`/projects/${project.id}/project-analyze`}
                            className="flex items-center pl-9 pr-4 py-1.5 text-xs hover:bg-gray-100"
                          >
                            View Project Analytics
                          </Link>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {(isAdmin || isInstructor) && (
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center pl-3 pr-4 py-1.5 text-sm hover:bg-gray-100 w-full text-left">
                          <UserCog size={14} className="mr-2" />
                          <span>Project Management</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Link 
                            to={`/projects/${project.id}/edit`}
                            className="flex items-center pl-9 pr-4 py-1.5 text-xs hover:bg-gray-100"
                          >
                            Edit Project
                          </Link>
                          <Link 
                            to={`/projects/${project.id}/details`}
                            className="flex items-center pl-9 pr-4 py-1.5 text-xs hover:bg-gray-100"
                          >
                            View Details
                          </Link>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ProjectList;
