
import React, { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, Monitor, CalendarIcon, BarChart3, Mail, PanelLeftClose, PanelLeftOpen, AlignHorizontalSpaceAround } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ThemeToggle } from './ThemeToggle';

interface TopMenuBarProps {
  onSearch: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogin: () => void;
  currentPage: 'dashboard' | 'calendar' | 'profile' | 'settings' | 'mails';
  onPageChange: (page: 'dashboard' | 'calendar' | 'profile' | 'settings' | 'mails') => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLayoutToggle?: () => void;
}

export const TopMenuBar: React.FC<TopMenuBarProps> = ({ 
  onSearch, 
  isLoggedIn, 
  onLogout, 
  onProfileClick, 
  onSettingsClick,
  onLogin,
  currentPage,
  onPageChange,
  isSidebarCollapsed,
  onToggleSidebar,
  onLayoutToggle
}) => {
  const [notificationTab, setNotificationTab] = useState('all');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 3;
  
  const notifications = [
    { id: 1, title: 'Team Meeting in 30 minutes', type: 'reminder', unread: true },
    { id: 2, title: 'New event invitation from John', type: 'invitation', unread: true },
    { id: 3, title: 'Calendar sync completed', type: 'system', unread: false },
    { id: 4, title: 'Reminder: Project deadline tomorrow', type: 'reminder', unread: false },
    { id: 5, title: 'Meeting canceled by Sarah', type: 'system', unread: true },
    { id: 6, title: 'Weekly report is ready', type: 'system', unread: false },
    { id: 7, title: 'New task assigned', type: 'system', unread: true },
    { id: 8, title: 'Event reminder: Client call', type: 'reminder', unread: false },
  ];

  const filteredNotifications = notifications.filter(n => {
    if (notificationTab === 'unread') return n.unread;
    if (notificationTab === 'read') return !n.unread;
    return true;
  });

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPageNum - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  const unreadCount = notifications.filter(n => n.unread).length;

  const handleProtectedAction = (action: () => void) => {
    if (!isLoggedIn) {
      onLogin();
    } else {
      action();
    }
  };

  return (
    <header className="border-b bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo and Toggle Section */}
        <div className="flex items-center space-x-4 w-64">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
          <h1 className="text-2xl font-bold text-primary">Scede</h1>
        </div>

        {/* Center Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant={currentPage === 'dashboard' ? "default" : "outline"}
            onClick={() => onPageChange('dashboard')}
            className="gap-2 rounded-lg"
          >
            <BarChart3 className="h-4 w-4" />
            AI Dashboard
          </Button>
          <Button
            variant={currentPage === 'calendar' ? "default" : "outline"}
            onClick={() => onPageChange('calendar')}
            className="gap-2 rounded-lg"
          >
            <CalendarIcon className="h-4 w-4" />
            Calendar
          </Button>
          <Button
            variant={currentPage === 'mails' ? "default" : "outline"}
            onClick={() => handleProtectedAction(() => onPageChange('mails'))}
            className="gap-2 rounded-lg"
          >
            <Mail className="h-4 w-4" />
            My Mails
          </Button>
        </div>

        {/* Right Side - Search, Layout, Theme, Notifications and Profile */}
        <div className="flex items-center space-x-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search... (⌘K)"
              className="pl-10 cursor-pointer bg-white dark:bg-slate-700 w-64"
              onClick={onSearch}
              readOnly
            />
          </div>
          
          {/* Layout Toggle */}
          {onLayoutToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLayoutToggle}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <AlignHorizontalSpaceAround className="h-5 w-5" />
            </Button>
          )}
          
          <ThemeToggle />
          
          {isLoggedIn ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between p-3">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    <Button variant="ghost" size="sm" className="text-xs">
                      See All
                    </Button>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <div className="p-2">
                    <Tabs value={notificationTab} onValueChange={(value) => {
                      setNotificationTab(value);
                      setCurrentPageNum(1);
                    }}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                        <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                        <TabsTrigger value="read" className="text-xs">Read</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value={notificationTab} className="mt-2">
                        <div className="max-h-80 overflow-y-auto">
                          {paginatedNotifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} className="flex items-start space-x-2 p-3">
                              <div className="flex-1">
                                <p className={`text-sm ${notification.unread ? 'font-medium' : ''}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">{notification.type}</p>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </div>
                        
                        {totalPages > 1 && (
                          <div className="border-t p-2">
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious 
                                    onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                                    className={currentPageNum === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                  />
                                </PaginationItem>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                  <PaginationItem key={page}>
                                    <PaginationLink
                                      onClick={() => setCurrentPageNum(page)}
                                      isActive={currentPageNum === page}
                                      className="cursor-pointer"
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                ))}
                                <PaginationItem>
                                  <PaginationNext 
                                    onClick={() => setCurrentPageNum(Math.min(totalPages, currentPageNum + 1))}
                                    className={currentPageNum === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onProfileClick}>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    Application Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={onLogin} className="gap-2">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
