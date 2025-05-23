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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ContributionScoreResponse } from '@/types/contribution';
import ScoreAdjustmentDialog from './ScoreAdjustmentDialog';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ContributionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contributions: ContributionScoreResponse[];
  canModifyScores: boolean;
  onScoreUpdated: (updatedScore: ContributionScoreResponse) => void;
  projectId: number;
}

const ContributionDetailsDialog: React.FC<ContributionDetailsDialogProps> = ({
  isOpen,
  onClose,
  contributions,
  canModifyScores,
  onScoreUpdated,
  projectId
}) => {
  const [selectedScore, setSelectedScore] = useState<ContributionScoreResponse | null>(null);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState<boolean>(false);

  const handleAdjustScore = (score: ContributionScoreResponse) => {
    setSelectedScore(score);
    setIsAdjustmentDialogOpen(true);
  };

  const handleAdjustmentComplete = (updatedScore: ContributionScoreResponse) => {
    setIsAdjustmentDialogOpen(false);
    setSelectedScore(null);
    onScoreUpdated(updatedScore);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Student Contribution Scores</DialogTitle>
            <DialogDescription>
              Detailed breakdown of student contribution scores in this project
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Table>
              <TableCaption>Contribution scores for project members</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Task Completion</TableHead>
                  <TableHead>Peer Review</TableHead>
                  <TableHead>Commits</TableHead>
                  <TableHead>Late Tasks</TableHead>
                  <TableHead>System Score</TableHead>
                  <TableHead>Final Score</TableHead>
                  {canModifyScores && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell className="font-medium">{contribution.fullName}</TableCell>
                    <TableCell>{contribution.taskCompletionScore.toFixed(1)}</TableCell>
                    <TableCell>{contribution.peerReviewScore.toFixed(1)}</TableCell>
                    <TableCell>{contribution.commitCount}</TableCell>
                    <TableCell>{contribution.lateTaskCount}</TableCell>                    <TableCell>{contribution.calculatedScore.toFixed(1)}</TableCell>
                    <TableCell className="relative">
                      {contribution.adjustedScore ? (
                        <span className={`font-bold ${
                          contribution.adjustedScore >= 80 ? 'text-green-600' : 
                          contribution.adjustedScore >= 50 ? 'text-amber-600' : 
                          'text-red-600'
                        }`}>
                          {contribution.adjustedScore.toFixed(1)}
                        </span>
                      ) : (
                        <span className={`font-bold ${
                          contribution.calculatedScore >= 80 ? 'text-green-600' : 
                          contribution.calculatedScore >= 50 ? 'text-amber-600' : 
                          'text-red-600'
                        }`}>
                          {contribution.calculatedScore.toFixed(1)}
                        </span>
                      )}
                      {contribution.adjustmentReason && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-1 inline-block text-blue-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-60 break-words">
                              <span className="font-bold">Adjustment reason:</span><br />
                              {contribution.adjustmentReason}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    {canModifyScores && (
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAdjustScore(contribution)}
                        >
                          Adjust
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedScore && (
        <ScoreAdjustmentDialog
          isOpen={isAdjustmentDialogOpen}
          onClose={() => setIsAdjustmentDialogOpen(false)}
          score={selectedScore}
          onScoreUpdated={handleAdjustmentComplete}
        />
      )}
    </>
  );
};

export default ContributionDetailsDialog;
