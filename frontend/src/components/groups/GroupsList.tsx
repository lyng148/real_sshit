import React from 'react';
import { Eye, Users, Calendar, Clock, ArrowRight, UserCheck, Settings, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Group } from '@/services/groupService';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface GroupsListProps {
  groups: Group[];
  isAdmin: boolean;
  isInstructor: boolean;
  projectId: string | undefined;
  onViewMembers: (group: Group) => void;
  onJoinGroup: (groupId: number, projectId: number) => void;
  onViewGroup: (groupId: number) => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
}

const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  isAdmin,
  isInstructor,
  projectId,
  onViewMembers,
  onJoinGroup,
  onViewGroup,
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  onPageChange,
  pageSize = 10
}) => {
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            Project Groups
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-3 py-1">
              {onPageChange ? `${totalElements} groups` : `${groups.length} groups`}
            </Badge>
            <div className="flex items-center text-sm text-slate-500 bg-slate-100 rounded-lg px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              Recently Updated
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
      {groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-xl font-semibold text-slate-600 mb-2">No groups yet</p>
            <p className="text-slate-500">Create the first group for this project</p>
        </div>
      ) : (
        <>
            <div className="divide-y divide-slate-100">
              {groups.map((group, index) => (
                <div 
                  key={group.id} 
                  className="group hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 transition-all duration-300 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className='flex'>
                                <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-slate-700 transition-colors mr-4">
                                  {group.name}
                                </h3>
                                <Badge 
                                variant={group.members.length >= 5 ? "default" : "secondary"}
                                className={`flex-shrink-0 ${
                                  group.members.length >= 5 
                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                                    : "bg-amber-100 text-amber-700 border-amber-200"
                                }`}
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  {group.members.length} members
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-slate-500 mt-1">
                                Group #{group.id} • Created {new Date(group.createdAt).toLocaleDateString('en-US')}
                              </p>
                            </div>
                            
                    </div>
                  </div>
                </div>
                
                      {/* Group members preview */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-medium text-slate-600">Members:</span>
                        <div className="flex items-center -space-x-2">
                          {group.members.slice(0, 4).map((member, idx) => (
                            <div
                              key={member.id}
                              className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
                              title={member.fullName}
                            >
                              {member.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          ))}
                          {group.members.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-slate-600 text-xs font-bold">
                              +{group.members.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewMembers(group)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Members
                      </Button>
                      
                      {(isAdmin || isInstructor) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewGroup(group.id)}
                          className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      ) : (
                    <Button
                      size="sm"
                          onClick={() => onJoinGroup(group.id, parseInt(projectId!))}
                          className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Join
                    </Button>
                  )}
                    </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Component */}
          {onPageChange && totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 0 && onPageChange(currentPage - 1)}
                        className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-slate-100"}
                    />
                  </PaginationItem>
                  
                  {generatePageNumbers().map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => onPageChange(pageNum)}
                        isActive={currentPage === pageNum}
                          className={`cursor-pointer ${
                            currentPage === pageNum 
                              ? "bg-slate-600 text-white hover:bg-slate-700" 
                              : "hover:bg-slate-100"
                          }`}
                      >
                        {pageNum + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {totalPages > 6 && currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages - 1 && onPageChange(currentPage + 1)}
                        className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-slate-100"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
      </CardContent>
    </Card>
  );
};

export default GroupsList;
