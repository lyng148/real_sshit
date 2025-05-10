import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import groupService, { Group, Member } from '@/services/groupService';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, CheckCircle, Crown, Edit, MoreVertical, Save, Trash, UserPlus, X } from 'lucide-react';

const GroupManagePage: React.FC = () => {
  const { projectId, groupId } = useParams<{ projectId: string; groupId: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedGroup, setEditedGroup] = useState<{
    name: string;
    description: string;
    repositoryUrl: string;
  }>({
    name: '',
    description: '',
    repositoryUrl: '',
  });
  const [confirmLeaderDialogOpen, setConfirmLeaderDialogOpen] = useState(false);
  const [selectedNewLeader, setSelectedNewLeader] = useState<Member | null>(null);

  const isAdmin = currentUser?.user.roles?.includes('ADMIN');
  const isInstructor = currentUser?.user.roles?.includes('INSTRUCTOR');
  const userId = currentUser?.user.id;
  
  // Check if current user is the group leader
  const isLeader = userId && group?.leader?.id === userId;
  
  // Check if user has permission to manage the group
  const canManageGroup = isAdmin || isInstructor || isLeader;

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!projectId || !groupId) return;
      
      try {
        setLoading(true);
        const response = await groupService.getGroupById(Number(groupId));
        if (response.success) {
          setGroup(response.data);
          setEditedGroup({
            name: response.data.name,
            description: response.data.description || '',
            repositoryUrl: response.data.repositoryUrl || '',
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load group details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching group:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading group details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [projectId, groupId, toast]);

  // Save group changes
  const handleSaveGroup = async () => {
    if (!groupId) return;
    
    try {
      const response = await groupService.updateGroup(Number(groupId), editedGroup);
      
      if (response.success) {
        setGroup(prevGroup => {
          if (!prevGroup) return null;
          return {
            ...prevGroup,
            name: editedGroup.name,
            description: editedGroup.description,
            repositoryUrl: editedGroup.repositoryUrl,
          };
        });
        
        setEditMode(false);
        
        toast({
          title: "Success",
          description: "Group details updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update group details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating group:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating group details",
        variant: "destructive",
      });
    }
  };

  // Transfer leadership functionality
  const handleTransferLeadership = async () => {
    if (!groupId || !selectedNewLeader) return;
    
    try {
      // Mock API call - would be implemented in groupService
      // const response = await groupService.transferLeadership(Number(groupId), selectedNewLeader.id);
      
      // For now, we'll simulate this with a mock success response
      const response = { success: true };
      
      if (response.success) {
        // Update local state
        setGroup(prevGroup => {
          if (!prevGroup || !selectedNewLeader) return prevGroup;
          
          return {
            ...prevGroup,
            leader: {
              id: selectedNewLeader.id,
              username: selectedNewLeader.username,
              fullName: selectedNewLeader.fullName,
              email: selectedNewLeader.email,
            },
          };
        });
        
        toast({
          title: "Success",
          description: `Leadership transferred to ${selectedNewLeader.fullName}`,
        });
        
        // Close the dialog
        setConfirmLeaderDialogOpen(false);
        setSelectedNewLeader(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to transfer leadership",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error transferring leadership:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading group details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">Group Not Found</h2>
            <p className="mt-2 text-gray-600">The group you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button variant="default" className="mt-6" onClick={() => navigate(`/projects/${projectId}/groups`)}>
              Back to Groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!canManageGroup) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">Access Denied</h2>
            <p className="mt-2 text-gray-600">You don't have permission to manage this group.</p>
            <Button variant="default" className="mt-6" onClick={() => navigate(`/projects/${projectId}/groups`)}>
              Back to Groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Manage Group</h1>
              <p className="text-gray-600">
                Project: {group.projectName}
              </p>
            </div>
            <div className="space-x-2">
              {editMode ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditMode(false);
                      setEditedGroup({
                        name: group.name,
                        description: group.description || '',
                        repositoryUrl: group.repositoryUrl || '',
                      });
                    }}
                  >
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                  <Button onClick={handleSaveGroup}>
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Group
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Details</CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Group Name</Label>
                      <Input 
                        id="name" 
                        value={editedGroup.name} 
                        onChange={(e) => setEditedGroup({...editedGroup, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        value={editedGroup.description} 
                        onChange={(e) => setEditedGroup({...editedGroup, description: e.target.value})}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="repositoryUrl">Repository URL</Label>
                      <Input 
                        id="repositoryUrl" 
                        value={editedGroup.repositoryUrl} 
                        onChange={(e) => setEditedGroup({...editedGroup, repositoryUrl: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Group Name</h3>
                      <p className="text-gray-900">{group.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="text-gray-900">{group.description || "No description"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Repository URL</h3>
                      {group.repositoryUrl ? (
                        <a 
                          href={group.repositoryUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-words"
                        >
                          {group.repositoryUrl}
                        </a>
                      ) : (
                        <p className="text-gray-500 italic">No repository URL provided</p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Member Count</h3>
                      <p className="text-gray-900">
                        {group.memberCount} / {group.maxMembers} members
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Members</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* First row always shows the leader */}
                    <TableRow key={group.leader.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Crown className="h-4 w-4 text-amber-500" />
                          <span>{group.leader.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{group.leader.username}</TableCell>
                      <TableCell>Leader</TableCell>
                      <TableCell className="text-right">
                        {/* No actions for the leader */}
                      </TableCell>
                    </TableRow>

                    {/* Other members */}
                    {group.members.filter(member => member.id !== group.leader.id).map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.fullName}</TableCell>
                        <TableCell>{member.username}</TableCell>
                        <TableCell>Member</TableCell>
                        <TableCell className="text-right">
                          {/* Only show actions if current user is leader or admin/instructor */}
                          {(isLeader || isAdmin || isInstructor) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedNewLeader(member);
                                    setConfirmLeaderDialogOpen(true);
                                  }}
                                >
                                  <Crown className="mr-2 h-4 w-4 text-amber-500" />
                                  Make Leader
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    // Mock function for removing a member
                                    toast({
                                      title: "Feature Not Implemented",
                                      description: "Removing members is not yet implemented.",
                                    });
                                  }}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Remove from Group
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Show empty state if no additional members */}
                    {group.members.length <= 1 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500 italic">
                          No other members in this group
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Back button */}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/projects/${projectId}/groups`)}
            >
              Back to Groups
            </Button>
          </div>
        </div>
      </div>

      {/* Transfer Leadership Dialog */}
      <Dialog open={confirmLeaderDialogOpen} onOpenChange={setConfirmLeaderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Group Leadership</DialogTitle>
            <DialogDescription>
              Are you sure you want to make {selectedNewLeader?.fullName} the new leader of this group? 
              You will no longer be the leader.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLeaderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransferLeadership}>
              Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupManagePage;
