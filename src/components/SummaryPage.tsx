
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
import { GripVertical, Settings, Users, TrendingUp, Calendar, Clock, MapPin } from 'lucide-react';
import { WeeklyBarChart } from './WeeklyBarChart';

interface SummaryPageProps {
  events: CalendarEvent[];
  categories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
}

interface DashboardCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const defaultCards: DashboardCard[] = [
  {
    id: 'overview',
    title: 'Events Overview',
    icon: <div className="w-4 h-4 bg-blue-500 rounded-full" />,
    enabled: true,
  },
  {
    id: 'weekly',
    title: 'Weekly Activity',
    icon: <div className="w-4 h-4 bg-green-500 rounded-full" />,
    enabled: true,
  },
  {
    id: 'upcoming',
    title: 'Upcoming Meetings',
    icon: <div className="w-4 h-4 bg-purple-500 rounded-full" />,
    enabled: true,
  },
  {
    id: 'monthly',
    title: 'Monthly Trends',
    icon: <div className="w-4 h-4 bg-red-500 rounded-full" />,
    enabled: true,
  },
  {
    id: 'categories',
    title: 'Category Analytics',
    icon: <div className="w-4 h-4 bg-yellow-500 rounded-full" />,
    enabled: true,
  },
  {
    id: 'productivity',
    title: 'Productivity Insights',
    icon: <div className="w-4 h-4 bg-orange-500 rounded-full" />,
    enabled: true,
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
    <Card ref={setNodeRef} style={style} className="h-full">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          {card.icon}
          <CardTitle className="text-md font-medium">{card.title}</CardTitle>
        </div>
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">{children}</CardContent>
    </Card>
  );
};

export const SummaryPage: React.FC<SummaryPageProps> = ({ events, categories, onEventClick }) => {
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

  // Category statistics
  const categoryStats = categories.map(category => {
    const count = events.filter(event => event.category === category.id).length;
    return {
      category: category.name,
      count,
      color: category.color,
    };
  }).sort((a, b) => b.count - a.count);

  // Upcoming events
  const upcomingEvents = [...events]
    .filter(event => new Date(event.start) >= today)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Monthly data
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
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{events.filter(e => {
                  const eventDate = new Date(e.start);
                  const today = new Date();
                  return eventDate.toDateString() === today.toDateString();
                }).length}</div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{thisWeekEvents}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{upcomingEvents.length}</div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(events.reduce((acc, e) => acc + (e.attendees || 0), 0) / events.length) || 0}</div>
                <div className="text-sm text-muted-foreground">Avg Attendees</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Total Events</span>
                </div>
                <span className="font-medium">{events.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Total Attendees</span>
                </div>
                <span className="font-medium">{events.reduce((acc, e) => acc + (e.attendees || 0), 0)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Events with Location</span>
                </div>
                <span className="font-medium">{events.filter(e => e.location).length}</span>
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
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📅</div>
                <div className="text-muted-foreground">No upcoming meetings</div>
              </div>
            ) : (
              upcomingEvents.slice(0, 5).map((event) => {
                const category = categories.find(c => c.id === event.category);
                return (
                  <div key={event.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => onEventClick(event)}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category?.color }} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{event.title}</div>
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
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={2} />
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
                      fill="#8884d8"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {categoryStats.slice(0, 3).map((stat) => (
                  <div key={stat.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                      <span>{stat.category}</span>
                    </div>
                    <span className="font-medium">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'productivity':
        return (
          <div className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{thisWeekEvents}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">+15%</div>
                <div className="text-sm text-muted-foreground">vs Last Week</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline mr-1" />
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
    <div className="h-full overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">AI Dashboard</h1>
            <p className="text-muted-foreground">Intelligent insights and analytics for your calendar events</p>
          </div>
          <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Customize Widgets
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Customize Dashboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {cards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {card.icon}
                      <Label htmlFor={card.id} className="text-sm font-medium">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
};
