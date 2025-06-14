
import React, { useState } from 'react';
import { CalendarEvent, EventCategory } from './CalendarApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, Users, TrendingUp, Calendar, Clock, MapPin, Activity, BarChart3, PieChart as PieChartIcon, Menu } from 'lucide-react';
import { WeeklyBarChart } from './WeeklyBarChart';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { CalendarSidebar } from './CalendarSidebar';

interface SummaryPageProps {
  events: CalendarEvent[];
  categories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onCreateNew: () => void;
  onOpenCommandSearch: () => void;
  suggestedEvents: any[];
  onSuggestedEventDrop: (eventData: any, date: Date) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  setCategories: (categories: EventCategory[]) => void;
}

interface DashboardCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  enabled: boolean;
  gradient: string;
}

const defaultCards: DashboardCard[] = [
  {
    id: 'overview',
    title: 'Events Overview',
    icon: <Activity className="w-5 h-5" />,
    enabled: true,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'weekly',
    title: 'Weekly Activity',
    icon: <BarChart3 className="w-5 h-5" />,
    enabled: true,
    gradient: 'from-green-500 to-green-600',
  },
  {
    id: 'upcoming',
    title: 'Upcoming Meetings',
    icon: <Calendar className="w-5 h-5" />,
    enabled: true,
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    id: 'monthly',
    title: 'Monthly Trends',
    icon: <TrendingUp className="w-5 h-5" />,
    enabled: true,
    gradient: 'from-red-500 to-red-600',
  },
  {
    id: 'categories',
    title: 'Category Analytics',
    icon: <PieChartIcon className="w-5 h-5" />,
    enabled: true,
    gradient: 'from-yellow-500 to-yellow-600',
  },
  {
    id: 'productivity',
    title: 'Productivity Insights',
    icon: <TrendingUp className="w-5 h-5" />,
    enabled: true,
    gradient: 'from-orange-500 to-orange-600',
  },
];

interface SortableCardProps {
  card: DashboardCard;
  children: React.ReactNode;
}

const DashboardCard: React.FC<SortableCardProps> = ({ card, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <Card ref={setNodeRef} style={style} className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card backdrop-blur-sm rounded-lg">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg bg-gradient-to-r ${card.gradient} text-white shadow-lg`}>
              {card.icon}
            </div>
            <CardTitle className="text-lg font-semibold text-card-foreground">{card.title}</CardTitle>
          </div>
          <div {...attributes} {...listeners} className="cursor-grab opacity-50 hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">{children}</CardContent>
    </Card>
  );
};

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
  setCategories
}) => {
  const [cards, setCards] = useState(defaultCards);
  const [showCustomize, setShowCustomize] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
  }).length;

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

  const renderCardContent = (card: DashboardCard) => {
    switch (card.id) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-100 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{events.filter(e => {
                  const eventDate = new Date(e.start);
                  const today = new Date();
                  return eventDate.toDateString() === today.toDateString();
                }).length}</div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Today</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-100 dark:border-green-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{thisWeekEvents}</div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300">This Week</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-100 dark:border-purple-800">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{upcomingEvents.length}</div>
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Upcoming</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-100 dark:border-orange-800">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{Math.round(events.reduce((acc, e) => acc + (e.attendees || 0), 0) / events.length) || 0}</div>
                <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg Attendees</div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-card-foreground">Total Events</span>
                </div>
                <span className="font-bold text-card-foreground">{events.length}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium text-card-foreground">Total Attendees</span>
                </div>
                <span className="font-bold text-card-foreground">{events.reduce((acc, e) => acc + (e.attendees || 0), 0)}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                    <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium text-card-foreground">Events with Location</span>
                </div>
                <span className="font-bold text-card-foreground">{events.filter(e => e.location).length}</span>
              </div>
            </div>
          </div>
        );

      case 'weekly':
        return <WeeklyBarChart events={events} />;

      case 'upcoming':
        return (
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-muted-foreground font-medium">No upcoming meetings</div>
              </div>
            ) : (
              upcomingEvents.slice(0, 5).map((event) => {
                const category = categories.find(c => c.id === event.category);
                return (
                  <div 
                    key={event.id} 
                    className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-border/80 cursor-pointer transition-all duration-200" 
                    onClick={() => onEventClick(event)}
                  >
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: category?.color }} />
                    <div className="flex-1">
                      <div className="font-semibold text-card-foreground text-sm mb-1">{event.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(event.start), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );

      case 'monthly':
        return (
          <div className="h-64 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: 'none', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: 'hsl(var(--card-foreground))'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: 'hsl(var(--card))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={40}
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: 'none', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        color: 'hsl(var(--card-foreground))'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {categoryStats.slice(0, 3).map((stat) => (
                  <div key={stat.category} className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: stat.color }} />
                      <span className="font-medium text-card-foreground">{stat.category}</span>
                    </div>
                    <span className="font-bold text-card-foreground">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'productivity':
        return (
          <div className="text-center space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-100 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{thisWeekEvents}</div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">This Week</div>
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-100 dark:border-green-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">+15%</div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300">vs Last Week</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Productivity is trending upward
            </div>
          </div>
        );

      default:
        return <div>No content available</div>;
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleCard = (cardId: string) => {
    setCards(cards.map(card => 
      card.id === cardId ? { ...card, enabled: !card.enabled } : card
    ));
  };

  const enabledCards = cards.filter(card => card.enabled);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CalendarSidebar
          events={events}
          categories={categories}
          setCategories={setCategories}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          onEventClick={onEventClick}
          onOpenCommandSearch={onOpenCommandSearch}
          onCreateNew={onCreateNew}
          suggestedEvents={suggestedEvents}
          onSuggestedEventDrop={onSuggestedEventDrop}
        />
        
        <div className="flex-1 h-full overflow-auto bg-gradient-to-br from-background via-background to-muted/20">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-card-foreground to-muted-foreground bg-clip-text text-transparent">AI Dashboard</h1>
                  <p className="text-muted-foreground mt-2 text-lg">Intelligent insights and analytics for your calendar events</p>
                </div>
              </div>
              <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 border-border hover:bg-muted rounded-lg px-6 py-2.5">
                    <Settings className="h-4 w-4" />
                    Customize Widgets
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Customize Dashboard</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {cards.map((card) => (
                      <div key={card.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${card.gradient} text-white`}>
                            {card.icon}
                          </div>
                          <Label htmlFor={card.id} className="font-medium text-card-foreground">
                            {card.title}
                          </Label>
                        </div>
                        <Switch
                          id={card.id}
                          checked={card.enabled}
                          onCheckedChange={() => toggleCard(card.id)}
                        />
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={enabledCards.map(card => card.id)}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {enabledCards.map((card) => (
                    <DashboardCard key={card.id} card={card}>
                      {renderCardContent(card)}
                    </DashboardCard>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
