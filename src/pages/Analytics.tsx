import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { Database } from '@/integrations/supabase/types';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, Star, GitFork, Eye } from 'lucide-react';

type Playbook = Database['public']['Tables']['playbooks']['Row'];

const Analytics: React.FC = () => {
  const { user } = useAuth();

  const fetchUserPlaybooks = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('playbooks')
      .select('*')
      .eq('author_id', user.id);
    if (error) throw error;
    return data;
  };

  const { data: userPlaybooks, isLoading, error } = useQuery<Playbook[]>(
    ['userPlaybooksAnalytics', user?.id],
    fetchUserPlaybooks,
    { enabled: !!user }
  );

  const totalPlaybooks = userPlaybooks?.length || 0;
  const totalStars = userPlaybooks?.reduce((sum, p) => sum + (p.stars_count || 0), 0) || 0;
  const totalForks = userPlaybooks?.reduce((sum, p) => sum + (p.forks_count || 0), 0) || 0;
  const totalViews = userPlaybooks?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0;

  if (isLoading) return <div className="container mx-auto p-4">Loading analytics...</div>;
  if (error) return <div className="container mx-auto p-4">Error loading analytics: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <BarChart2 className="h-8 w-8 mr-2" /> Your Playbook Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Playbooks</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlaybooks}</div>
            <p className="text-xs text-muted-foreground">Your published playbooks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStars}</div>
            <p className="text-xs text-muted-foreground">Across all your playbooks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forks</CardTitle>
            <GitFork className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalForks}</div>
            <p className="text-xs text-muted-foreground">Copies made of your playbooks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">Combined views on your playbooks</p>
          </CardContent>
        </Card>
      </div>

      {/* You can add more detailed charts or tables here if needed */}
      {totalPlaybooks === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          No playbooks found for analytics. Create some playbooks to see your stats!
        </p>
      )}
    </div>
  );
};

export default Analytics;