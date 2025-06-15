import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Users, TrendingUp, Plus, Search, Settings, Target, MapPin, Zap, BarChart3, GripVertical, Mail, Star, Activity, PieChart, Brain } from 'lucide-react';
import { CalendarEvent, EventCategory, SuggestedEvent } from './CalendarApp';
import { WeeklyBarChart } from './WeeklyBarChart';
import { useToast } from '@/hooks/use-toast';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

export interface SummaryPageProps {
  events: CalendarEvent[];
  categories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onCreateNew: () => void;
  onOpenCommandSearch: () => void;
  suggestedEvents: SuggestedEvent[];
  onSuggestedEventDrop: (event: SuggestedEvent, date: Date) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  setCategories: (categories: EventCategory[]) => void;
}

const defaultCards = [
  { id: 'events-overview', title: 'Events Overview', type: 'events-overview', enabled: true },
  { id: 'upcoming-meetings', title: 'Upcoming Meetings', type: 'upcoming-meetings', enabled: true },
  { id: 'monthly-trends', title: 'Monthly Trends', type: 'monthly-trends', enabled: true },
  { id: 'weekly-activity', title: 'Weekly Activity', type: 'weekly-activity', enabled: true },
  { id: 'category-analytics', title: 'Category Analytics', type: 'category-analytics', enabled: true },
  { id: 'productivity-insights', title: 'Productivity Insights', type: 'productivity-insights', enabled: true },
];

function DraggableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 p-1 bg-white dark:bg-gray-800 rounded border opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-gray-500" />
      </div>
      {children}
    </div>
  );
}

export const SummaryPage: React.FC<SummaryPageProps> = ({
  events,
  categories,
  onEventClick,
  onCreateNew,
  onOpenCommandSearch,
  suggestedEvents,
  onSuggestedEventDrop,
  selectedCategories,
  setSelectedCategories,
  setCategories,
}) => {
  const { toast } = useToast();
  const [cards, setCards] = useState(defaultCards);
  const [cardOrder, setCardOrder] = useState(defaultCards.map(card => card.id));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return eventDate >= weekStart && eventDate <= weekEnd;
  });

  const eventsWithLocation = events.filter(event => event.location && event.location.trim() !== '');

  // Generate dynamic monthly data based on actual events
  const monthlyData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const monthIndex = months.indexOf(month);
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === 2024;
      });
      return { month, events: monthEvents.length };
    });
  }, [events]);

  // Generate dynamic weekly activity data
  const weeklyActivityData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => {
      const dayIndex = days.indexOf(day);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.getDay() === (dayIndex + 1) % 7; // Adjust for Monday start
      });
      return { day, events: dayEvents.length };
    });
  }, [events]);

  const categoryData = React.useMemo(() => {
    return categories.map(cat => ({
      name: cat.name,
      value: events.filter(event => event.category === cat.id).length,
      color: cat.color,
    })).filter(cat => cat.value > 0);
  }, [events, categories]);

  const chartConfig = {
    events: {
      label: "Events",
      color: "#3B82F6",
    },
    productivity: {
      label: "Productivity",
      color: "#10B981",
    },
  };

  useEffect(() => {
    const storedCards = localStorage.getItem('dashboard-cards');
    const storedOrder = localStorage.getItem('dashboard-order');
    
    if (storedCards) {
      setCards(JSON.parse(storedCards));
    }
    if (storedOrder) {
      setCardOrder(JSON.parse(storedOrder));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboard-cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('dashboard-order', JSON.stringify(cardOrder));
  }, [cardOrder]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = cardOrder.indexOf(active.id);
      const newIndex = cardOrder.indexOf(over.id);

      setCardOrder(arrayMove(cardOrder, oldIndex, newIndex));
      toast({
        title: "Dashboard Updated",
        description: "Your dashboard layout has been updated.",
      });
    }

    setActiveId(null);
  };

  const toggleCard = (cardId: string) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, enabled: !card.enabled } : card
    ));
  };

  const enabledCards = cards.filter(card => card.enabled);
  const orderedCards = cardOrder
    .map(id => enabledCards.find(card => card.id === id))
    .filter(Boolean);

  const renderCard = (card: any) => {
    switch (card.type) {
      case 'events-overview':
        return (
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Events Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{thisWeekEvents.length}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">This Week</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{events.length}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">Total Events</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{categories.length}</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Categories</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{eventsWithLocation.length}</p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">With Location</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'upcoming-meetings':
        return (
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Upcoming Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {thisWeekEvents.length > 0 ? (
                <div className="space-y-3">
                  {thisWeekEvents.slice(0, 3).map((event) => {
                    const category = categories.find(c => c.id === event.category);
                    return (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.start).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" style={{ borderColor: category?.color }}>
                          {category?.name || 'Unknown'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No upcoming meetings</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'monthly-trends':
        return (
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Monthly Trends
              </CardTitle>
              <CardDescription>Events created per month (2024)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-48">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="events" 
                    stroke="var(--color-events)" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        );

      case 'weekly-activity':
        return (
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Events by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-48">
                <BarChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="events" 
                    fill="var(--color-events)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        );

      case 'category-analytics':
        return (
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-orange-600" />
                Category Analytics
              </CardTitle>
              <CardDescription>Event distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{category.value}</span>
                  </div>
                ))}
                {categoryData.length === 0 && (
                  <p className="text-sm text-muted-foreground">No events to display</p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'productivity-insights':
        return (
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-600" />
                Productivity Insights
              </CardTitle>
              <CardDescription>Week-over-week comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Events Completed</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {events.length > 0 ? Math.round((events.length / (events.length + 2)) * 100) : 0}%
                  </p>
                </div>
                <div className="text-green-600">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Avg Duration</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {events.length > 0 ? '1.5 hrs' : '0 hrs'}
                  </p>
                </div>
                <div className="text-blue-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Intelligent insights and analytics for your calendar events</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Customize Widgets
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Customize Dashboard</DialogTitle>
                  <DialogDescription>
                    Toggle widgets on or off to customize your dashboard view.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {defaultCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between">
                      <label htmlFor={card.id} className="text-sm font-medium">
                        {card.title}
                      </label>
                      <Switch
                        id={card.id}
                        checked={cards.find(c => c.id === card.id)?.enabled || false}
                        onCheckedChange={() => toggleCard(card.id)}
                      />
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={onOpenCommandSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Quick Search
            </Button>
            <Button onClick={onCreateNew} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Events</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{events.length}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">This Week</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{thisWeekEvents.length}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Categories</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{categories.length}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Productivity</p>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                    {events.length > 0 ? '+15%' : '0%'}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Draggable Dashboard Cards */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <SortableContext items={cardOrder} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {orderedCards.map((card) => (
                <DraggableCard key={card.id} id={card.id}>
                  {renderCard(card)}
                </DraggableCard>
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className="opacity-80">
                {renderCard(cards.find(card => card.id === activeId))}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
