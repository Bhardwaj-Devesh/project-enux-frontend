import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, GitFork, Download, Share2, Eye, Calendar, User, ArrowLeft, Tag, Globe, Lock, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';

interface Playbook {
  id: string;
  title: string;
  description: string;
  tags: string[];
  stage: string;
  owner_id: string;
  version: string;
  files: Record<string, string>;
  created_at: string;
  updated_at: string;
  latest_version: number;
  summary: string;
  blog_content: string;
}

export default function PlaybookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaybook = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get token from sessionStorage user_data or localStorage
        const userData = sessionStorage.getItem('user_data');
        let token = localStorage.getItem('auth_token');
        
        if (!token && userData) {
          try {
            const user = JSON.parse(userData);
            token = user.access_token || user.token;
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
        
      

        const response = await fetch(`http://localhost:8000/api/v1/playbooks/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Playbook detail API response:', data);
        setPlaybook(data);
      } catch (err) {
        console.error('Error fetching playbook:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch playbook');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaybook();
  }, [id]);

  const handleFork = () => {
    if (!user && !isGuest) {
      return;
    }
    if (isGuest) {
      alert("Please sign in to fork playbooks");
      return;
    }
    console.log("Forking playbook:", id);
  };

  const handleStar = () => {
    if (!user && !isGuest) {
      return;
    }
    if (isGuest) {
      alert("Please sign in to star playbooks");
      return;
    }
    console.log("Starring playbook:", id);
  };

  const renderMarkdownContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mb-6 mt-8 first:mt-0">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold mb-4 mt-6">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-medium mb-3 mt-4">{line.substring(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-6 mb-2">{line.substring(2)}</li>;
        }
        if (line.startsWith('1. ')) {
          return <li key={index} className="ml-6 mb-2 list-decimal">{line.substring(3)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-4 leading-relaxed">{line}</p>;
      });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading playbook...</p>
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

  if (!playbook) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive">Playbook not found.</p>
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
              <h1 className="text-3xl font-bold mb-2">{playbook.title}</h1>
              <p className="text-muted-foreground mb-4">{playbook.description}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">
                    Created {new Date(playbook.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">
                    Updated {new Date(playbook.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {playbook.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {playbook.stage}
                </Badge>
                <Badge variant="outline">v{playbook.version}</Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handleStar}>
                <Star className="w-4 h-4 mr-2" />
                Star (0)
              </Button>
              <Button variant="outline" onClick={handleFork}>
                <GitFork className="w-4 h-4 mr-2" />
                Fork (0)
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Blog */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                <div className="prose max-w-none">
                  {renderMarkdownContent(playbook.blog_content)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stars</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forks</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span className="font-medium">0</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <Badge variant="outline">v{playbook.version}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stage</span>
                  <Badge variant="outline">{playbook.stage}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Files */}
            <Card>
              <CardHeader>
                <CardTitle>Files & Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(playbook.files).map(([fileName, fileUrl], index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{fileName}</div>
                        <div className="text-xs text-muted-foreground">PDF</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(fileUrl, '_blank')}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {renderMarkdownContent(playbook.summary)}
                </div>
              </CardContent>
            </Card>

            {/* Related Playbooks */}
            <Card>
              <CardHeader>
                <CardTitle>Related Playbooks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: "Product Launch Checklist", author: "Mike Johnson" },
                  { title: "Sales Funnel Optimization", author: "Lisa Park" },
                  { title: "Content Marketing Guide", author: "David Kim" }
                ].map((related, index) => (
                  <div key={index} className="p-3 rounded-lg border hover:bg-accent cursor-pointer">
                    <div className="font-medium text-sm">{related.title}</div>
                    <div className="text-xs text-muted-foreground">by {related.author}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
