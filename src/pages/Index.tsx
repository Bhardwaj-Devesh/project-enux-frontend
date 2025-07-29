import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { SearchSection } from "@/components/SearchSection";
import { DiscoverSection } from "@/components/DiscoverSection";
import { TrendingSection } from "@/components/TrendingSection";
import { ActivitySection } from "@/components/ActivitySection";
import { LoginPopup } from "@/components/LoginPopup";

const Index = () => {
  const [searchValue, setSearchValue] = useState("");
  const [showSearchInNav, setShowSearchInNav] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const searchSectionOffset = 600; // Approximate position where search section starts disappearing
      
      setShowSearchInNav(scrollPosition > searchSectionOffset);
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // TODO: Implement search functionality
  };

  const handleSearchValueChange = (value: string) => {
    setSearchValue(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation
        searchValue={searchValue}
        onSearchChange={handleSearchValueChange}
        showSearchInNav={showSearchInNav}
        isScrolled={isScrolled}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Search Section */}
      <SearchSection
        searchValue={searchValue}
        onSearchValueChange={handleSearchValueChange}
        onSearch={handleSearch}
        isVisible={!showSearchInNav}
      />

      {/* Discover Business Playbooks */}
      <DiscoverSection />

      {/* Trending This Week */}
      <TrendingSection />

      {/* Recent Activity & Top Contributors */}
      <ActivitySection />

      {/* Footer */}
      <footer className="py-16 border-t bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Enux
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                The collaborative platform for business knowledge sharing and version control.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Newsletter</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © 2024 Enux. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
      />
    </div>
  );
};

export default Index;
