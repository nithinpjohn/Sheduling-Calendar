import React, { useState } from 'react';
import { CalendarEvent, EventCategory } from './CalendarApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, Users, TrendingUp } from 'lucide-react';
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
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">0</div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">0</div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">9</div>
                <div className="text-sm text-muted-foreground">Avg Attendees</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Events</span>
                <span className="font-medium">{events.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Attendees</span>
                <span className="font-medium">26</span>
              </div>
              <div className="flex justify-between">
                <span>Events with Location</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </div>
        );

      case 'weekly':
        return <WeeklyBarChart events={events} />;

      case 'upcoming':
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📅</div>
            <div className="text-muted-foreground">No upcoming meetings</div>
          </div>
        );

      case 'monthly':
        return (
          <div className="space-y-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
              <div key={month} className="flex justify-between text-sm">
                <span>{month}</span>
                <span>0</span>
              </div>
            ))}
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Meeting</span>
              <span className="text-muted-foreground ml-auto">1 events (33%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>8 total attendees</span>
              <span>📊 8 avg per event</span>
            </div>
          </div>
        );

      case 'productivity':
        return (
          <div className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-blue-600">0</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0%</div>
                <div className="text-sm text-muted-foreground">vs Last Week</div>
              </div>
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
          <Button
            variant="outline"
            onClick={() => setShowCustomize(!showCustomize)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Customize Widgets
          </Button>
        </div>

        {showCustomize && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Customize Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {cards.map((card) => (
                  <div key={card.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={card.enabled}
                      onChange={() => toggleCard(card.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{card.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
