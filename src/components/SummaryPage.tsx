import React, { useState } from 'react';
import { CalendarEvent, EventCategory } from './CalendarApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, addMonths } from 'date-fns';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
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
}

const defaultCards: DashboardCard[] = [
  {
    id: 'overview',
    title: 'Overview',
    icon: <div className="w-4 h-4 bg-blue-500 rounded-full" />,
  },
  {
    id: 'weekly',
    title: 'Weekly Events',
    icon: <div className="w-4 h-4 bg-green-500 rounded-full" />,
  },
  {
    id: 'categories',
    title: 'Categories',
    icon: <div className="w-4 h-4 bg-yellow-500 rounded-full" />,
  },
  {
    id: 'upcoming',
    title: 'Upcoming Events',
    icon: <div className="w-4 h-4 bg-purple-500 rounded-full" />,
  },
  {
    id: 'monthly',
    title: 'Monthly Trends',
    icon: <div className="w-4 h-4 bg-red-500 rounded-full" />,
  },
  {
    id: 'performance',
    title: 'Category Distribution',
    icon: <div className="w-4 h-4 bg-orange-500 rounded-full" />,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{thisWeekEvents}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>
        );

      case 'weekly':
        return <WeeklyBarChart events={events} />;

      case 'categories':
        return (
          <div className="space-y-2">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-sm">{stat.category}</span>
                </div>
                <span className="text-sm font-medium">{stat.count}</span>
              </div>
            ))}
          </div>
        );

      case 'upcoming':
        return (
          <div className="space-y-2">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onEventClick(event)}
              >
                <div className="font-medium text-sm truncate">{event.title}</div>
                <div className="text-xs text-muted-foreground">
                  {format(parseISO(event.start), 'MMM d, h:mm a')}
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="text-sm text-muted-foreground">No upcoming events</div>
            )}
          </div>
        );

      case 'monthly':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'performance':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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

  return (
    <div className="h-full overflow-auto">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards.map(card => card.id)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <DashboardCard key={card.id} card={card}>
                {renderCardContent(card)}
              </DashboardCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
