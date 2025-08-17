import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Loader2, 
  Eye, 
  GitFork, 
  Star, 
  Tag, 
  Globe, 
  BookOpen, 
  TrendingUp,
  BarChart2,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  Settings,
  Info
} from "lucide-react";
import { searchPlaybooks, SearchResult } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const quickFilters = [
  "All", "Marketing", "Fundraising", "Product Launch", "Business Strategy", "Sales"
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';
  const [activeFilter, setActiveFilter] = useState(tag || "All");
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'oldest' | 'similarity'>('relevance');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(query || tag);

  useEffect(() => {
    const performSearch = async () => {
      if (!query && !tag) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const searchQuery = query || tag;
        const results = await searchPlaybooks({
          query: searchQuery,
          limit: 5
        });
        setSearchResults(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while searching');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, tag]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const filteredResults = searchResults.filter(result => {
    if (activeFilter === "All") return true;
    
    const playbook = result.playbook;
    return playbook.tags.some(tag => 
      tag.toLowerCase().includes(activeFilter.toLowerCase())
    );
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return b.similarity_score - a.similarity_score;
      case 'newest':
        return new Date(b.playbook.created_at).getTime() - new Date(a.playbook.created_at).getTime();
      case 'oldest':
        return new Date(a.playbook.created_at).getTime() - new Date(b.playbook.created_at).getTime();
      case 'similarity':
        return b.similarity_score - a.similarity_score;
      default:
        return 0;
    }
  });

  const handleView = (playbookId: string) => {
    navigate(`/playbook/${playbookId}`);
  };

  const getTag = (playbook: SearchResult['playbook']): string => {
    return playbook.tags[0] || 'General';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Searching playbooks...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-destructive mb-4">Search Error: {error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Google-style Search Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          {/* Centered Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search playbooks..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-12 pr-20 h-12 text-lg rounded-full border-2 focus:border-primary shadow-sm"
                />
                <Button 
                  type="submit" 
                  disabled={!searchInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 rounded-full"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium text-muted-foreground">
              About {sortedResults.length} results
            </h1>
            <span className="text-sm text-muted-foreground">
              ({((Date.now() - new Date().getTime()) / 1000).toFixed(2)} seconds)
            </span>
          </div>
          
          {/* Google-style Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Search Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Search Statistics */}
              <DropdownMenuItem className="flex flex-col items-start p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="h-4 w-4" />
                  <span className="font-medium">Search Statistics</span>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full text-sm">
                  <div>
                    <p className="font-medium">{searchResults.length}</p>
                    <p className="text-muted-foreground">Total Results</p>
                  </div>
                  <div>
                    <p className="font-medium text-primary">
                      {searchResults.length > 0 ? (searchResults[0].similarity_score * 100).toFixed(1) : '0'}%
                    </p>
                    <p className="text-muted-foreground">Best Match</p>
                  </div>
                  <div>
                    <p className="font-medium text-primary">
                      {searchResults.length > 0 ? (searchResults.reduce((sum, r) => sum + r.similarity_score, 0) / searchResults.length * 100).toFixed(1) : '0'}%
                    </p>
                    <p className="text-muted-foreground">Avg Similarity</p>
                  </div>
                  <div>
                    <p className="font-medium">{sortedResults.length}</p>
                    <p className="text-muted-foreground">Filtered</p>
                  </div>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Popular Categories */}
              <DropdownMenuItem className="flex flex-col items-start p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">Popular Categories</span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="space-y-1 w-full">
                    {Array.from(new Set(searchResults.flatMap(r => r.playbook.tags)))
                      .slice(0, 5)
                      .map((tag, index) => (
                        <div key={tag} className="flex items-center justify-between text-sm">
                          <span>{tag}</span>
                          <Badge variant="secondary" className="text-xs">
                            {searchResults.filter(r => r.playbook.tags.includes(tag)).length}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No categories to display</p>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Similarity Distribution */}
              {searchResults.length > 0 && (
                <>
                  <DropdownMenuItem className="flex flex-col items-start p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">Similarity Distribution</span>
                    </div>
                    <div className="space-y-1 w-full text-sm">
                      <div className="flex items-center justify-between">
                        <span>High Relevance (70%+)</span>
                        <Badge variant="default" className="text-xs">
                          {searchResults.filter(r => r.similarity_score > 0.7).length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Medium Relevance (50-70%)</span>
                        <Badge variant="secondary" className="text-xs">
                          {searchResults.filter(r => r.similarity_score > 0.5 && r.similarity_score <= 0.7).length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Low Relevance (&lt;50%)</span>
                        <Badge variant="outline" className="text-xs">
                          {searchResults.filter(r => r.similarity_score <= 0.5).length}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem onClick={() => navigate('/')}>
                <Search className="h-4 w-4 mr-2" />
                New Search
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filters and Sort - Google-style */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value)} className="flex-grow">
            <TabsList className="bg-transparent border">
              {quickFilters.map((filter) => (
                <TabsTrigger key={filter} value={filter} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-[180px] bg-transparent border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="similarity">Highest Similarity</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results - Google-style */}
        {sortedResults.length > 0 ? (
          <div className="space-y-6">
            {sortedResults.map((result) => {
              const playbook = result.playbook;
              const tag = getTag(playbook);
              return (
                <div key={playbook.id} className="group hover:bg-muted/50 p-4 rounded-lg transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Similarity Score Badge */}
                    <div className="flex-shrink-0">
                      <Badge 
                        variant={result.similarity_score > 0.7 ? "default" : result.similarity_score > 0.5 ? "secondary" : "outline"}
                        className="flex items-center gap-1 text-xs"
                      >
                        <TrendingUp className="h-3 w-3" />
                        {(result.similarity_score * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* URL-style breadcrumb */}
                      <div className="text-sm text-green-700 mb-1">
                        {playbook.stage} • {new Date(playbook.created_at).toLocaleDateString()}
                      </div>
                      
                      {/* Title */}
                      <h3 
                        className="text-xl text-blue-600 hover:underline cursor-pointer mb-2"
                        onClick={() => handleView(playbook.id)}
                      >
                        {playbook.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {playbook.description}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {playbook.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {playbook.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{playbook.tags.length - 3}</Badge>
                        )}
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Version: {playbook.version}</span>
                        <span>{Object.keys(playbook.files).length} file{Object.keys(playbook.files).length !== 1 ? 's' : ''}</span>
                        <span className="flex items-center"><Star className="h-3 w-3 mr-1" /> 0</span>
                        <span className="flex items-center"><GitFork className="h-3 w-3 mr-1" /> 0</span>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={() => handleView(playbook.id)}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-24 w-24 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-bold mb-2">No Playbooks Found</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {searchResults.length > 0 
                ? "Try adjusting your filters or search terms"
                : "No playbooks match your search criteria. Try different keywords or browse our categories."
              }
            </p>
            <Button size="lg" onClick={() => navigate('/')}>
              <Search className="h-5 w-5 mr-2" /> Back to Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}