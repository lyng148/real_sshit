import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UserSquare } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import  peerReviewService  from '@/services/peerReviewService';
import { useToast } from '@/hooks/use-toast';

interface ReviewTriggerButtonProps {
  groupId: number;
  projectId: number;
  isGroupLeader: boolean;
}

const ReviewTriggerButton: React.FC<ReviewTriggerButtonProps> = ({ 
  groupId, 
  projectId,
  isGroupLeader 
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTriggerReviews = async () => {
    try {
      setLoading(true);
      const response = await peerReviewService.startPeerReviewForGroup(groupId);
      
      if (response.success) {
        toast({
          title: "Peer reviews triggered",
          description: "Peer review process has been initiated for your group",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Could not start peer review process",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not start peer review process. Try again later.",
        variant: "destructive"
      });
      console.error("Error triggering peer reviews:", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  if (!isGroupLeader) {
    return null;
  }

  return (
    <>      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
        disabled={loading}
      >
        <UserSquare className="h-4 w-4" />
        {loading ? "Starting..." : "Start Peer Review"}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Peer Review Process</AlertDialogTitle>
            <AlertDialogDescription>
              This will initiate a peer review session for all members in your group.
              Each team member will be asked to review others' contributions.
              This process helps ensure fair assessment and improves team collaboration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleTriggerReviews();
              }} 
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Reviews"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReviewTriggerButton;
