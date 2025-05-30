import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { animations, animateOnScroll } from '@/lib/animations';
import { animate, stagger } from 'animejs';

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
  
  const projectListRef = useRef<HTMLDivElement>(null);
  const animationTriggered = useRef(false); // Add ref to track animation
  
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

  // Animation effects
  useEffect(() => {
    if (!loading && projects.length > 0 && !animationTriggered.current) {
      // Entrance animation for project list
      setTimeout(() => {
        animations.list.staggeredAppear('.project-list-item', 80);
      }, 100);
      animationTriggered.current = true;
    }
  }, [loading, projects.length]); // Only depend on loading and projects count

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

  // Handle project item click animation
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
    <div ref={projectListRef} className="mt-1">
      {loading ? (
        <div className="p-4 text-center">
          <LoadingSpinner size="sm" variant="dots" />
          <p className="text-sm text-gray-500 mt-2">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-500">
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="text-gray-400 mb-2">📁</div>
            <p className="mb-2">No projects found</p>
            <button 
              onClick={handleRefreshProjects}
              className="text-purple-500 hover:text-purple-700 text-xs px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 transition-all duration-300 hover:scale-105"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        projects.map((project) => (
          <div key={project.id} className="project-list-item opacity-0">
            <div 
              data-project-id={project.id}
              onClick={() => handleProjectClick(project.id)}
              className={cn(
                "flex items-center px-4 py-2.5 my-1 text-sm cursor-pointer rounded-lg transition-all duration-300 group relative overflow-hidden",
                selectedProject === project.id 
                  ? "text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 shadow-sm border-l-4 border-purple-500" 
                  : "text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? project.name : ""}
            >
              {/* Active indicator glow effect */}
              {selectedProject === project.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-lg" />
              )}
              
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10",
                selectedProject === project.id 
                  ? "border-purple-500 bg-purple-500 shadow-lg shadow-purple-500/25" 
                  : "border-gray-300 group-hover:border-purple-400",
                isCollapsed ? "mr-0" : "mr-3"
              )}>
                {selectedProject === project.id && (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                )}
              </div>
              
              {!isCollapsed && (
                <span className="truncate font-medium relative z-10 group-hover:scale-105 transition-transform duration-300">
                  {project.name}
                </span>
              )}
              
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/5 group-hover:to-pink-400/5 transition-all duration-300 rounded-lg" />
            </div>
            {!isCollapsed && selectedProject === project.id && (
              <div className="ml-6 border-l border-purple-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-r-lg">
                <div className="py-2">
                  {/* Project Info option - available for all users */}
                  <div
                    className="flex items-center pl-4 pr-4 py-2 text-sm hover:bg-white/80 w-full text-left cursor-pointer transition-all duration-300 hover:shadow-sm group border-b border-purple-100/50 last:border-b-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}/details`);
                    }}
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <Info size={12} className="text-white" />
                    </div>
                    <span className="text-blue-600 font-medium group-hover:text-blue-700">Project Info</span>
                  </div>

                  {/* Manage Group option - available for group leaders, admins, and instructors */}
                  {(isGroupLeader(project.id) || isAdmin || isInstructor) && isGroupMember(project.id) && (
                    <div
                      className="flex items-center pl-4 pr-4 py-2 text-sm hover:bg-white/80 w-full text-left cursor-pointer transition-all duration-300 hover:shadow-sm group border-b border-purple-100/50 last:border-b-0"
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
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <UserCog size={12} className="text-white" />
                      </div>
                      <span className="text-purple-600 font-medium group-hover:text-purple-700">Manage Group</span>
                    </div>
                  )}

                  {/* Group Analysis option */}
                  {(isGroupLeader(project.id) || isAdmin || isInstructor) && (
                    <div
                      className="flex items-center pl-4 pr-4 py-2 text-sm hover:bg-white/80 w-full text-left cursor-pointer transition-all duration-300 hover:shadow-sm group border-b border-purple-100/50 last:border-b-0"
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
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Users size={12} className="text-white" />
                      </div>
                      <span className="text-green-600 font-medium group-hover:text-green-700">Group Analysis</span>
                    </div>
                  )}
                  
                  {/* Project Analysis for admin/instructor */}
                  {(isAdmin || isInstructor) && (
                    <div
                      className="flex items-center pl-4 pr-4 py-2 text-sm hover:bg-white/80 w-full text-left cursor-pointer transition-all duration-300 hover:shadow-sm group border-b border-purple-100/50 last:border-b-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/project-analyze`);
                      }}
                    >
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <BarChart size={12} className="text-white" />
                      </div>
                      <span className="text-blue-600 font-medium group-hover:text-blue-700">Project Analysis</span>
                    </div>
                  )}
                  
                  {/* Manage Project for admin/instructor */}
                  {(isAdmin || isInstructor) && (
                    <div
                      className="flex items-center pl-4 pr-4 py-2 text-sm hover:bg-white/80 w-full text-left cursor-pointer transition-all duration-300 hover:shadow-sm group border-b border-purple-100/50 last:border-b-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/edit`);
                      }}
                    >
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <UserCog size={12} className="text-white" />
                      </div>
                      <span className="text-orange-500 font-medium group-hover:text-orange-600">Manage Project</span>
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
