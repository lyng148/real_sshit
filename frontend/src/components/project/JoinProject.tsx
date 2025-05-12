import React, { useState } from 'react';
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import projectService from '@/services/projectService';
import { ScanIcon, Send as SendIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JoinProjectProps {
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const JoinProject: React.FC<JoinProjectProps> = ({ onSuccess, isOpen, onOpenChange }) => {
  const [accessCode, setAccessCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // Use controlled open state if provided, otherwise use internal state
  const [internalDialogOpen, setInternalDialogOpen] = useState<boolean>(false);
  const dialogOpen = isOpen !== undefined ? isOpen : internalDialogOpen;
  const setDialogOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalDialogOpen(open);
    }
  };
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an access code",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await projectService.joinProjectWithAccessCode(accessCode);
      
      if (response.success) {
        toast({
          title: "Success!",
          description: `You have joined ${response.data.name} project`,
        });
        
        setDialogOpen(false);
        if (onSuccess) {
          onSuccess();
        }
        
        // Navigate to the project page
        navigate(`/projects/${response.data.id}/groups`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to join project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/* Only show trigger button if not controlled externally */}
      {isOpen === undefined && (
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            onClick={() => setDialogOpen(true)}
            className="w-full flex items-center gap-2"
          >
            <ScanIcon className="h-4 w-4" />
            Join Project
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a Project</DialogTitle>
          <DialogDescription>
            Enter the project access code provided by your instructor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="accessCode">Access Code</Label>
            <div className="flex gap-2">
              <Input
                id="accessCode"
                placeholder="Enter access code (e.g., AB12CD34)"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                disabled={loading}
                className="flex-1"
                maxLength={8}
                minLength={8}
              />
              <Button 
                type="submit" 
                disabled={loading || !accessCode.trim()} 
                className="shrink-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <SendIcon className="h-4 w-4 animate-pulse" />
                    Joining...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <SendIcon className="h-4 w-4" />
                    Join
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            The access code should be 8 characters long and is provided by your instructor.
            You can also scan a QR code if your instructor has shared one.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinProject;
