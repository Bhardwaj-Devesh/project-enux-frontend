import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { DiffViewer } from '@/components/DiffViewer';
import { 
  getPullRequest, 
  getPullRequestDiff, 
  mergePullRequest, 
  closePullRequest, 
  declinePullRequest,
  PullRequest 
} from '@/lib/api';
import { 
  ArrowLeft, 
  GitBranch, 
  User, 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  GitMerge,
  GitPullRequest,
  Clock,
  FileText
} from 'lucide-react';

export default function PullRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pullRequest, setPullRequest] = useState<PullRequest | null>(null);
  const [diffData, setDiffData] = useState<any>(null);
  const [sideBySideDiff, setSideBySideDiff] = useState<any>(null);
  const [htmlDiff, setHtmlDiff] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergeMessage, setMergeMessage] = useState('');

  useEffect(() => {
    const fetchPRData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch PR details and diff in parallel
        const [prData, diffResponse] = await Promise.all([
          getPullRequest(id),
          getPullRequestDiff(id, 'unified')
        ]);
        
        setPullRequest(prData);
        setDiffData(diffResponse);
      } catch (err) {
        console.error('Error fetching pull request:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch pull request');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPRData();
  }, [id]);

  const handleMerge = async () => {
    if (!pullRequest || !user) return;

    try {
      setIsActionLoading(true);
      
      const response = await mergePullRequest(
        pullRequest.id, 
        mergeMessage.trim() || undefined
      );
      
      // Update the pull request status to merged
      setPullRequest(prev => prev ? {
        ...prev,
        status: 'MERGED' as const,
        merged_at: new Date().toISOString(),
        new_version_id: response.new_version_id,
        new_version_number: response.version_number,
        merge_message: response.message
      } : null);
      
      setMergeDialogOpen(false);
      setMergeMessage('');
      
      toast({
        title: "Pull Request Merged!",
        description: `Successfully merged with version ${response.version_number}`,
      });
      
    } catch (error) {
      console.error('Error merging pull request:', error);
      toast({
        title: "Failed to merge",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!pullRequest) return;

    try {
      setIsActionLoading(true);
      
      const updatedPR = await closePullRequest(pullRequest.id);
      setPullRequest(updatedPR);
      
      toast({
        title: "Pull Request Closed",
        description: "The pull request has been closed.",
      });
      
    } catch (error) {
      console.error('Error closing pull request:', error);
      toast({
        title: "Failed to close",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!pullRequest) return;

    try {
      setIsActionLoading(true);
      
      const updatedPR = await declinePullRequest(pullRequest.id);
      setPullRequest(updatedPR);
      
      toast({
        title: "Pull Request Declined",
        description: "The pull request has been declined.",
      });
      
    } catch (error) {
      console.error('Error declining pull request:', error);
      toast({
        title: "Failed to decline",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const fetchSideBySideDiff = async () => {
    if (!pullRequest || sideBySideDiff) return;
    
    try {
      const response = await getPullRequestDiff(pullRequest.id, 'side-by-side');
      setSideBySideDiff(response);
    } catch (error) {
      console.error('Error fetching side-by-side diff:', error);
    }
  };

  const fetchHtmlDiff = async () => {
    if (!pullRequest || htmlDiff) return;
    
    try {
      const response = await getPullRequestDiff(pullRequest.id, 'html');
      setHtmlDiff(response);
    } catch (error) {
      console.error('Error fetching HTML diff:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Open</Badge>;
      case 'MERGED':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200">Merged</Badge>;
      case 'CLOSED':
        return <Badge variant="default" className="bg-gray-100 text-gray-800 border-gray-200">Closed</Badge>;
      case 'DECLINED':
        return <Badge variant="default" className="bg-red-100 text-red-800 border-red-200">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canManagePR = user && pullRequest && (
    user.id === pullRequest.author_id || 
    // Add logic here to check if user is playbook owner or has admin rights
    true // For now, allow all authenticated users
  );

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading pull request...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!pullRequest) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive">Pull request not found.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <GitPullRequest className="h-6 w-6 text-muted-foreground" />
                <h1 className="text-2xl font-bold">{pullRequest.title}</h1>
                {getStatusBadge(pullRequest.status)}
              </div>
              
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{pullRequest.author_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(pullRequest.created_at).toLocaleDateString()}</span>
                </div>
                {pullRequest.merged_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Merged {new Date(pullRequest.merged_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <p className="text-muted-foreground">{pullRequest.description}</p>
            </div>
            
            {/* Action Buttons */}
            {pullRequest.status === 'OPEN' && canManagePR && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setMergeDialogOpen(true)}
                  disabled={isActionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isActionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <GitMerge className="w-4 h-4 mr-2" />
                  )}
                  Merge
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDecline}
                  disabled={isActionLoading}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  {isActionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Decline
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2" />
                  )}
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Diff Viewer */}
            {diffData && (
              <DiffViewer 
                unifiedDiff={diffData.unified_diff || pullRequest.unified_diff}
                sideBySideDiff={sideBySideDiff?.side_by_side_diff}
                htmlDiff={htmlDiff?.html_diff}
                onSideBySideTabSelect={fetchSideBySideDiff}
                onHtmlTabSelect={fetchHtmlDiff}
              />
            )}

            {/* Content Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  New Content Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                    {pullRequest.new_blog_text}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* PR Info */}
            <Card>
              <CardHeader>
                <CardTitle>Pull Request Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(pullRequest.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Author</span>
                  <span className="font-medium">{pullRequest.author_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Playbook</span>
                  <span className="font-medium">{pullRequest.playbook_title}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Version</span>
                  <Badge variant="outline">v{pullRequest.base_version_number}</Badge>
                </div>
                {pullRequest.new_version_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Version</span>
                    <Badge variant="outline">v{pullRequest.new_version_number}</Badge>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-sm">{new Date(pullRequest.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="text-sm">{new Date(pullRequest.updated_at).toLocaleDateString()}</span>
                </div>
                {pullRequest.merged_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merged</span>
                    <span className="text-sm">{new Date(pullRequest.merged_at).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            {pullRequest.status === 'OPEN' && canManagePR && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setMergeDialogOpen(true)}
                    disabled={isActionLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <GitMerge className="w-4 h-4 mr-2" />
                    Merge Pull Request
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDecline}
                    disabled={isActionLoading}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClose}
                    disabled={isActionLoading}
                    className="w-full"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Pull Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merge-message">Merge Message (Optional)</Label>
              <Textarea
                id="merge-message"
                value={mergeMessage}
                onChange={(e) => setMergeMessage(e.target.value)}
                placeholder="Add a custom merge message..."
                rows={3}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This will merge the changes from "{pullRequest.title}" into the main playbook.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMergeDialogOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMerge}
              disabled={isActionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <GitMerge className="w-4 h-4 mr-2" />
                  Merge
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
