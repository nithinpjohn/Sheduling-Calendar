
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface NotificationDropdownProps {
  isLoggedIn: boolean;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isLoggedIn }) => {
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

  if (!isLoggedIn) {
    return null;
  }

  return (
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
  );
};
