import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from './StarRating';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import  peerReviewService  from '@/services/peerReviewService';
import { UserSummary } from '@/types/user';
import { getInitials } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  completionScore: z.number().min(1, 'Rating is required').max(5),
  cooperationScore: z.number().min(1, 'Rating is required').max(5),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PeerReviewFormProps {
  reviewee: UserSummary;
  projectId: number;
  onCompleted: () => void;
}

const PeerReviewForm: React.FC<PeerReviewFormProps> = ({
  reviewee,
  projectId,
  onCompleted
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      completionScore: 0,
      cooperationScore: 0,
      comment: '',
    },
  });
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      const response = await peerReviewService.submitReview({
        revieweeId: reviewee.id,
        projectId: projectId,
        completionScore: data.completionScore,
        cooperationScore: data.cooperationScore,
        comment: data.comment || '',
      });
      
      // Kiểm tra thêm phản hồi từ API để đảm bảo thành công
      if (response && response.success) {
        toast({
          title: "Review Submitted",
          description: "Your peer review has been submitted successfully",
        });
        
        // Chỉ gọi onCompleted khi thực sự thành công
        onCompleted();
      } else {
        // Nếu API trả về thành công = false
        toast({
          title: "Submission Failed",
          description: response?.message || "Could not submit your peer review. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting peer review:", error);
      toast({
        title: "Submission Failed",
        description: "Could not submit your peer review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={reviewee.avatarUrl} alt={reviewee.fullName} />
          <AvatarFallback>{getInitials(reviewee.fullName)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">{reviewee.fullName}</h3>
          <p className="text-sm text-muted-foreground">{reviewee.email}</p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="completionScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Completion</FormLabel>
                <FormDescription>
                  Rate how well this team member completes their assigned tasks on time and to quality standards.
                </FormDescription>
                <FormControl>
                  <StarRating 
                    value={field.value} 
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cooperationScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collaboration</FormLabel>
                <FormDescription>
                  Rate how well this team member works with others, communicates, and contributes to the team.
                </FormDescription>
                <FormControl>
                  <StarRating 
                    value={field.value} 
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comments (Optional)</FormLabel>
                <FormDescription>
                  Provide additional feedback for this team member. Be constructive and specific.
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Share your feedback..."
                    {...field}
                    className="min-h-[100px]"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PeerReviewForm;
