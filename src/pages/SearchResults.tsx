import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { PlaybookCard } from "@/components/PlaybookCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const mockPlaybooks = [
  {
    id: "1",
    title: "Content Marketing Guide for MVP Launch",
    description: "A comprehensive guide to building a content marketing strategy for your minimum viable product launch.",
    author: "Sarah Chen",
    forks: 24,
    stars: 156,
    tag: "Marketing",
    difficulty: "Beginner"
  },
  {
    id: "2", 
    title: "Fundraising Deck Template",
    description: "Battle-tested investor pitch deck template that helped raise $2M in seed funding.",
    author: "Mike Rodriguez",
    forks: 89,
    stars: 342,
    tag: "Fundraising",
    difficulty: "Intermediate"
  },
  {
    id: "3",
    title: "Product Launch Checklist",
    description: "Step-by-step checklist covering pre-launch, launch day, and post-launch activities.",
    author: "Jessica Park",
    forks: 45,
    stars: 201,
    tag: "Product Launch",
    difficulty: "Beginner"
  },
  {
    id: "4",
    title: "Sales Playbook for SaaS Startups",
    description: "Proven sales strategies and scripts that converted 25% of leads to paying customers.",
    author: "David Kim",
    forks: 67,
    stars: 289,
    tag: "Sales",
    difficulty: "Advanced"
  }
];

const quickFilters = [
  "All", "Marketing", "Fundraising", "Product Launch", "Business Strategy", "Sales"
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';
  const [activeFilter, setActiveFilter] = useState(tag || "All");
  const [filteredPlaybooks, setFilteredPlaybooks] = useState(mockPlaybooks);

  useEffect(() => {
    let filtered = mockPlaybooks;
    
    // Filter by search query
    if (query) {
      filtered = filtered.filter(playbook => 
        playbook.title.toLowerCase().includes(query.toLowerCase()) ||
        playbook.description.toLowerCase().includes(query.toLowerCase()) ||
        playbook.tag.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Filter by tag
    if (activeFilter !== "All") {
      filtered = filtered.filter(playbook => 
        playbook.tag === activeFilter
      );
    }
    
    setFilteredPlaybooks(filtered);
  }, [query, activeFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation showSearchInNav={true} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold">
              {query ? `Search results for "${query}"` : `Browse ${activeFilter === "All" ? "All" : activeFilter} Playbooks`}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Found {filteredPlaybooks.length} playbook{filteredPlaybooks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {quickFilters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="transition-all"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Results Grid */}
        {filteredPlaybooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaybooks.map((playbook) => (
              <Link 
                key={playbook.id} 
                to={`/playbook/${playbook.id}`}
                className="block transition-transform hover:scale-105"
              >
                <PlaybookCard {...playbook} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No playbooks found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters
            </p>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}