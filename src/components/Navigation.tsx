import { useState, useEffect } from "react";
import { Search, Plus, Bell, User, GitFork, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface NavigationProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearchInNav?: boolean;
  isScrolled?: boolean;
}

export function Navigation({ 
  searchValue = "", 
  onSearchChange, 
  showSearchInNav = false,
  isScrolled = false 
}: NavigationProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isScrolled && "shadow-md"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Enux
              </span>
            </div>
          </div>

          {/* Search Bar - Only visible when showSearchInNav is true */}
          {showSearchInNav && (
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search business strategies..."
                  className="pl-10 bg-background"
                  value={searchValue}
                  onChange={handleSearch}
                />
              </div>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Add Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md">
                    Create Playbook
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md">
                    Import Playbook
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md">
                    Upload Files
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <h4 className="font-medium">Notifications</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        No new notifications
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Sign in to see your notifications
                    </p>
                    <Button size="sm">Sign In</Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* User Account */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md">
                      My Playbooks
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md">
                      Settings
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Join the community
                    </p>
                    <Button size="sm" className="w-full">Sign In</Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </nav>
  );
}