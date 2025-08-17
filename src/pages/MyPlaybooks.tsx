import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, GitFork, Star, History, BarChart2, Search, Plus, BookOpen, Tag, Globe, Lock, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { getEnhancedPlaybooks, EnhancedPlaybook } from '@/lib/api';

const MyPlaybooks: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'mine' | 'others' | 'forked'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'stars' | 'forks' | 'views'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [playbooks, setPlaybooks] = useState<EnhancedPlaybook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch playbooks from API
  useEffect(() => {
    const fetchPlaybooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getEnhancedPlaybooks();
        console.log('Enhanced API response:', data);
        setPlaybooks(data);
      } catch (err) {
        console.error('Error fetching playbooks:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch playbooks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaybooks();
  }, [user]);

  const filteredPlaybooks = playbooks.filter(playbook => {
    const matchesSearch = playbook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playbook.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playbook.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'mine' && user) {
      return matchesSearch && playbook.owner_id === user.id;
    } else if (filter === 'others' && user) {
      return matchesSearch && playbook.owner_id !== user.id;
    } else if (filter === 'forked') {
      return matchesSearch && playbook.is_fork;
    }
    
    return matchesSearch;
  });

  const sortedPlaybooks = [...filteredPlaybooks].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'stars':
        // Since API doesn't provide stars, sort by creation date as fallback
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'forks':
        // Use the new fork_count field from enhanced API
        return b.fork_count - a.fork_count;
      case 'views':
        // Since API doesn't provide views, sort by creation date as fallback
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  const handleView = (playbookId: string) => {
    navigate(`/playbook/${playbookId}`);
  };

  const handleEdit = (playbookId: string) => {
    // Implement edit functionality
    console.log('Edit playbook:', playbookId);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading playbooks...</p>
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">My Playbooks</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'mine' | 'others' | 'forked')} className="flex-grow">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="mine">Mine</TabsTrigger>
              <TabsTrigger value="others">Others</TabsTrigger>
              <TabsTrigger value="forked">Forked</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search playbooks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-auto"
            />
            <Button variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
          </div>

          <Select value={sort} onValueChange={(value) => setSort(value as 'newest' | 'oldest' | 'stars' | 'forks' | 'views')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="stars">Stars</SelectItem>
              <SelectItem value="forks">Forks</SelectItem>
              <SelectItem value="views">Views</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlaybooks.map((playbook) => (
            <Card key={playbook.id} className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleView(playbook.id)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg line-clamp-2">{playbook.title}</CardTitle>
                      {playbook.is_fork && (
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                          <Copy className="h-3 w-3" />
                          Forked
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2 mt-2">{playbook.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1 ml-2">
                    <Globe className="h-3 w-3" />
                    {playbook.stage}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {playbook.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {playbook.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{playbook.tags.length - 3}</Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Version: {playbook.version}</p>
                  <p>Created {new Date(playbook.created_at).toLocaleDateString()}</p>
                  <p>{Object.keys(playbook.files).length} file{Object.keys(playbook.files).length !== 1 ? 's' : ''}</p>
                  {playbook.is_fork && playbook.forked_at && (
                    <p>Forked {new Date(playbook.forked_at).toLocaleDateString()}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="flex items-center"><Star className="h-4 w-4 mr-1" /> 0</span>
                  <span className="flex items-center"><GitFork className="h-4 w-4 mr-1" /> {playbook.fork_count}</span>
                  <span className="flex items-center"><Eye className="h-4 w-4 mr-1" /> 0</span>
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleView(playbook.id); }}>
                    <Eye className="h-4 w-4 mr-2" /> View
                  </Button>
                  {playbook.owner_id === user?.id && (
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(playbook.id); }}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {sortedPlaybooks.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <BookOpen className="h-24 w-24 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-bold mb-2">No Playbooks Yet</h2>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                It looks like you haven't created any playbooks. Start building your knowledge base now!
              </p>
              <Button size="lg" onClick={() => navigate('/create')}>
                <Plus className="h-5 w-5 mr-2" /> Create Your First Playbook
              </Button>
            </div>
          )}
        </div>

        <Separator className="my-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Edits</CardTitle>
              <CardDescription>Log of all actions you've done.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent edits to display.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Mini analytics for your playbooks.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{sortedPlaybooks.length}</p>
                  <p className="text-muted-foreground">Playbooks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{sortedPlaybooks.filter(p => p.owner_id === user?.id).length}</p>
                  <p className="text-muted-foreground">My Playbooks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{sortedPlaybooks.reduce((sum, p) => sum + p.fork_count, 0)}</p>
                  <p className="text-muted-foreground">Total Forks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{sortedPlaybooks.filter(p => p.is_fork).length}</p>
                  <p className="text-muted-foreground">Forked Playbooks</p>
                </div>
              </div>
              <Button className="w-full mt-6" onClick={() => navigate('/analytics')}>
                <BarChart2 className="h-4 w-4 mr-2" /> View Full Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyPlaybooks;
