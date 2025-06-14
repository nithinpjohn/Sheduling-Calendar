import React, { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, Monitor, Zap } from 'lucide-react';
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

interface TopMenuBarProps {
  onSearch: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}

export const TopMenuBar: React.FC<TopMenuBarProps> = ({ 
  onSearch, 
  isLoggedIn, 
  onLogout, 
  onProfileClick, 
  onSettingsClick 
}) => {
  const notifications = [
    { id: 1, title: 'Team Meeting in 30 minutes', type: 'reminder', unread: true },
    { id: 2, title: 'New event invitation from John', type: 'invitation', unread: true },
    { id: 3, title: 'Calendar sync completed', type: 'system', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary">Scede</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events... (⌘K)"
              className="pl-10 cursor-pointer"
              onClick={onSearch}
              readOnly
            />
          </div>
        </div>

        {/* Right Side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {isLoggedIn && (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((notification) => (
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
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
          )}
        </div>
      </div>
    </header>
  );
};
