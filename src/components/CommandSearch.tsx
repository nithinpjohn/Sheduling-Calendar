
import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventCategory } from './CalendarApp';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ChevronRight 
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  categories: EventCategory[];
  onEventSelect: (event: CalendarEvent) => void;
  onCreateNew: () => void;
}

export const CommandSearch: React.FC<CommandSearchProps> = ({
  isOpen,
  onClose,
  events,
  categories,
  onEventSelect,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!isOpen) {
          // Only open if not already open
          return;
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen]);

  const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower)
    );
  });

  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const formatEventTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const handleEventSelect = (event: CalendarEvent) => {
    onEventSelect(event);
    onClose();
  };

  const handleCreateNew = () => {
    onCreateNew();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search events or type to create new..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[400px] overflow-y-auto">
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">No events found</p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search or create a new event
                </p>
              </div>
            </CommandEmpty>

            {searchTerm && (
              <CommandGroup heading="Actions">
                <CommandItem onSelect={handleCreateNew} className="flex items-center gap-2 py-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Create new event</div>
                    <div className="text-sm text-muted-foreground">
                      Create "{searchTerm}"
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CommandItem>
              </CommandGroup>
            )}

            {filteredEvents.length > 0 && (
              <CommandGroup heading={`Events (${filteredEvents.length})`}>
                {filteredEvents.slice(0, 10).map((event) => {
                  const category = getCategoryInfo(event.category);
                  return (
                    <CommandItem
                      key={event.id}
                      onSelect={() => handleEventSelect(event)}
                      className="flex items-start gap-3 py-3 px-3 cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-md" style={{
                        backgroundColor: `${category?.color}20`,
                        color: category?.color
                      }}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium truncate">{event.title}</div>
                          {category && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color
                              }}
                            >
                              {category.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatEventDate(event.start)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatEventTime(event.start)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{event.location}</span>
                            </div>
                          )}
                          {event.attendees && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{event.attendees}</span>
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {!searchTerm && (
              <CommandGroup heading="Quick Actions">
                <CommandItem onSelect={handleCreateNew} className="flex items-center gap-2 py-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Create new event</div>
                    <div className="text-sm text-muted-foreground">
                      Schedule a new event
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
