
import React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import { NavigationButtons } from './NavigationButtons';
import { LayoutSelector } from './LayoutSelector';
import { SearchBar } from './SearchBar';

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
  currentView?: string;
  onViewChange?: (view: string) => void;
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
  onLayoutToggle,
  currentView = 'dayGridMonth',
  onViewChange
}) => {
  return (
    <TooltipProvider>
      <header className="border-b bg-white dark:bg-slate-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo and Toggle Section */}
          <div className="flex items-center space-x-4 w-64">
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                {isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              </TooltipContent>
            </Tooltip>
            <h1 className="text-2xl font-bold text-primary">Scede</h1>
          </div>

          {/* Center Navigation */}
          <NavigationButtons
            currentPage={currentPage}
            onPageChange={onPageChange}
            isLoggedIn={isLoggedIn}
            onLogin={onLogin}
          />

          {/* Right Side - Search, Layout, Theme, Notifications and Profile */}
          <div className="flex items-center space-x-2">
            <SearchBar onSearch={onSearch} />
            
            <LayoutSelector
              currentView={currentView}
              onViewChange={onViewChange}
            />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent>Toggle Theme</TooltipContent>
            </Tooltip>
            
            <NotificationDropdown isLoggedIn={isLoggedIn} />
            
            <ProfileDropdown
              isLoggedIn={isLoggedIn}
              onLogout={onLogout}
              onProfileClick={onProfileClick}
              onSettingsClick={onSettingsClick}
              onLogin={onLogin}
            />
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};
