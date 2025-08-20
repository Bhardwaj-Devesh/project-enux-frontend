import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Bell, User, GitFork, Star, BookOpen, GitPullRequest } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getNotifications, getNotificationCount, markNotificationsAsRead, markAllNotificationsAsRead, deleteNotification, Notification } from "@/lib/api";

interface NavigationProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearchInNav?: boolean;
  isScrolled?: boolean;
  onLoginClick?: () => void;
}

export function Navigation({ 
  searchValue = "", 
  onSearchChange, 
  showSearchInNav = false,
  isScrolled = false,
  onLoginClick
}: NavigationProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchNotificationCount();
    } else {
      setNotifications([]);
      setNotificationCount(0);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoadingNotifications(true);
    try {
      const data = await getNotifications(10); // Limit to 10 notifications for the dropdown
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const fetchNotificationCount = async () => {
    if (!user) return;
    
    try {
      const data = await getNotificationCount();
      setNotificationCount(data.unread_count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Refresh notifications when popover opens
  const handleNotificationsOpenChange = (open: boolean) => {
    setNotificationsOpen(open);
    if (open && user) {
      fetchNotifications();
      fetchNotificationCount();
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchValue.trim())}`;
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      await markAllNotificationsAsRead();
      // Refresh notifications and count
      await fetchNotifications();
      await fetchNotificationCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await markNotificationsAsRead([notificationId]);
      // Refresh notifications and count
      await fetchNotifications();
      await fetchNotificationCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await deleteNotification(notificationId);
      // Refresh notifications and count
      await fetchNotifications();
      await fetchNotificationCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark notification as read
      await handleMarkAsRead(notification.id);
      
      // Close the notifications popover
      setNotificationsOpen(false);
      
      // Handle navigation based on notification type
      if (notification.type === 'pr_created') {
        if (notification.pr_id) {
          // If we have a PR ID, navigate to the pull request detail page
          navigate(`/pull-request/${notification.pr_id}`);
        } else if (notification.playbook_id) {
          // Otherwise, navigate to the playbook detail page
          navigate(`/playbook/${notification.playbook_id}`);
        }
      }
      // Add more notification types here as needed
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Still close the popover even if there's an error
      setNotificationsOpen(false);
    }
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
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-8">
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
            </form>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-2">

            {/* Notifications */}
            <Popover open={notificationsOpen} onOpenChange={handleNotificationsOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
                            <PopoverContent className="w-80" align="end">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Notifications</h4>
                      {notifications.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs"
                          onClick={handleMarkAllAsRead}
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                    {isLoadingNotifications ? (
                      <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No new notifications
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex-shrink-0">
                              {notification.type === 'fork' ? (
                                <GitFork className="h-4 w-4 text-blue-500" />
                              ) : notification.type === 'pr_created' ? (
                                <GitPullRequest className="h-4 w-4 text-green-500" />
                              ) : (
                                <User className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{notification.title}</p>
                              <p className="text-xs text-muted-foreground">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{formatNotificationTime(notification.created_at)}</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center space-x-1">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="text-muted-foreground hover:text-destructive text-xs"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {notifications.length > 0 && (
                      <div className="border-t pt-2">
                        <Button variant="ghost" size="sm" className="w-full text-xs">
                          View all notifications
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Sign in to see your notifications
                    </p>
                    <Button size="sm" onClick={onLoginClick}>Sign In</Button>
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
                {user ? (
                  <div className="space-y-2">
                     <Link to="/my-profile" className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md block">
                      My profile
                    </Link>
                    <Link to="/create" className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md block">
                      Create Playbook
                    </Link>
                    <Link to="/search" className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md block">
                      Search Playbooks
                    </Link>
                    <Link to="/my-playbooks" className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md block">
                      My Playbooks
                    </Link>
                    <div className="border-t pt-2">
                      <button 
                        onClick={signOut}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md text-red-600"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Join the community
                    </p>
                    <Button size="sm" className="w-full" onClick={onLoginClick}>Sign In</Button>
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