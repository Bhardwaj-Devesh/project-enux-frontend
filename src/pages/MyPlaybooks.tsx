import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Edit, Eye, GitFork, Star, History, BarChart2, Search, Plus, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { Database } from '@/integrations/supabase/types';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

type Playbook = Database['public']['Tables']['playbooks']['Row'];

const MyPlaybooks: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'mine' | 'others'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'stars' | 'forks' | 'views'>('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlaybooks = async () => {
    let query = supabase.from('playbooks').select('*');

    if (filter === 'mine' && user) {
      query = query.eq('author_id', user.id);
    } else if (filter === 'others' && user) {
      query = query.neq('author_id', user.id);
    }

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'stars':
        query = query.order('stars_count', { ascending: false });
        break;
      case 'forks':
        query = query.order('forks_count', { ascending: false });
        break;
      case 'views':
        query = query.order('views_count', { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  const { data: playbooks, isLoading, error } = useQuery<Playbook[]>(
    ['myPlaybooks', filter, sort, searchTerm, user?.id],
    fetchPlaybooks,
    { enabled: !!user }
  );

  const handleView = (playbookId: string) => {
    navigate(`/playbook/${playbookId}`);
  };

  const handleEdit = (playbookId: string) => {
    // Implement edit functionality or navigate to edit page
    console.log('Edit playbook:', playbookId);
  };

  if (isLoading) return <div>Loading playbooks...</div>;
  if (error) return <div>Error loading playbooks: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Playbooks</h1>
      <div className="mb-4 p-4 border rounded-lg bg-gray-100">
        <h2 className="text-xl font-semibold mb-2">Debug Info</h2>
        <p><strong>User ID:</strong> {user ? user.id : 'Not logged in'}</p>
        <p><strong>Playbooks Count:</strong> {playbooks?.length ?? 0}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'mine' | 'others')} className="flex-grow">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mine">Mine</TabsTrigger>
            <TabsTrigger value="others">Others</TabsTrigger>
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
        {playbooks?.map((playbook) => (
          <Card key={playbook.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{playbook.title}</CardTitle>
              <CardDescription className="line-clamp-2">{playbook.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div className="text-sm text-muted-foreground mb-2">
                <p>Views: {playbook.views_count || 0}</p>
                <p>Last Edited: {playbook.updated_at ? new Date(playbook.updated_at).toLocaleDateString() : 'N/A'}</p>
                <p>Status: {playbook.visibility === 'public' ? 'Published' : 'Private'}</p>
              </div>
              <div className="flex items-center gap-4 text-sm mb-4">
                <span className="flex items-center"><Star className="h-4 w-4 mr-1" /> {playbook.stars_count || 0}</span>
                <span className="flex items-center"><GitFork className="h-4 w-4 mr-1" /> {playbook.forks_count || 0}</span>
              </div>
              <div className="flex gap-2 mt-auto">
                <Button variant="outline" size="sm" onClick={() => handleView(playbook.id)}>
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(playbook.id)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {playbooks?.length === 0 && (
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
            {/* Placeholder for recent edits log */}
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
                <p className="text-2xl font-bold">{playbooks?.length || 0}</p>
                <p className="text-muted-foreground">Playbooks</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{playbooks?.reduce((sum, p) => sum + (p.stars_count || 0), 0)}</p>
                <p className="text-muted-foreground">Stars</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{playbooks?.reduce((sum, p) => sum + (p.forks_count || 0), 0)}</p>
                <p className="text-muted-foreground">Forks</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{playbooks?.reduce((sum, p) => sum + (p.views_count || 0), 0)}</p>
                <p className="text-muted-foreground">Views</p>
              </div>
            </div>
            <Button className="w-full mt-6" onClick={() => navigate('/analytics')}>
              <BarChart2 className="h-4 w-4 mr-2" /> View Full Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyPlaybooks;