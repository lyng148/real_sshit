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
import { Badge } from '@/components/ui/badge';
import { ContributionScoreResponse } from '@/types/contribution';
import ScoreAdjustmentDialog from './ScoreAdjustmentDialog';
import { Info, Edit } from 'lucide-react';
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
                  <TableHead className="text-center">
                    Task Score
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="inline h-4 w-4 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Normalized task completion score (0-10 scale)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center">
                    Peer Review
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="inline h-4 w-4 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Normalized peer review score (0-10 scale)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center">
                    Code Score
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="inline h-4 w-4 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Normalized code contribution score (0-10 scale)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center">
                    Late Tasks
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="inline h-4 w-4 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Count of late completed/overdue tasks</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead>System Score</TableHead>
                  <TableHead>Final Score</TableHead>
                  {canModifyScores && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell className="font-medium">{contribution.fullName}</TableCell>
                    <TableCell className="text-center">{contribution.taskCompletionScore.toFixed(1)}</TableCell>
                    <TableCell className="text-center">{contribution.peerReviewScore.toFixed(1)}</TableCell>
                    <TableCell className="text-center">
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="cursor-help">
                            {contribution.codeContributionScore.toFixed(1)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="w-56 space-y-2">
                            <div className="font-bold">Code Contribution Breakdown:</div>
                            <div>
                              <span className="text-green-600">+{contribution.totalAdditions || 0}</span> lines added
                            </div>
                            <div>
                              <span className="text-red-600">-{contribution.totalDeletions || 0}</span> lines deleted
                            </div>
                            <div className="border-t pt-2">
                              <div className="text-xs text-gray-600">
                                Raw Score: {((contribution.totalAdditions || 0) * 1.0 + (contribution.totalDeletions || 0) * 1.25).toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-600">
                                Normalized: {contribution.codeContributionScore.toFixed(1)}/10
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-center">{contribution.lateTaskCount}</TableCell>
                    <TableCell>{contribution.calculatedScore.toFixed(1)}</TableCell>
                    <TableCell className="relative">
                      <div className="flex items-center gap-2">
                        {contribution.adjustedScore ? (
                          <>
                            <span className={`font-bold ${
                              contribution.adjustedScore >= 7 ? 'text-green-600' : 
                              contribution.adjustedScore >= 4 ? 'text-amber-600' : 
                              'text-red-600'
                            }`}>
                              {contribution.adjustedScore.toFixed(1)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              <Edit className="h-3 w-3 mr-1" />
                              Adjusted
                            </Badge>
                          </>
                        ) : (
                          <span className={`font-bold ${
                            contribution.calculatedScore >= 7 ? 'text-green-600' : 
                            contribution.calculatedScore >= 4 ? 'text-amber-600' : 
                            'text-red-600'
                          }`}>
                            {contribution.calculatedScore.toFixed(1)}
                          </span>
                        )}
                        {contribution.adjustmentReason && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-blue-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="w-60 break-words space-y-2">
                                <div>
                                  <span className="font-bold">System calculated:</span> {contribution.calculatedScore.toFixed(1)}
                                </div>
                                <div>
                                  <span className="font-bold">Manually adjusted:</span> {contribution.adjustedScore?.toFixed(1)}
                                </div>
                                <div>
                                  <span className="font-bold">Reason:</span><br />
                                  {contribution.adjustmentReason}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
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
