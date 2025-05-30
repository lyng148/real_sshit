import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import groupService, { Group } from '@/services/groupService';

interface UseGroupsDataProps {
  projectId: string | undefined;
  usePagination?: boolean;
  initialPageSize?: number;
}

interface PaginationData {
  content: Group[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isFirst: boolean;
    isLast: boolean;
  };
}

export const useGroupsData = ({ projectId, usePagination = false, initialPageSize = 10 }: UseGroupsDataProps) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ledGroups, setLedGroups] = useState<Group[]>([]);
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [viewedGroup, setViewedGroup] = useState<Group | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(initialPageSize);
  
  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');

  // Check if user is a leader of a group in this project
  const isGroupLeader = useCallback((projectId: number): boolean => {
    return ledGroups.some(group => group.projectId === Number(projectId));
  }, [ledGroups]);

  const fetchGroups = useCallback(async (page: number = 0) => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      let response;
      
      if (usePagination) {
        response = await groupService.getAllGroupsPaginated(
          Number(projectId),
          page,
          pageSize,
          'name',
          'ASC'
        );
        
        if (response.success) {
          const paginatedData = response.data as PaginationData;
          setGroups(paginatedData.content || []);
          setTotalPages(paginatedData.pagination.totalPages);
          setTotalElements(paginatedData.pagination.totalElements);
          setCurrentPage(page);
        }
      } else {
        response = await groupService.getAllGroups(Number(projectId));
        
        if (response.success) {
          setGroups(response.data || []);
        }
      }
      
      if (response.success) {
        // Check if the user is in any of these groups (for non-admin/instructor users)
        if (!isAdmin && !isInstructor && currentUser) {
          const allGroups = usePagination ? (response.data as PaginationData).content : response.data;
          const userGroups = allGroups.filter((group: Group) => 
            group.members.some(member => member.id === currentUser.user.id)
          );
          
          if (userGroups.length > 0) {
            setUserGroup(userGroups[0]);
          }
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load groups",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, isAdmin, isInstructor, currentUser, toast, usePagination, pageSize]);

  const fetchLedGroups = useCallback(async () => {
    try {
      const response = await groupService.getMyLedGroups();
      if (response.success) {
        setLedGroups(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching led groups:", error);
    }
  }, []);

  const handleAutoJoinGroup = useCallback(async (groupId: number) => {
    try {
      const response = await groupService.joinGroup(groupId, Number(projectId));
      if (response.success) {
        toast({
          title: "Success",
          description: "You have successfully joined the group",
        });
        setUserGroup(groups.find(group => group.id === groupId) || null);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to join group",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }, [projectId, groups, toast]);

  const handleJoinGroup = useCallback(async (groupId: number, projectId: number) => {
    try {
      const response = await groupService.joinGroup(groupId, projectId);
      if (response.success) {
        toast({
          title: "Success",
          description: "You have successfully joined the group",
        });
        
        // Refresh groups after joining to update the view
        if (usePagination) {
          await fetchGroups(currentPage);
        } else {
          const updatedResponse = await groupService.getAllGroups(Number(projectId));
          if (updatedResponse.success) {
            setGroups(updatedResponse.data || []);
            
            // Find the group user just joined and set it as userGroup
            const joinedGroup = updatedResponse.data.find((g: Group) => g.id === groupId);
            if (joinedGroup) {
              setUserGroup(joinedGroup);
            }
          }
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to join group",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }, [toast, usePagination, currentPage, fetchGroups]);

  const handleAutoJoin = useCallback(async () => {
    if (!projectId) return;
    try {
      const response = await groupService.autoJoinGroup(Number(projectId));
      if (response.success) {
        toast({
          title: "Success",
          description: "You have been auto-assigned to a group!",
        });
        // Refetch groups to update UI
        if (usePagination) {
          await fetchGroups(currentPage);
        } else {
          await fetchGroups();
        }
      } else {
        console.error("Error auto-joining group:", response);
        toast({
          title: "Error",
          description: response.data.message || "Failed to auto join group",
          variant: "destructive",
        });
      }    
    } catch (error) {
      console.log(error.response.data.message);
      toast({
        title: "Error",
        description: (error.response?.data?.message ? error.response.data.message : "An unexpected error occurred") ||error.message,
        variant: "destructive",
      });
    }
  }, [projectId, fetchGroups, toast, usePagination, currentPage]);

  const handlePageChange = useCallback(async (page: number) => {
    if (usePagination) {
      await fetchGroups(page);
    }
  }, [fetchGroups, usePagination]);

  useEffect(() => {
    // Reset state when projectId changes
    setUserGroup(null);
    setGroups([]);
    setLoading(true);
    setViewedGroup(null);
    setCurrentPage(0);
    
    fetchGroups(0);
    if (!isAdmin && !isInstructor) {
      fetchLedGroups();
    }
  }, [projectId, fetchGroups, fetchLedGroups, isAdmin, isInstructor]);

  return {
    groups,
    loading,
    userGroup,
    viewedGroup,
    setViewedGroup,
    ledGroups,
    isAdmin,
    isInstructor,
    isGroupLeader,
    handleJoinGroup,
    handleAutoJoin,
    refetchGroups: () => fetchGroups(usePagination ? currentPage : 0),
    // Pagination-specific returns
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    handlePageChange,
    usePagination
  };
};
