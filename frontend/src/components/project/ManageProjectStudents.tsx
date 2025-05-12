import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import projectService from '@/services/projectService';
import userService from '@/services/userService';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  UserPlus, 
  X, 
  Search, 
  Loader2, 
  RefreshCw, 
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProjectAccessCode from './ProjectAccessCode';

interface ManageProjectStudentsProps {
  projectId: number;
  projectName: string;
}

interface StudentData {
  id: number;
  fullName: string;
  username: string;
  email: string;
}

export const ManageProjectStudents: React.FC<ManageProjectStudentsProps> = ({ projectId, projectName }) => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [inviting, setInviting] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch project students when component mounts
  useEffect(() => {
    fetchProjectStudents();
  }, [projectId]);

  const fetchProjectStudents = async () => {
    try {
      setLoading(true);
      // Assuming the API provides a list of students for the project
      const response = await userService.getProjectStudents(projectId);
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Could not fetch students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProjectStudents();
    setRefreshing(false);
  };

  const handleInvite = async () => {
    if (!usernameInput.trim()) return;
    
    try {
      setInviting(true);
      const response = await projectService.inviteStudentsToProject(
        projectId, 
        [usernameInput]
      );
      
      if (response.success) {
        toast({
          title: "Success!",
          description: `Student ${usernameInput} invited to project`,
        });
        setUsernameInput('');
        handleRefresh();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to invite student",
        variant: "destructive"
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveStudent = async (studentId: number, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this project?`)) {
      return;
    }
    
    try {
      const response = await projectService.removeStudentFromProject(projectId, studentId);
      
      if (response.success) {
        toast({
          title: "Success!",
          description: `Student removed from project`,
        });
        
        // Update the student list
        setStudents(students.filter(student => student.id !== studentId));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to remove student",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <Users size={16} />
          Manage Students
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Project Students</DialogTitle>
          <DialogDescription>
            Manage student access to "{projectName}" project
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 pt-4">
          {/* Access code component */}
          <div className="mb-4">
            <ProjectAccessCode projectId={projectId} projectName={projectName} />
          </div>
          
          {/* Invite student form */}
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <label htmlFor="username" className="text-sm font-medium leading-none">
                Invite Student by Username
              </label>
              <div className="flex">
                <Input
                  id="username"
                  placeholder="Enter student username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="flex-1"
                  disabled={inviting}
                />
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !usernameInput.trim()}
                  className="ml-2"
                >
                  {inviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Students list */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Project Students</h3>
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No students in this project yet.
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveStudent(student.id, student.fullName)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageProjectStudents;
