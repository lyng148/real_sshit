import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Button
} from '@/components/ui/button';
import {
  Input
} from '@/components/ui/input';
import {
  Textarea
} from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { ContributionScoreResponse } from '@/types/contribution';
import contributionScoreService from '@/services/contributionScoreService';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface ScoreAdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  score: ContributionScoreResponse;
  onScoreUpdated: (updatedScore: ContributionScoreResponse) => void;
}

const formSchema = z.object({
  adjustedScore: z.coerce.number()
    .min(0, "Score must be at least 0"),
  adjustmentReason: z.string()
    .min(5, "Please provide a reason with at least 5 characters")
    .max(500, "Reason cannot exceed 500 characters")
});

const ScoreAdjustmentDialog: React.FC<ScoreAdjustmentDialogProps> = ({
  isOpen,
  onClose,
  score,
  onScoreUpdated
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize form with current score values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adjustedScore: score.adjustedScore,
      adjustmentReason: score.adjustmentReason || ""
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await contributionScoreService.adjustScore(
        score.id, 
        values.adjustedScore, 
        values.adjustmentReason
      );
      
      if (response.success) {
        toast({
          title: "Score adjusted",
          description: "The contribution score was successfully adjusted",
          variant: "default",
        });
        onScoreUpdated(response.data);
      } else {
        toast({
          title: "Adjustment failed",
          description: response.message || "Failed to adjust score",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adjusting score:', error);
      toast({
        title: "Error",
        description: "An error occurred while adjusting the score",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">        
        <DialogHeader>
          <DialogTitle>Adjust Contribution Score</DialogTitle>
          <DialogDescription>
            You are adjusting the score for <span className="font-semibold">{score.fullName}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adjustedScore"
              render={({ field }) => (                <FormItem>
                  <FormLabel>Adjusted Score</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-3">                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        className="w-24"
                        {...field}
                      />                      <div className="text-sm">
                        <span className={`font-medium ${
                          field.value >= 80 ? 'text-green-600' : 
                          field.value >= 50 ? 'text-amber-600' : 
                          'text-red-600'
                        }`}>
                          {typeof field.value === 'number' ? field.value.toFixed(1) : '0.0'}
                        </span> pts
                      </div>
                    </div>
                  </FormControl>                  <FormDescription className="flex items-center justify-between">
                    <span>System calculated score: {score.calculatedScore.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">Change: {typeof field.value === 'number' ? (field.value - score.calculatedScore).toFixed(1) : '0.0'}</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="adjustmentReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a reason for this score adjustment"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be visible to other instructors and admins.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Adjustment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreAdjustmentDialog;
