import { TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaybookCard } from "@/components/PlaybookCard";

const trendingPlaybooks = [
  {
    id: 1,
    title: "AI-First Startup Strategy",
    description: "How to build and scale an AI-powered startup in 2024, including technical architecture, team building, and go-to-market strategies.",
    author: "Marcus AI",
    forks: 342,
    stars: 789,
    views: 1234,
    tag: "AI/ML",
    lastUpdated: "2 days ago",
  },
  {
    id: 2,
    title: "Zero to $1M ARR Playbook",
    description: "Detailed roadmap of how we reached $1M ARR in 14 months, including pricing strategy, customer acquisition, and product development.",
    author: "Jessica Wong",
    forks: 298,
    stars: 656,
    views: 2145,
    tag: "Growth",
    lastUpdated: "1 week ago",
  },
  {
    id: 3,
    title: "Remote-First Culture Guide",
    description: "Building a thriving remote company culture that attracts top talent and drives productivity across distributed teams.",
    author: "Tom Fletcher",
    forks: 187,
    stars: 423,
    views: 987,
    tag: "Culture",
    lastUpdated: "3 days ago",
  },
  {
    id: 4,
    title: "YC Application Masterclass",
    description: "Everything you need to know about applying to Y Combinator, including application tips, interview prep, and portfolio companies' advice.",
    author: "Sarah Kim",
    forks: 234,
    stars: 567,
    views: 1876,
    tag: "Fundraising",
    lastUpdated: "5 days ago",
  },
];

export function TrendingSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-accent" />
            <div>
              <h2 className="text-3xl font-bold">Trending This Week</h2>
              <p className="text-muted-foreground">
                Most popular playbooks based on views, forks, and stars
              </p>
            </div>
          </div>

          <Button variant="outline" className="group">
            View All Trending
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Trending Cards - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trendingPlaybooks.map((playbook, index) => (
            <PlaybookCard
              key={playbook.id}
              title={playbook.title}
              description={playbook.description}
              author={playbook.author}
              forks={playbook.forks}
              stars={playbook.stars}
              views={playbook.views}
              tag={playbook.tag}
              lastUpdated={playbook.lastUpdated}
              className={`animate-fade-in [animation-delay:${index * 150}ms]`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}