
import React from 'react';
import { PanelLeftClose, PanelLeftOpen, AlignHorizontalSpaceAround } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileDropdown } from './ProfileDropdown';
import { NavigationButtons } from './NavigationButtons';
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
  containerWidth?: number[];
  onContainerWidthChange?: (width: number[]) => void;
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
  containerWidth = [90],
  onContainerWidthChange
}) => {
  return (
    <TooltipProvider>
      <header className="border-b border-slate-200/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
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
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Scede</h1>
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
            
            {onContainerWidthChange && (
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-full"
                      >
                        <AlignHorizontalSpaceAround className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Layout Options</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-80 bg-white/95 dark:bg-slate-900 rounded-2xl border border-slate-200/70 shadow-lg" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Adjust Container Width</h4>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600 dark:text-gray-400">
                        Width: {containerWidth[0]}%
                      </Label>
                      <Slider
                        value={containerWidth}
                        onValueChange={onContainerWidthChange}
                        max={100}
                        min={50}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
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
