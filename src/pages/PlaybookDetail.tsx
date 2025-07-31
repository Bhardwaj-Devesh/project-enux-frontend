import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, GitFork, Download, Share2, Eye, Calendar, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function PlaybookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const { data: playbook, isLoading, isError } = useQuery(['playbook', id], async () => {
    const { data, error } = await supabase
      .from('playbooks')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, { enabled: !!id });

  if (isLoading) return <div className="p-8 text-center">Loading playbook...</div>;
  if (isError || !playbook) return <div className="p-8 text-center text-red-500">Playbook not found.</div>;

  const handleFork = () => {
    if (!user && !isGuest) {
      // Show login popup
      return;
    }
    if (isGuest) {
      alert("Please sign in to fork playbooks");
      return;
    }
    // Handle fork logic
    console.log("Forking playbook:", id);
  };

  const handleStar = () => {
    if (!user && !isGuest) {
      // Show login popup
      return;
    }
    if (isGuest) {
      alert("Please sign in to star playbooks");
      return;
    }
    // Handle star logic
    console.log("Starring playbook:", id);
  };

  return (
    <div className="min-h-screen bg-background">
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
                  <User className="w-4 h-4" />
                  <span className="font-medium">{playbook.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">
                    Updated {playbook.lastUpdated}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {playbook.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
                <Badge variant="outline">{playbook.stage}</Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handleStar}>
                <Star className="w-4 h-4 mr-2" />
                Star ({playbook.stars})
              </Button>
              <Button variant="outline" onClick={handleFork}>
                <GitFork className="w-4 h-4 mr-2" />
                Fork ({playbook.forks})
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p>
                    This comprehensive GTM playbook provides everything you need to successfully 
                    launch your startup's go-to-market strategy. Built from real-world experience 
                    and proven frameworks used by successful startups.
                  </p>
                  <h3>What You'll Learn</h3>
                  <ul>
                    <li>How to identify and validate your Ideal Customer Profile (ICP)</li>
                    <li>Positioning strategies that differentiate your product</li>
                    <li>Marketing channels that work for early-stage startups</li>
                    <li>Sales processes that convert prospects to customers</li>
                    <li>Metrics to track and optimize your GTM performance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {playbook.sections.map((section, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{section}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Files & Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playbook.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                          📄
                        </div>
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-muted-foreground">{file.size}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stars</span>
                  <span className="font-medium">{playbook.stars}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forks</span>
                  <span className="font-medium">{playbook.forks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span className="font-medium">{playbook.views}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License</span>
                  <Badge variant="outline">{playbook.license}</Badge>
                </div>
              </CardContent>
            </Card>

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