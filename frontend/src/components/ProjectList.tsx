import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Users, Check, List, BarChart, Eye, UserCog, Info } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import projectService from '@/services/projectService';
import groupService, { Group } from '@/services/groupService';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Dùng một đối tượng global để cache danh sách dự án
const cachedProjects = {
  projects: [],
  isLoaded: false
};

interface Project {
  id: number;
  name: string;
  description: string;
  path?: string;
  isActive?: boolean;
}

interface ProjectListProps {
  isCollapsed?: boolean;
}

export const ProjectList: React.FC<ProjectListProps> = ({ isCollapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');
  
  const [loading, setLoading] = useState(!cachedProjects.isLoaded);
  const [projects, setProjects] = useState<Project[]>(cachedProjects.projects);
  const [ledGroups, setLedGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [showGroupListForProject, setShowGroupListForProject] = useState<number | null>(null);
  
  // Extract the projectId from the current URL
  const pathSegments = location.pathname.split('/');
  const projectIdFromUrl = pathSegments.length > 2 && pathSegments[1] === 'projects' 
    ? parseInt(pathSegments[2], 10) 
    : null;
    
  // Use the URL projectId for state, or fallback to component state
  const [selectedProject, setSelectedProject] = useState<number | null>(projectIdFromUrl);

  // Memoize the fetchProjects function
  const fetchProjects = useCallback(async () => {
    // Skip if projects are already cached
    if (cachedProjects.isLoaded) {
      setProjects(cachedProjects.projects);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await projectService.getAllProjects();
      if (response.success) {
        // Update both the state and the cache
        setProjects(response.data);
        cachedProjects.projects = response.data;
        cachedProjects.isLoaded = true;
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
  }, [toast]);

  // Update selected project when URL changes
  useEffect(() => {
    if (projectIdFromUrl && !isNaN(projectIdFromUrl)) {
      setSelectedProject(projectIdFromUrl);
    } else {
      // Reset selection if we're not on a project route
      if (!location.pathname.includes('/projects/')) {
        setSelectedProject(null);
      }
    }
  }, [location.pathname, projectIdFromUrl]);

  // Fetch projects once on component mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  // Fetch led groups
  useEffect(() => {
    const fetchLedGroups = async () => {
      if (currentUser) {
        try {
          const response = await groupService.getMyLedGroups();
          if (response.success) {
            setLedGroups(response.data || []);
          }
        } catch (error) {
          console.error("Error fetching led groups:", error);
        }
      }
    };
    
    fetchLedGroups();
  }, [currentUser]);

  // Fetch all groups user is a member of
  useEffect(() => {
    const fetchMyGroups = async () => {
      if (currentUser) {
        try {
          const response = await groupService.getMyGroups();
          if (response.success) {
            setMyGroups(response.data || []);
          }
        } catch (error) {
          console.error("Error fetching my groups:", error);
        }
      }
    };
    fetchMyGroups();
  }, [currentUser]);

  // Fetch all groups for selected project (for ALL GROUPS and admin/instructor logic)
  useEffect(() => {
    if (selectedProject) {
      groupService.getAllGroups(selectedProject).then(res => {
        if (res.success) setAllGroups(res.data || []);
      });
    }
  }, [selectedProject]);

  const handleProjectClick = (projectId: number) => {
    setSelectedProject(projectId); // cập nhật state ngay lập tức
    navigate(`/projects/${projectId}/groups`);
  };

  // Check if user is a leader of a group in the selected project
  const isGroupLeader = (projectId: number): boolean => {
    return ledGroups.some(group => group.projectId === projectId);
  };

  // Lấy group đầu tiên của user trong project
  const getFirstUserGroupId = (projectId: number) => {
    const group = myGroups.find(g => g.projectId === projectId);
    return group ? group.id : null;
  };

  // Check if user is a member of any group in the project
  const isGroupMember = (projectId: number): boolean => {
    return myGroups.some(group => group.projectId === projectId);
  };

  // Chức năng làm mới danh sách dự án
  const handleRefreshProjects = () => {
    cachedProjects.isLoaded = false;
    fetchProjects();
  };

  return (
    <div className="mt-1">
      {loading ? (
        <div className="p-4 text-center text-sm text-gray-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-500">
          No projects found
          <button 
            onClick={handleRefreshProjects}
            className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
          >
            Refresh
          </button>
        </div>
      ) : (        projects.map((project) => (
          <div key={project.id}>
            <div 
              onClick={() => handleProjectClick(project.id)}
              className={cn(
                "flex items-center px-4 py-1.5 my-0.5 text-sm hover:bg-gray-100 cursor-pointer",
                selectedProject === project.id ? "text-blue-600" : "text-gray-800",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? project.name : ""}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border flex items-center justify-center",
                selectedProject === project.id ? "border-blue-500" : "border-gray-300",
                isCollapsed ? "mr-0" : "mr-3"
              )}>
                {selectedProject === project.id && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
              </div>
              {!isCollapsed && <span className="truncate">{project.name}</span>}
            </div>
            {!isCollapsed && selectedProject === project.id && (
              <div className="ml-6 border-l border-gray-200">
                <div>
                  {/* Project Info option - available for all users */}
                  <div
                    className="flex items-center pl-3 pr-4 py-1.5 text-sm hover:bg-gray-100 w-full text-left cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}/details`);
                    }}
                  >
                    <Info size={14} className="mr-2 text-blue-600" />
                    <span className="text-blue-600">Project Info</span>
                  </div>

                  {/* Manage Group option - available for group leaders, admins, and instructors */}
                  {(isGroupLeader(project.id) || isAdmin || isInstructor) && isGroupMember(project.id) && (
                    <div
                      className="flex items-center pl-3 pr-4 py-1.5 text-sm hover:bg-gray-100 w-full text-left cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        let groupId: number | null = null;
                        
                        if (isGroupLeader(project.id)) {
                          // Get the group that the user is a leader of in this project
                          const ledGroup = ledGroups.find(g => g.projectId === project.id);
                          groupId = ledGroup ? ledGroup.id : null;
                        } else if (isAdmin || isInstructor) {
                          // If admin/instructor is also a member of a group, use that group
                          const userGroup = myGroups.find(g => g.projectId === project.id);
                          if (userGroup) {
                            groupId = userGroup.id;
                          } else {
                            // Otherwise, get the first group in the project
                            groupId = allGroups.find(g => g.projectId === project.id)?.id || null;
                          }
                        }
                        
                        if (groupId) {
                          navigate(`/projects/${project.id}/groups/${groupId}/manage`);
                        } else {
                          toast({
                            title: "No group found",
                            description: "You don't have access to manage any group in this project.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <UserCog size={14} className="mr-2 text-purple-600" />
                      <span className="text-purple-600">Manage Group</span>
                    </div>
                  )}

                  {/* Group Analysis option */}
                  {(isGroupLeader(project.id) || isAdmin || isInstructor) && (
                    <div
                      className="flex items-center pl-3 pr-4 py-1.5 text-sm hover:bg-gray-100 w-full text-left cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        let groupId: number | null = null;
                        if (isAdmin || isInstructor) {
                          // Lấy group đầu tiên của project (cho admin/instructor)
                          groupId = allGroups.find(g => g.projectId === project.id)?.id || null;
                        } else {
                          // Lấy group đầu tiên của user (student)
                          groupId = getFirstUserGroupId(project.id);
                        }
                        if (groupId) {
                          navigate(`/projects/${project.id}/groups/${groupId}/analyze`);
                        } else {
                          toast({
                            title: "No group found",
                            description: isAdmin || isInstructor ? "No group exists in this project." : "You are not a member/leader of any group in this project.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Users size={14} className="mr-2 text-green-600" />
                      <span className="text-green-600">Group Analysis</span>
                    </div>
                  )}
                  {/* Other existing options */}
                  {(isAdmin || isInstructor) && (
                    <div
                      className="flex items-center pl-3 pr-4 py-1.5 text-sm hover:bg-gray-100 w-full text-left cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/project-analyze`);
                      }}
                    >
                      <BarChart size={14} className="mr-2 text-blue-600" />
                      <span className="text-blue-600">Project Analysis</span>
                    </div>
                  )}
                  {(isAdmin || isInstructor) && (
                    <div
                      className="flex items-center pl-3 pr-4 py-1.5 text-sm hover:bg-gray-100 w-full text-left cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/edit`);
                      }}
                    >
                      <UserCog size={14} className="mr-2 text-orange-500" />
                      <span className="text-orange-500">Manage Project</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ProjectList;
