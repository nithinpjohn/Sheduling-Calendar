
import React from 'react';
import { AlignHorizontalSpaceAround, Grid, List, Calendar as CalendarView, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LayoutSelectorProps {
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentView = 'dayGridMonth',
  onViewChange
}) => {
  const layoutOptions = [
    { id: 'dayGridMonth', label: 'Month View', icon: Grid },
    { id: 'timeGridWeek', label: 'Week View', icon: CalendarView },
    { id: 'timeGridDay', label: 'Day View', icon: Clock },
    { id: 'listWeek', label: 'List View', icon: List },
  ];

  if (!onViewChange) {
    return null;
  }

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <AlignHorizontalSpaceAround className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Layout Options</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-56 bg-white dark:bg-slate-800" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm mb-3">Layout Options</h4>
          {layoutOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.id}
                variant={currentView === option.id ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => onViewChange(option.id)}
              >
                <IconComponent className="h-4 w-4" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
