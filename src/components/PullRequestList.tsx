import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getPullRequests, PullRequest } from '@/lib/api';
import { 
  GitPullRequest, 
  User, 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Plus,
  GitBranch
} from 'lucide-react';

interface PullRequestListProps {
  playbookId: string;
  onCreatePR?: () => void;
  className?: string;
}

export function PullRequestList({ 
  playbookId, 
  onCreatePR, 
  className = "" 
}: PullRequestListProps) {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPullRequests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getPullRequests(playbookId);
        setPullRequests(response.pull_requests);
      } catch (err) {
        console.error('Error fetching pull requests:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch pull requests');
        toast({
          title: "Error",
          description: "Failed to load pull requests",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPullRequests();
  }, [playbookId, toast]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <GitPullRequest className="h-4 w-4 text-green-600" />;
      case 'MERGED':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'CLOSED':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      case 'DECLINED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <GitPullRequest className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Pull Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading pull requests...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Pull Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Pull Requests ({pullRequests.length})
          </CardTitle>
          {onCreatePR && (
            <Button onClick={onCreatePR} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New PR
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {pullRequests.length === 0 ? (
          <div className="text-center py-8">
            <GitPullRequest className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No pull requests yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to create a pull request for this playbook.
            </p>
            {onCreatePR && (
              <Button onClick={onCreatePR}>
                <Plus className="h-4 w-4 mr-2" />
                Create Pull Request
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {pullRequests.map((pr) => (
              <Link 
                key={pr.id} 
                to={`/pull-request/${pr.id}`}
                className="block"
              >
                <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(pr.status)}
                      <h3 className="font-medium text-foreground hover:underline">
                        {pr.title}
                      </h3>
                    </div>
                    {getStatusBadge(pr.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {pr.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{pr.author_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                    </div>
                    {pr.merged_at && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Merged {new Date(pr.merged_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
