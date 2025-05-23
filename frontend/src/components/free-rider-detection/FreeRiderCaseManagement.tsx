import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, AlertTriangle, XCircle, UserCheck, UserX, Mail, MessageSquare } from 'lucide-react';
import { usePeerReviewService } from '@/services/peerReviewService';

const FreeRiderCaseManagement = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [activeCases, setActiveCases] = useState([]);
  const [resolvedCases, setResolvedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [resolutionValue, setResolutionValue] = useState('warning');
  const [viewingResolvedCase, setViewingResolvedCase] = useState(null);
  const peerReviewService = usePeerReviewService();    useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        setLoadingProgress(20);
        const freeRiderCases = await peerReviewService.getFreeRiderCases(projectId);
        setLoadingProgress(60);
        
        if (freeRiderCases && freeRiderCases.data) {
          console.log("Free rider cases data:", freeRiderCases.data);
          
          // Parse evidence JSON for each case
          const casesWithParsedEvidence = freeRiderCases.data.map(c => {
            if (c.evidenceJson) {
              try {
                const evidence = JSON.parse(c.evidenceJson);
                return {
                  ...c,
                  parsedEvidence: evidence
                };
              } catch (e) {
                console.error("Failed to parse evidence JSON for case", c.id, e);
                return c;
              }
            }
            return c;
          });
          
          setActiveCases(casesWithParsedEvidence.filter(c => c.status !== 'resolved'));
          setResolvedCases(casesWithParsedEvidence.filter(c => c.status === 'resolved'));
            // Set the first active case as selected if any exists
          if (casesWithParsedEvidence.filter(c => c.status !== 'resolved').length > 0) {
            setActiveCaseId(casesWithParsedEvidence.filter(c => c.status !== 'resolved')[0].id);
          }
          setLoadingProgress(100);
        }
      } catch (error) {
        console.error('Error fetching free-rider cases:', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500); // Small delay to ensure progress bar shows 100% before hiding
      }
    };
    
    if (projectId) {
      fetchCases();
    }
  }, [projectId]);
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    
    // Get form data properly
    const formData = new FormData(e.target);
    const notes = formData.get('notes');
    
    try {
      console.log("Submitting resolution:", {
        resolution: resolutionValue,
        notes,
        projectId
      });
      
      // Call API to resolve the case
      const result = await peerReviewService.resolveFreeRiderCase(activeCaseId, {
        resolution: resolutionValue,
        notes: notes ? String(notes) : "",
        projectId
      });
      
      if (result.success) {
        // Refresh cases
        const freeRiderCases = await peerReviewService.getFreeRiderCases(projectId);
        setActiveCases(freeRiderCases.data.filter(c => c.status !== 'resolved'));
        setResolvedCases(freeRiderCases.data.filter(c => c.status === 'resolved'));
        
        setShowResolveForm(false);
        // Set next active case if available
        if (activeCases.length > 1) {
          const nextCase = activeCases.find(c => c.id !== activeCaseId);
          if (nextCase) setActiveCaseId(nextCase.id);
        } else {
          setActiveCaseId(null);
        }
      }
    } catch (error) {      
      console.error('Error resolving free-rider case:', error);
      alert('Unable to resolve the case. Please try again later.');
    }
  };  const renderCaseDetails = () => {
    const caseData = activeCases.find(c => c.id === activeCaseId);
    if (!caseData) return null;
    
    // Use the already parsed evidence or try to parse it again if needed
    let evidence = caseData.parsedEvidence;
    if (!evidence && caseData.evidenceJson) {
      try {
        evidence = JSON.parse(caseData.evidenceJson);
      } catch (e) {
        console.error("Failed to parse evidence JSON:", e);
      }
    }
    
    // Make sure evidence is available or provide defaults
    const safeEvidence = {
      contributionScore: evidence?.calculatedScore || 0,
      taskCompletion: evidence?.taskEvidence?.completionPercentage || 0,
      commits: evidence?.commitEvidence?.totalCommits || 0,
      peerRating: evidence?.peerReviewEvidence?.averageRating || 0
    };
    
    // Attach the parsed evidence to the caseData object
    caseData.evidence = safeEvidence;
      
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">          <h3 className="text-xl font-semibold">Case Details #{caseData.id}</h3>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => caseData.student?.email && window.open(`mailto:${caseData.student.email}`)}
              disabled={!caseData.student?.email}
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button size="sm" variant="default" onClick={() => {
              setShowResolveForm(true);
              setResolutionValue('warning');
            }}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolve
            </Button>
          </div>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Student Information</CardTitle>
            </CardHeader>
            <CardContent>              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{caseData.student?.fullName || caseData.student?.username || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{caseData.student?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Group:</span>
                  <span>{caseData.group?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Detected on:</span>
                  <span>{caseData.detectedAt ? new Date(caseData.detectedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`font-medium ${caseData.status === 'pending' ? 'text-red-500' : 'text-yellow-500'}`}>
                    {caseData.status === 'pending' ? 'Pending' : 'Contacted'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
            <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Evidence</CardTitle>
            </CardHeader>            
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Contribution score:</span>
                  <span className="text-red-500 font-medium">{caseData.evidence?.contributionScore?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Task completion:</span>
                  <span className="text-red-500 font-medium">{caseData.evidence?.taskCompletion ? `${caseData.evidence.taskCompletion.toFixed(1)}%` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Commit count:</span>
                  <span className="text-red-500 font-medium">{caseData.evidence?.commits || 'N/A'}</span>
                </div>                <div className="flex justify-between">
                  <span className="font-medium">Peer review:</span>
                  <span className="text-red-500 font-medium">{caseData.evidence?.peerRating ? `${caseData.evidence.peerRating.toFixed(1)}/5` : 'N/A'}</span>
                </div>
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    disabled
                    title="Detailed reports are not available at this time"
                  >
                    View detailed report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
          {showResolveForm && (
          <Card>
            <CardHeader>
              <CardTitle>Resolve Case</CardTitle>
              <CardDescription>
                Please enter information to resolve this free-rider case
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResolveSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution Method</Label>
                  <Select 
                    defaultValue="warning" 
                    value={resolutionValue}
                    onValueChange={(value) => setResolutionValue(value)}
                  >
                    <SelectTrigger id="resolution">
                      <SelectValue placeholder="Choose a method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="reassignment">Role Reassignment</SelectItem>
                      <SelectItem value="penalty">Grade Penalty</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes"
                    name="notes"
                    placeholder="Enter details about the resolution and communication with the student..."
                    rows={4}
                    required
                  />
                </div>
                  <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowResolveForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Confirm
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  const renderResolvedCaseDetails = () => {
    const caseData = resolvedCases.find(c => c.id === viewingResolvedCase);
    if (!caseData) return null;
    
    // Use the already parsed evidence or try to parse it again if needed
    let evidence = caseData.parsedEvidence;
    if (!evidence && caseData.evidenceJson) {
      try {
        evidence = JSON.parse(caseData.evidenceJson);
      } catch (e) {
        console.error("Failed to parse evidence JSON:", e);
      }
    }
    
    // Make sure evidence is available or provide defaults
    const safeEvidence = {
      contributionScore: evidence?.calculatedScore || 0,
      taskCompletion: evidence?.taskEvidence?.completionPercentage || 0,
      commits: evidence?.commitEvidence?.totalCommits || 0,
      peerRating: evidence?.peerReviewEvidence?.averageRating || 0
    };
    
    // Attach the parsed evidence to the caseData object
    caseData.evidence = safeEvidence;
    
    return (
      <Dialog open={!!viewingResolvedCase} onOpenChange={(open) => { if (!open) setViewingResolvedCase(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Resolved Case Details #{caseData.id}</DialogTitle>
            <DialogDescription>
              Details of the resolved free-rider case
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Student Information</CardTitle>
              </CardHeader>
              <CardContent>              
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{caseData.student?.fullName || caseData.student?.username || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{caseData.student?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Group:</span>
                    <span>{caseData.group?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Detected on:</span>
                    <span>{caseData.detectedAt ? new Date(caseData.detectedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`font-medium ${caseData.status === 'pending' ? 'text-red-500' : 'text-yellow-500'}`}>
                      {caseData.status === 'pending' ? 'Pending' : 'Contacted'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Evidence</CardTitle>
              </CardHeader>            
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Contribution score:</span>
                    <span className="text-red-500 font-medium">{caseData.evidence?.contributionScore?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Task completion:</span>
                    <span className="text-red-500 font-medium">{caseData.evidence?.taskCompletion ? `${caseData.evidence.taskCompletion.toFixed(1)}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Commit count:</span>
                    <span className="text-red-500 font-medium">{caseData.evidence?.commits || 'N/A'}</span>
                  </div>                  <div className="flex justify-between">
                    <span className="font-medium">Peer review:</span>
                    <span className="text-red-500 font-medium">{caseData.evidence?.peerRating ? `${caseData.evidence.peerRating.toFixed(1)}/5` : 'N/A'}</span>
                  </div>
                  <div className="mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      disabled
                      title="Detailed reports are not available at this time"
                    >
                      View detailed report
                    </Button>
                  </div>
                </div>
              </CardContent></Card>
          </div>

          {/* Add resolution details section */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resolution Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Resolution Date:</span>
                  <span>{caseData.resolvedAt ? new Date(caseData.resolvedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Resolution Method:</span>
                  <span className="font-medium">
                    {caseData.resolution === 'warning' ? 'Warning' :
                     caseData.resolution === 'reassignment' ? 'Role Reassignment' :
                     caseData.resolution === 'penalty' ? 'Grade Penalty' : 'Other'}
                  </span>
                </div>
                
                <div className="border-t pt-2 mt-2">
                  <span className="font-medium">Resolution Notes:</span>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {caseData.notes || 'No additional notes provided.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  };// Hiển thị chi tiết của case đã resolve
  const handleViewResolvedCase = (caseItem) => {
    // Phân tích evidence nếu cần
    let evidence = caseItem.parsedEvidence;
    if (!evidence && caseItem.evidenceJson) {
      try {
        evidence = JSON.parse(caseItem.evidenceJson);
      } catch (e) {
        console.error("Failed to parse evidence JSON for resolved case:", caseItem.id, e);
        evidence = null;
      }
    }

    // Gán evidence đã phân tích cho case hiện tại
    const caseWithEvidence = {
      ...caseItem,
      parsedEvidence: evidence,
      evidence: evidence ? {
        contributionScore: evidence.calculatedScore || 0,
        taskCompletion: evidence.taskEvidence?.completionPercentage || 0,
        commits: evidence.commitEvidence?.totalCommits || 0,
        peerRating: evidence.peerReviewEvidence?.averageRating || 0
      } : null
    };

    // Hiển thị case bằng cách gán ID của case vào state
    setViewingResolvedCase(caseItem.id);
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Free Rider Case Management</h2>
        {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-center w-full max-w-md space-y-4">
            <Progress value={loadingProgress} className="w-full" />
            <p className="text-gray-500">Loading cases... {loadingProgress}%</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="active" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Unresolved ({activeCases.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedCases.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
          {activeCases.length === 0 ? (
            <Alert className="bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle>No cases need attention</AlertTitle>
              <AlertDescription>
                Currently there are no free-rider cases waiting to be processed.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Case List</CardTitle>
                    <CardDescription>
                      {activeCases.length} cases that need to be processed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {activeCases.map(caseItem => (
                        <div 
                          key={caseItem.id}
                          className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer
                            ${activeCaseId === caseItem.id ? 'bg-gray-50 border-l-4 border-primary' : ''}`}
                          onClick={() => setActiveCaseId(caseItem.id)}
                        >
                          <div className="mr-3">
                            {caseItem.status === 'pending' ? (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : (
                              <MessageSquare className="h-5 w-5 text-yellow-500" />
                            )}                          
                            </div>                          
                            <div className="flex-1">
                            <p className="font-medium">{caseItem.student?.fullName || caseItem.student?.username || 'Unknown Student'}</p>
                            <p className="text-sm text-gray-500">{caseItem.group?.name || 'Unknown Group'} - {caseItem.detectedAt ? new Date(caseItem.detectedAt).toLocaleDateString() : 'Unknown Date'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
                <div className="lg:col-span-2">
                {activeCaseId ? (
                  renderCaseDetails()
                ) : (
                  <div className="flex items-center justify-center h-full p-8 border rounded-lg border-dashed">
                    <p className="text-gray-500">Select a case to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="resolved">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Cases</CardTitle>
              <CardDescription>
                History of resolved free-rider cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resolvedCases.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No cases have been resolved yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Detection Date</TableHead>
                      <TableHead>Resolution Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>                    
                    {resolvedCases.map(caseItem => (                      
                      <TableRow key={caseItem.id}>
                        <TableCell>#{caseItem.id}</TableCell>
                        <TableCell>{caseItem.student?.fullName || caseItem.student?.username || 'Unknown'}</TableCell>
                        <TableCell>{caseItem.group?.name || 'Unknown'}</TableCell>
                        <TableCell>{caseItem.detectedAt ? new Date(caseItem.detectedAt).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{caseItem.resolvedAt ? new Date(caseItem.resolvedAt).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            caseItem.resolution === 'warning' ? 'warning' :
                            caseItem.resolution === 'reassignment' ? 'secondary' :
                            'destructive'
                          }>
                            {caseItem.resolution === 'warning' ? 'Warning' :
                             caseItem.resolution === 'reassignment' ? 'Role Reassignment' :
                             caseItem.resolution === 'penalty' ? 'Grade Penalty' : 'Other'}
                          </Badge>
                        </TableCell>
                        <TableCell>                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewResolvedCase(caseItem);
                            }}
                          >
                            View details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>)}      {renderResolvedCaseDetails()}
    </div>
  );
};

const Badge = ({ children, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

export default FreeRiderCaseManagement;
