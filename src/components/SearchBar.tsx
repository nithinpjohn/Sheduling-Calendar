
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SearchBarProps {
  onSearch: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search... (⌘K)"
            className="pl-10 cursor-pointer bg-white/80 dark:bg-slate-800/80 w-64 rounded-full border-slate-200/70 shadow-sm hover:bg-white transition"
            onClick={onSearch}
            readOnly
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>Search (⌘K)</TooltipContent>
    </Tooltip>
  );
};
