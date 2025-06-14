import React, { useState } from 'react';
import { Plus, Filter, Calendar, BarChart3, Users, Lightbulb, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CalendarEvent, EventCategory, SuggestedEvent } from './CalendarApp';
import { format, parseISO, isToday, isTomorrow, isFuture } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { ColorPicker } from './ColorPicker';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface CalendarSidebarProps {
  events: CalendarEvent[];
  categories: EventCategory[];
  setCategories: (categories: EventCategory[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  onEventClick: (event: CalendarEvent) => void;
  onOpenCommandSearch: () => void;
  onCreateNew: () => void;
  suggestedEvents: SuggestedEvent[];
  onSuggestedEventDrop: (eventData: SuggestedEvent, date: Date) => void;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  events,
  categories,
  setCategories,
  selectedCategories,
  setSelectedCategories,
  onEventClick,
  onOpenCommandSearch,
  onCreateNew,
  suggestedEvents,
  onSuggestedEventDrop,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const upcomingEvents = events
    .filter(event => isFuture(parseISO(event.start)))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId]
    );
  };

  const createCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: EventCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        color: newCategoryColor,
        isDefault: false,
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setNewCategoryColor('#3B82F6');
      setIsCreatingCategory(false);
    }
  };

  const deleteCategory = (categoryId: string) => {
    const hasEvents = events.some(event => event.category === categoryId);
    if (hasEvents) {
      alert('Cannot delete category with existing events');
      return;
    }
    setCategories(categories.filter(c => c.id !== categoryId));
  };

  const getEventTimeLabel = (event: CalendarEvent) => {
    const eventDate = parseISO(event.start);
    if (isToday(eventDate)) return 'Today';
    if (isTomorrow(eventDate)) return 'Tomorrow';
    return format(eventDate, 'MMM d');
  };

  const getCategory = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, suggestedEvent: SuggestedEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    const dragData = JSON.stringify({
      type: 'suggested-event',
      data: suggestedEvent
    });
    e.dataTransfer.setData('application/json', dragData);
    e.dataTransfer.setData('text/plain', dragData);
  };

  return (
    <div className="w-80 border-r bg-card p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Create Event Button */}
        <Button onClick={onCreateNew} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>

        {/* Categories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Categories
            </Label>
            <Popover open={isCreatingCategory} onOpenChange={setIsCreatingCategory}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Create Category</h4>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <ColorPicker
                      color={newCategoryColor}
                      onChange={setNewCategoryColor}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createCategory} size="sm">
                      Create
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsCreatingCategory(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.length === 0 || selectedCategories.includes(category.id)}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                />
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-sm flex-1">
                    {category.name}
                  </Label>
                  <Badge variant="secondary" className="text-xs">
                    {events.filter(e => e.category === category.id).length}
                  </Badge>
                  {!category.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCategory(category.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggested Events */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Suggested Events
          </Label>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {suggestedEvents.map((suggestedEvent) => {
                const category = getCategory(suggestedEvent.category);
                return (
                  <Card
                    key={suggestedEvent.id}
                    className="cursor-move transition-all hover:shadow-md border-l-4 select-none"
                    style={{ borderLeftColor: category?.color }}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, suggestedEvent)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{suggestedEvent.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {suggestedEvent.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {suggestedEvent.duration}h
                            </Badge>
                            {suggestedEvent.defaultAttendees && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {suggestedEvent.defaultAttendees}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Upcoming Events */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Events
          </Label>
          <div className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => {
                const category = getCategory(event.category);
                return (
                  <Card
                    key={event.id}
                    className="cursor-pointer transition-all hover:shadow-md border-l-4"
                    style={{ borderLeftColor: category?.color }}
                    onClick={() => onEventClick(event)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{event.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getEventTimeLabel(event)} • {format(parseISO(event.start), 'h:mm a')}
                          </p>
                          {event.location && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              📍 {event.location}
                            </p>
                          )}
                          {event.attendees && (
                            <div className="flex items-center gap-1 mt-1">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{event.attendees} attendees</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Quick Stats
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-primary">{events.length}</div>
                <div className="text-xs text-muted-foreground">Total Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {events.filter(e => isFuture(parseISO(e.start))).length}
                </div>
                <div className="text-xs text-muted-foreground">Upcoming</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
