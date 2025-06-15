
import React from 'react';
import { CalendarIcon, BarChart3, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavigationButtonsProps {
  currentPage: 'dashboard' | 'calendar' | 'profile' | 'settings' | 'mails';
  onPageChange: (page: 'dashboard' | 'calendar' | 'profile' | 'settings' | 'mails') => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentPage,
  onPageChange,
  isLoggedIn,
  onLogin
}) => {
  const handleProtectedAction = (action: () => void) => {
    if (!isLoggedIn) {
      onLogin();
    } else {
      action();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={currentPage === 'dashboard' ? "default" : "outline"}
            onClick={() => onPageChange('dashboard')}
            className="gap-2 rounded-lg"
          >
            <BarChart3 className="h-4 w-4" />
            AI Dashboard
          </Button>
        </TooltipTrigger>
        <TooltipContent>AI Dashboard</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={currentPage === 'calendar' ? "default" : "outline"}
            onClick={() => onPageChange('calendar')}
            className="gap-2 rounded-lg"
          >
            <CalendarIcon className="h-4 w-4" />
            Calendar
          </Button>
        </TooltipTrigger>
        <TooltipContent>Calendar</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={currentPage === 'mails' ? "default" : "outline"}
            onClick={() => handleProtectedAction(() => onPageChange('mails'))}
            className="gap-2 rounded-lg"
          >
            <Mail className="h-4 w-4" />
            My Mails
          </Button>
        </TooltipTrigger>
        <TooltipContent>My Mails</TooltipContent>
      </Tooltip>
    </div>
  );
};
