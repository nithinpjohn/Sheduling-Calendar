
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarEvent, EventCategory, SuggestedEvent } from './CalendarApp';
import { WeeklyBarChart } from './WeeklyBarChart';
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, addDays, isSameDay, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, Clock, Users, MapPin, Plus, Search, TrendingUp, Activity, Target, Zap, GripVertical, Settings, BarChart3, PieChart as PieChartIcon, Eye, EyeOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';

interface SummaryPageProps {
  events: CalendarEvent[];
  categories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onCreateNew: () => void;
  onOpenCommandSearch: () => void;
  suggestedEvents: SuggestedEvent[];
  onSuggestedEventDrop: (eventData: SuggestedEvent, date: Date) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  setCategories: (categories: EventCategory[]) => void;
}

interface DashboardCard {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content?: React.ReactNode;
  enabled: boolean;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([]);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverCard, setDragOverCard] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate statistics
  const totalEvents = events.length;
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate >= weekStart && eventDate <= weekEnd;
  });

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekEnd);
  lastWeekEnd.setDate(weekEnd.getDate() - 7);
  
  const lastWeekEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate >= lastWeekStart && eventDate <= lastWeekEnd;
  });

  const categoryStats = categories.map(category => {
    const count = events.filter(event => event.category === category.id).length;
    return {
      category: category.name,
      count,
      color: category.color,
    };
  }).sort((a, b) => b.count - a.count);

  const upcomingEvents = [...events]
    .filter(event => new Date(event.start) >= today)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const sixMonthsAgo = subMonths(today, 5);
  const monthRange = eachMonthOfInterval({
    start: startOfMonth(sixMonthsAgo),
    end: endOfMonth(today),
  });

  const monthlyData = monthRange.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });
    
    return {
      month: format(month, 'MMM'),
      events: monthEvents.length,
    };
  });

  const weeklyTrendData = [
    { day: 'Mon', events: events.filter(e => new Date(e.start).getDay() === 1).length },
    { day: 'Tue', events: events.filter(e => new Date(e.start).getDay() === 2).length },
    { day: 'Wed', events: events.filter(e => new Date(e.start).getDay() === 3).length },
    { day: 'Thu', events: events.filter(e => new Date(e.start).getDay() === 4).length },
    { day: 'Fri', events: events.filter(e => new Date(e.start).getDay() === 5).length },
    { day: 'Sat', events: events.filter(e => new Date(e.start).getDay() === 6).length },
    { day: 'Sun', events: events.filter(e => new Date(e.start).getDay() === 0).length },
  ];

  // Initialize dashboard cards
  useEffect(() => {
    const cards: DashboardCard[] = [
      {
        id: 'events-overview',
        title: 'Events Overview',
        icon: Activity,
        enabled: true,
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-blue-700/10 p-5 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                      {thisWeekEvents.length}
                    </div>
                    <div className="text-sm text-blue-600/80 dark:text-blue-400/80 font-medium">This Week</div>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:via-emerald-800/20 dark:to-emerald-700/10 p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
                      {events.length}
                    </div>
                    <div className="text-sm text-emerald-600/80 dark:text-emerald-400/80 font-medium">Total Events</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="group relative overflow-hidden bg-gradient-to-br from-violet-50 via-violet-100 to-violet-200 dark:from-violet-900/30 dark:via-violet-800/20 dark:to-violet-700/10 p-5 rounded-2xl border border-violet-200/50 dark:border-violet-700/30 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-violet-700 dark:from-violet-400 dark:to-violet-500 bg-clip-text text-transparent">
                      {categories.length}
                    </div>
                    <div className="text-sm text-violet-600/80 dark:text-violet-400/80 font-medium">Categories</div>
                  </div>
                </div>
              </div>
              <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 dark:from-amber-900/30 dark:via-amber-800/20 dark:to-amber-700/10 p-5 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">
                      {events.filter(e => e.location).length}
                    </div>
                    <div className="text-sm text-amber-600/80 dark:text-amber-400/80 font-medium">With Location</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Completion Rate</span>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <div className="w-3/4 h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full shadow-sm"></div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">75%</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Average Duration</span>
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200 border-0 shadow-sm">
                  1.5 hrs
                </Badge>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'upcoming-meetings',
        title: 'Upcoming Meetings',
        icon: Clock,
        enabled: true,
        content: (
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming meetings</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {upcomingEvents.slice(0, 5).map((event) => {
                  const category = categories.find(c => c.id === event.category);
                  return (
                    <div
                      key={event.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => onEventClick(event)}
                      style={{
                        borderLeftColor: category?.color,
                        borderLeftWidth: '4px'
                      }}
                    >
                      <h4 className="font-medium text-sm truncate">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(event.start), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'monthly-trends',
        title: 'Monthly Trends',
        icon: TrendingUp,
        enabled: true,
        content: (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <BarChart3 className="h-4 w-4" />
                <span>Events created per month (2025)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="events"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ),
      },
      {
        id: 'weekly-activity',
        title: 'Weekly Activity',
        icon: BarChart3,
        enabled: true,
        content: (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <BarChart3 className="h-4 w-4" />
                <span>Events by day of week</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="events" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ),
      },
      {
        id: 'category-analytics',
        title: 'Category Analytics',
        icon: PieChartIcon,
        enabled: true,
        content: (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Target className="h-4 w-4" />
                <span>Performance by category</span>
              </div>
            </div>
            {categoryStats.length > 0 ? (
              <div className="space-y-3">
                {categoryStats.slice(0, 3).map((stat, index) => (
                  <div key={stat.category} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{stat.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {stat.count} events ({Math.round((stat.count / events.length) * 100)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{categoryStats.reduce((sum, stat) => sum + stat.count, 0)} total attendees</span>
                    <Badge variant="secondary" className="ml-2">
                      8 avg per event
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No category data available</p>
            )}
          </div>
        ),
      },
      {
        id: 'productivity-insights',
        title: 'Productivity Insights',
        icon: Zap,
        enabled: true,
        content: (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span>Productivity metrics</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{thisWeekEvents.length}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {lastWeekEvents.length > 0 
                    ? `${Math.round(((thisWeekEvents.length - lastWeekEvents.length) / lastWeekEvents.length) * 100)}%`
                    : '0%'
                  }
                </div>
                <div className="text-sm text-muted-foreground">vs Last Week</div>
              </div>
            </div>
          </div>
        ),
      },
    ];
    setDashboardCards(cards);
  }, [events, categories, thisWeekEvents.length, lastWeekEvents.length]);

  const createGhostImage = (card: DashboardCard) => {
    const IconComponent = card.icon;
    
    // Create a more realistic ghost element
    const ghostElement = document.createElement('div');
    ghostElement.style.position = 'absolute';
    ghostElement.style.top = '-1000px';
    ghostElement.style.left = '-1000px';
    ghostElement.style.width = '320px';
    ghostElement.style.height = '200px';
    ghostElement.style.pointerEvents = 'none';
    ghostElement.style.zIndex = '9999';
    
    // Match the actual card styling
    ghostElement.className = 'bg-white dark:bg-gray-900 border-2 border-blue-500/50 rounded-xl p-4 shadow-2xl transform rotate-2 scale-105 opacity-90';
    
    // Create the content to match the card header
    ghostElement.innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        <div class="p-2 bg-blue-500 rounded-lg shadow-md">
          <div class="w-5 h-5 bg-white rounded opacity-80"></div>
        </div>
        <div class="font-semibold text-gray-900 dark:text-white text-lg">${card.title}</div>
      </div>
      <div class="space-y-2">
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 opacity-60"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 opacity-60"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 opacity-60"></div>
      </div>
      <div class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
    `;
    
    return ghostElement;
  };

  const handleCardDragStart = (e: React.DragEvent<HTMLDivElement>, card: DashboardCard) => {
    // Only allow drag if the target is the handle
    if (!(e.target as HTMLElement).closest('.drag-handle')) {
      e.preventDefault();
      return;
    }
    
    console.log('Starting drag for card:', card.title);
    setDraggedCard(card.id);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id);
    
    // Create and use the enhanced ghost image
    const ghostElement = createGhostImage(card);
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 160, 100);
    
    // Clean up ghost element after drag starts
    setTimeout(() => {
      if (document.body.contains(ghostElement)) {
        document.body.removeChild(ghostElement);
      }
    }, 0);
  };

  const handleCardDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedCard(null);
    setDragOverCard(null);
    setIsDragging(false);
  };

  const handleCardDragOver = (e: React.DragEvent<HTMLDivElement>, cardId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCard(cardId);
  };

  const handleCardDragLeave = () => {
    setDragOverCard(null);
  };

  const handleCardDrop = (e: React.DragEvent<HTMLDivElement>, targetCardId: string) => {
    e.preventDefault();
    const draggedCardId = e.dataTransfer.getData('text/plain');
    
    if (draggedCardId === targetCardId) return;

    const draggedIndex = dashboardCards.findIndex(card => card.id === draggedCardId);
    const targetIndex = dashboardCards.findIndex(card => card.id === targetCardId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newCards = [...dashboardCards];
    const [draggedCard] = newCards.splice(draggedIndex, 1);
    newCards.splice(targetIndex, 0, draggedCard);

    setDashboardCards(newCards);
    setDragOverCard(null);
  };

  const toggleCardVisibility = (cardId: string) => {
    setDashboardCards(prev => 
      prev.map(card => 
        card.id === cardId 
          ? { ...card, enabled: !card.enabled }
          : card
      )
    );
  };

  const enabledCards = dashboardCards.filter(card => card.enabled);

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-950">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Intelligent insights and analytics for your calendar events
                </p>
              </div>
              <div className="flex gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Customize Widgets
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Customize Dashboard</SheetTitle>
                      <SheetDescription>
                        Enable or disable dashboard cards and drag to reorder them.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {dashboardCards.map((card) => {
                        const IconComponent = card.icon;
                        return (
                          <div
                            key={card.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-4 w-4" />
                              <span className="font-medium">{card.title}</span>
                            </div>
                            <Switch
                              checked={card.enabled}
                              onCheckedChange={() => toggleCardVisibility(card.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </SheetContent>
                </Sheet>
                <Button 
                  onClick={onOpenCommandSearch}
                  variant="outline" 
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  Quick Search
                </Button>
                <Button 
                  onClick={onCreateNew}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Productivity</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">+15%</p>
                    </div>
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                      <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Dashboard Cards Grid */}
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ease-out ${
              isDragging ? 'transform-gpu' : ''
            }`}
            style={{
              transition: isDragging ? 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'all 0.3s ease-out'
            }}
          >
            {enabledCards.map((card, index) => {
              const IconComponent = card.icon;
              const isBeingDragged = draggedCard === card.id;
              const isDropTarget = dragOverCard === card.id;
              
              return (
                <Card
                  key={card.id}
                  className={`rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-400 ease-out transform-gpu ${
                    isBeingDragged 
                      ? 'opacity-30 scale-95 rotate-1 shadow-2xl z-50 blur-sm' 
                      : isDropTarget 
                        ? 'scale-105 shadow-xl border-blue-500 border-2 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20' 
                        : 'hover:shadow-lg hover:scale-[1.02] hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1'
                  } ${
                    isDragging && !isBeingDragged 
                      ? 'transition-all duration-400 ease-out transform-gpu hover:scale-100' 
                      : ''
                  }`}
                  style={{
                    transitionDelay: isDragging && !isBeingDragged ? `${index * 50}ms` : '0ms',
                    transform: isDragging && !isBeingDragged 
                      ? `translateY(${isDropTarget ? '0px' : '0px'}) scale(${isDropTarget ? '1.05' : '1'})` 
                      : undefined
                  }}
                  draggable={false}
                  onDragStart={(e) => handleCardDragStart(e, card)}
                  onDragEnd={handleCardDragEnd}
                  onDragOver={(e) => handleCardDragOver(e, card.id)}
                  onDragLeave={handleCardDragLeave}
                  onDrop={(e) => handleCardDrop(e, card.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconComponent className="h-5 w-5 text-primary" />
                      {card.title}
                      <div 
                        className="drag-handle ml-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 hover:shadow-md group"
                        draggable={true}
                      >
                        <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 group-hover:text-blue-500 transition-colors duration-200" />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {card.content}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
