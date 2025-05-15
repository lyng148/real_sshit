import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import PeerReviewForm from './PeerReviewForm';
import { UserSummary } from '@/types/user';
import { peerReviewService } from '@/services/peerReviewService';
import { useToast } from '@/hooks/use-toast';

interface PeerReviewModalProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PeerReviewModal: React.FC<PeerReviewModalProps> = ({
  projectId,
  open,
  onOpenChange
}) => {
  const [membersToReview, setMembersToReview] = useState<UserSummary[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);
  const { toast } = useToast();  useEffect(() => {
    if (open) {
      loadMembersToReview();
    } else {
      // Reset state when modal closes
      setMembersToReview([]);
      setCurrentIndex(0);
      setCompleted(false);
      setError(null);
      setLoading(false);
    }
  }, [open, projectId]);

  const loadMembersToReview = async () => {
    try {
      setLoading(true);
      const response = await peerReviewService.getMembersToReview(projectId);
      
      if (response.success) {
        setMembersToReview(response.data || []);
        setCurrentIndex(0);
        setCompleted(response.data.length === 0);
      } else {
        setError('Failed to load team members for review');
      }
    } catch (error) {
      setError('An error occurred while loading data');
      console.error("Error loading members to review:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCompleted = async () => {
    if (currentIndex < membersToReview.length - 1) {
      // Move to next member
      setCurrentIndex(currentIndex + 1);
    } else {
      // All reviews completed
      try {
        const completionResponse = await peerReviewService.hasCompletedAllReviews(projectId);
        
        if (completionResponse.success && completionResponse.data) {
          setCompleted(true);
          toast({
            title: "All reviews completed",
            description: "You have completed all peer reviews for this project",
          });
        } else {
          // Refresh the list in case there are new members to review
          loadMembersToReview();
        }
      } catch (error) {
        console.error("Error checking completion status:", error);
      }
    }
  };

  const handleClose = () => {
    if (!completed && membersToReview.length > 0) {
      toast({
        title: "Warning",
        description: "Please complete all peer reviews before closing. You must evaluate all team members.",
        variant: "destructive"
      });
    } else {
      onOpenChange(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading peer reviews...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (completed) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">All Peer Reviews Completed!</h3>
          <p className="text-muted-foreground mb-4">
            Thank you for completing your peer reviews. Your feedback helps improve team collaboration.
          </p>
          <button 
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      );
    }

    if (membersToReview.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-medium">No Reviews Needed</h3>
          <p className="text-muted-foreground">
            You don't have any team members to review at this time.
          </p>
        </div>
      );
    }

    const currentMember = membersToReview[currentIndex];
    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm">
            Review {currentIndex + 1} of {membersToReview.length}
          </div>
          <div className="flex items-center">
            {membersToReview.map((_, idx) => (
              <div 
                key={idx}
                className={`h-2 w-8 rounded mx-1 ${idx === currentIndex ? 'bg-primary' : idx < currentIndex ? 'bg-primary/70' : 'bg-gray-200'}`}
              />
            ))}
            <ArrowRight className="ml-2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <PeerReviewForm
          reviewee={currentMember}
          projectId={projectId}
          onCompleted={handleReviewCompleted}
        />
      </>
    );
  };
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Peer Reviews</DialogTitle>
          <DialogDescription>
            Please review your team members' contributions to the project.
          </DialogDescription>
        </DialogHeader>
        
        {/* Notification banner for mandatory reviews */}
        {!completed && membersToReview.length > 0 && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <div className="ml-2">
              <p className="text-sm font-medium text-amber-800">Attention Required</p>
              <p className="text-xs text-amber-700">
                You must complete all peer reviews before continuing to use the application. This helps ensure fair assessment of teamwork.
              </p>
            </div>
          </Alert>
        )}
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default PeerReviewModal;
