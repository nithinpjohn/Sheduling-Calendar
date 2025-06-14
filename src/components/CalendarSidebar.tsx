
import React, { useState } from 'react';
import { CalendarEvent, EventCategory } from './CalendarApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  Plus, 
  Trash2, 
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Command
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

interface CalendarSidebarProps {
  events: CalendarEvent[];
  categories: EventCategory[];
  setCategories: (categories: EventCategory[]) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  onEventClick: (event: CalendarEvent) => void;
  onOpenCommandSearch: () => void;
}

const viewOptions = [
  { value: 'dayGridMonth', label: 'Month' },
  { value: 'timeGridWeek', label: 'Week' },
  { value: 'timeGridDay', label: 'Day' },
];

const presetColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  events,
  categories,
  setCategories,
  currentView,
  setCurrentView,
  searchTerm,
  setSearchTerm,
  selectedCategories,
  setSelectedCategories,
  onEventClick,
  onOpenCommandSearch,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const { toast } = useToast();

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId]
    );
  };

  const createCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

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
    
    toast({
      title: "Category Created",
      description: `"${newCategory.name}" category has been added.`,
    });
  };

  const deleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (category.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default categories cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    const hasEvents = events.some(event => event.category === categoryId);
    if (hasEvents) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete category with existing events.",
        variant: "destructive",
      });
      return;
    }

    setCategories(categories.filter(c => c.id !== categoryId));
    toast({
      title: "Category Deleted",
      description: `"${category.name}" category has been removed.`,
    });
  };

  const getEventsByDate = () => {
    const today = new Date();
    const upcomingEvents = events
      .filter(event => new Date(event.start) >= today)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 10);
    
    return upcomingEvents;
  };

  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const formatEventTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  };

  const totalEvents = events.length;
  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return eventDate >= weekStart && eventDate <= weekEnd;
  }).length;

  return (
    <div className="w-80 border-r bg-card p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Search */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              onClick={onOpenCommandSearch}
              className="w-full justify-start gap-2 text-muted-foreground"
            >
              <Command className="h-4 w-4" />
              Search events...
              <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <Input
              placeholder="Quick search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Events</span>
              <Badge variant="secondary">{totalEvents}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">This Week</span>
              <Badge variant="secondary">{thisWeekEvents}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* View Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {viewOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={currentView === option.value ? "default" : "outline"}
                  onClick={() => setCurrentView(option.value)}
                  className="w-full justify-start"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5" />
                Categories
              </span>
              <Popover open={isCreatingCategory} onOpenChange={setIsCreatingCategory}>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-name">Category Name</Label>
                      <Input
                        id="category-name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter category name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {presetColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewCategoryColor(color)}
                            className={`w-6 h-6 rounded-full border-2 ${
                              newCategoryColor === color ? 'border-primary' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <HexColorPicker
                        color={newCategoryColor}
                        onChange={setNewCategoryColor}
                        style={{ width: '100%', height: '120px' }}
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.length === 0 || selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <Label htmlFor={category.id} className="text-sm">
                        {category.name}
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {events.filter(e => e.category === category.id).length}
                    </Badge>
                    {!category.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteCategory(category.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getEventsByDate().length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              ) : (
                getEventsByDate().map((event) => {
                  const category = categories.find(c => c.id === event.category);
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category?.color }}
                            />
                            <p className="text-sm font-medium truncate">{event.title}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CalendarDays className="h-3 w-3" />
                              <span>{formatEventDate(event.start)}</span>
                              <span>•</span>
                              <span>{formatEventTime(event.start)}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            {event.attendees && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{event.attendees} attendees</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
