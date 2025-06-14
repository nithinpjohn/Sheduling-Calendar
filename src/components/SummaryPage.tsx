
import React, { useState } from 'react';
import { CalendarEvent, EventCategory } from './CalendarApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  GripVertical,
  CalendarDays,
  MapPin
} from 'lucide-react';

interface SummaryPageProps {
  events: CalendarEvent[];
  categories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
}

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ id, children, onDragStart, onDragOver, onDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', id);
    onDragStart(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(id);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsDragging(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    onDrop(draggedId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      className={`transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105' : ''
      } ${
        isDragOver ? 'border-primary border-2 bg-primary/5' : ''
      }`}
    >
      <Card className="cursor-move group hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            {children}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export const SummaryPage: React.FC<SummaryPageProps> = ({ events, categories, onEventClick }) => {
  const [cardOrder, setCardOrder] = useState([
    'overview',
    'monthlyChart',
    'categoryChart',
    'upcomingEvents',
    'categoryPerformance',
    'weeklyTrend'
  ]);

  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedCard(id);
  };

  const handleDragOver = (id: string) => {
    // Visual feedback handled in DraggableCard
  };

  const handleDrop = (targetId: string) => {
    if (!draggedCard || draggedCard === targetId) return;

    const newOrder = [...cardOrder];
    const draggedIndex = newOrder.indexOf(draggedCard);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCard);

    setCardOrder(newOrder);
    setDraggedCard(null);
  };

  // Calculate statistics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(event => new Date(event.start) > new Date());
  const todayEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.start);
    return eventDate.toDateString() === today.toDateString();
  });

  // Monthly data for charts
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const monthlyData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const eventsInMonth = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });

    return {
      month: format(month, 'MMM'),
      events: eventsInMonth.length,
    };
  });

  // Category performance data
  const categoryData = categories.map(category => {
    const categoryEvents = events.filter(event => event.category === category.id);
    return {
      name: category.name,
      events: categoryEvents.length,
      color: category.color,
    };
  });

  // Weekly trend data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
    return {
      day: format(date, 'EEE'),
      events: dayEvents.length,
    };
  });

  const getUpcomingEvents = () => {
    return events
      .filter(event => new Date(event.start) > new Date())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  };

  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'MMM d, h:mm a');
  };

  const renderCard = (cardId: string) => {
    switch (cardId) {
      case 'overview':
        return (
          <DraggableCard
            key={cardId}
            id={cardId}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CardTitle className="text-lg">Overview</CardTitle>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Total Events</span>
                  </div>
                  <p className="text-2xl font-bold">{totalEvents}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Upcoming</span>
                  </div>
                  <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Today</span>
                  </div>
                  <p className="text-2xl font-bold">{todayEvents.length}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Categories</span>
                  </div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </DraggableCard>
        );

      case 'monthlyChart':
        return (
          <DraggableCard
            key={cardId}
            id={cardId}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CardTitle className="text-lg">Events Per Month</CardTitle>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="events" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </DraggableCard>
        );

      case 'categoryChart':
        return (
          <DraggableCard
            key={cardId}
            id={cardId}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CardTitle className="text-lg">Category Distribution</CardTitle>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="events"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </DraggableCard>
        );

      case 'upcomingEvents':
        return (
          <DraggableCard
            key={cardId}
            id={cardId}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {getUpcomingEvents().map((event) => {
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
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" style={{ backgroundColor: `${category?.color}20`, color: category?.color }}>
                          {category?.name}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </DraggableCard>
        );

      case 'categoryPerformance':
        return (
          <DraggableCard
            key={cardId}
            id={cardId}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CardTitle className="text-lg">Category Performance</CardTitle>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="events" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </DraggableCard>
        );

      case 'weeklyTrend':
        return (
          <DraggableCard
            key={cardId}
            id={cardId}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CardTitle className="text-lg">Weekly Trend</CardTitle>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="events" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </DraggableCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Summary Dashboard</h1>
        <Badge variant="secondary" className="text-sm">
          Drag cards to reorder
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cardOrder.map(renderCard)}
      </div>
    </div>
  );
};
