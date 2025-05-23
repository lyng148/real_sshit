import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import peerReviewService, {PeerReviewResponse } from '@/services/peerReviewService';
import { getInitials } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PeerReviewResultsProps {
  projectId: number;
}

const PeerReviewResults: React.FC<PeerReviewResultsProps> = ({ projectId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submittedReviews, setSubmittedReviews] = useState<PeerReviewResponse[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<PeerReviewResponse[]>([]);
  const [activeTab, setActiveTab] = useState<string>("received");
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // Fetch reviews in parallel
        const [submitted, received] = await Promise.all([
          peerReviewService.getSubmittedReviews(projectId),
          peerReviewService.getReceivedReviews(projectId)
        ]);
        
        if (submitted.success) {
          setSubmittedReviews(submitted.data || []);
        }
        
        if (received.success) {
          setReceivedReviews(received.data || []);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load peer reviews. Please try again later.",
          variant: "destructive"
        });
        console.error("Error fetching peer reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [projectId, toast]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  const renderReviewCard = (review: PeerReviewResponse, isReceived: boolean) => {
    const person = isReceived ? review.reviewer : review.reviewee;
    
    return (
      <Card key={review.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={person?.avatarUrl} alt={person?.fullName} />
                <AvatarFallback>{getInitials(person?.fullName || '')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{person?.fullName}</div>
                <div className="text-xs text-muted-foreground">{person?.username}</div>
              </div>
            </div>
            <Badge variant={review.isValid ? "outline" : "destructive"}>
              {review.isValid ? "Valid" : "Invalid"}
            </Badge>
          </div>
          <CardDescription className="text-xs mt-2">
            Review Week: {review.reviewWeek} • {new Date(review.updatedAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Task Completion</div>
              <div className="flex items-center gap-2">
                {renderStars(review.completionScore)}
                <span className="text-sm font-medium">{review.completionScore}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Collaboration</div>
              <div className="flex items-center gap-2">
                {renderStars(review.cooperationScore)}
                <span className="text-sm font-medium">{review.cooperationScore}</span>
              </div>
            </div>
          </div>
          
          {review.comment && (
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Feedback</div>
              <div className="text-sm p-3 bg-muted/50 rounded-md">{review.comment}</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-8 text-center">
          <div className="animate-pulse">Loading review data...</div>
        </div>
      );
    }    if (activeTab === "received") {
      return completedReceivedReviews.length > 0 ? (
        completedReceivedReviews.map((review) => renderReviewCard(review, true))
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          You haven't received any completed peer reviews yet.
        </div>
      );
    } else {
      return submittedReviews.length > 0 ? (
        submittedReviews.map((review) => renderReviewCard(review, false))
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          You haven't submitted any peer reviews yet.
        </div>
      );
    }
  };
  // Filter completed reviews for display and calculation
  const completedReceivedReviews = receivedReviews.filter(review => review.isCompleted);

  // Calculate average scores (only from completed reviews)
  const avgCompletionScore = completedReceivedReviews.length > 0 
    ? completedReceivedReviews.reduce((sum, review) => sum + review.completionScore, 0) / completedReceivedReviews.length
    : 0;
    
  const avgCooperationScore = completedReceivedReviews.length > 0 
    ? completedReceivedReviews.reduce((sum, review) => sum + review.cooperationScore, 0) / completedReceivedReviews.length
    : 0;
  
  const avgOverallScore = completedReceivedReviews.length > 0
    ? completedReceivedReviews.reduce((sum, review) => sum + review.score, 0) / completedReceivedReviews.length
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Peer Reviews</CardTitle>
        <CardDescription>
          View feedback from your team members and reviews you've submitted
        </CardDescription>
      </CardHeader>
        {completedReceivedReviews.length > 0 && (
        <CardContent className="border-b pb-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Task Completion</div>
              <div className="flex items-center">
                <div className="mr-2 font-medium text-lg">{avgCompletionScore.toFixed(1)}</div>
                {renderStars(Math.round(avgCompletionScore))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Collaboration</div>
              <div className="flex items-center">
                <div className="mr-2 font-medium text-lg">{avgCooperationScore.toFixed(1)}</div>
                {renderStars(Math.round(avgCooperationScore))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Overall Score</div>
              <Progress value={avgOverallScore * 20} className="h-2 mt-2" />
              <div className="text-right text-xs mt-1">{avgOverallScore.toFixed(1)} / 5</div>
            </div>
          </div>
        </CardContent>
      )}
      
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="received">
              Received ({completedReceivedReviews.length})
            </TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted ({submittedReviews.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="focus-visible:outline-none focus-visible:ring-0">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PeerReviewResults;
