import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaybookCard } from "@/components/PlaybookCard";

const mockPlaybooks = [
  {
    id: 1,
    title: "Content Marketing Guide for MVP Launch",
    description: "A comprehensive step-by-step guide to building content marketing strategy for your MVP launch, including social media tactics and email campaigns.",
    author: "Sarah Chen",
    forks: 234,
    stars: 567,
    tag: "Marketing",
  },
  {
    id: 2,
    title: "Seed Fundraising Playbook 2024",
    description: "Everything you need to know about raising your first round of funding, from pitch deck creation to investor outreach strategies.",
    author: "Michael Rodriguez",
    forks: 189,
    stars: 423,
    tag: "Fundraising",
  },
  {
    id: 3,
    title: "B2B Sales Process Framework",
    description: "Proven sales methodologies and frameworks that helped scale from $0 to $1M ARR in 18 months. Includes templates and scripts.",
    author: "David Park",
    forks: 156,
    stars: 389,
    tag: "Sales",
  },
  {
    id: 4,
    title: "Product-Market Fit Validation",
    description: "Systematic approach to validate your product-market fit using customer interviews, surveys, and data-driven decision making.",
    author: "Emily Johnson",
    forks: 298,
    stars: 672,
    tag: "Product Launch",
  },
  {
    id: 5,
    title: "Remote Team Management",
    description: "Best practices for managing and scaling remote teams, including communication protocols, productivity tools, and culture building.",
    author: "Alex Thompson",
    forks: 167,
    stars: 445,
    tag: "Business Strategy",
  },
  {
    id: 6,
    title: "Customer Success Playbook",
    description: "Complete guide to building a customer success function that drives retention, expansion, and advocacy for SaaS businesses.",
    author: "Lisa Martinez",
    forks: 203,
    stars: 534,
    tag: "Customer Success",
  },
  {
    id: 7,
    title: "Growth Hacking Strategies",
    description: "Collection of proven growth hacking tactics and experiments that have driven viral adoption for multiple startups.",
    author: "Ryan Kim",
    forks: 278,
    stars: 612,
    tag: "Marketing",
  },
  {
    id: 8,
    title: "Legal Startup Checklist",
    description: "Essential legal documents, compliance requirements, and intellectual property strategies every startup founder needs to know.",
    author: "Jennifer Walsh",
    forks: 145,
    stars: 367,
    tag: "Legal",
  },
];

export function DiscoverSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCards = 3;
  const maxIndex = Math.max(0, mockPlaybooks.length - visibleCards);

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
  };

  const visiblePlaybooks = mockPlaybooks.slice(currentIndex, currentIndex + visibleCards);

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Discover Business Playbooks</h2>
            <p className="text-muted-foreground">
              Battle-tested strategies from successful founders and operators
            </p>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Playbook Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {visiblePlaybooks.map((playbook, index) => (
            <PlaybookCard
              key={playbook.id}
              title={playbook.title}
              description={playbook.description}
              author={playbook.author}
              forks={playbook.forks}
              stars={playbook.stars}
              tag={playbook.tag}
              className={`animate-fade-in [animation-delay:${index * 100}ms]`}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="group">
            View All Playbooks
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: Math.ceil(mockPlaybooks.length / visibleCards) }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                Math.floor(currentIndex / visibleCards) === index
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30"
              }`}
              onClick={() => setCurrentIndex(index * visibleCards)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}