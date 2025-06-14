
import React, { useState } from 'react';
import { CalendarEvent, EventCategory } from './CalendarApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  Target,
  Activity,
  Settings,
  GripVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isFuture, isToday, startOfWeek, endOfWeek } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SummaryPageProps {
  events: CalendarEvent[];
  categories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
}

interface DashboardCard {
  id: string;
  title: string;
  component: React.ReactNode;
  enabled: boolean;
}

const SortableCard: React.FC<{ card: DashboardCard; onToggle: (id: string) => void }> = ({ card, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!card.enabled) return null;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="relative group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">{card.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(card.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
            <div {...listeners} className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {card.component}
        </CardContent>
      </Card>
    </div>
  );
};

export const SummaryPage: React.FC<SummaryPageProps> = ({ events, categories, onEventClick }) => {
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize dashboard cards with their components
  const initializeDashboardCards = (): DashboardCard[] => {
    const today = new Date();
    const thisWeek = { start: startOfWeek(today), end: endOfWeek(today) };
    const thisMonth = { start: startOfMonth(today), end: endOfMonth(today) };
    
    const todayEvents = events.filter(event => isToday(parseISO(event.start)));
    const thisWeekEvents = events.filter(event => 
      isWithinInterval(parseISO(event.start), thisWeek)
    );
    const thisMonthEvents = events.filter(event => 
      isWithinInterval(parseISO(event.start), thisMonth)
    );
    const upcomingEvents = events.filter(event => isFuture(parseISO(event.start))).slice(0, 5);
    
    // Category performance data
    const categoryStats = categories.map(category => {
      const categoryEvents = events.filter(e => e.category === category.id);
      const totalAttendees = categoryEvents.reduce((sum, e) => sum + (e.attendees || 0), 0);
      const avgAttendees = categoryEvents.length > 0 ? Math.round(totalAttendees / categoryEvents.length) : 0;
      
      return {
        ...category,
        eventCount: categoryEvents.length,
        totalAttendees,
        avgAttendees,
        percentage: events.length > 0 ? Math.round((categoryEvents.length / events.length) * 100) : 0
      };
    });

    // Monthly trends data
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2025, i, 1);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthEvents = events.filter(event =>
        isWithinInterval(parseISO(event.start), { start: monthStart, end: monthEnd })
      );
      
      return {
        month: format(month, 'MMM'),
        count: monthEvents.length
      };
    });

    return [
      {
        id: 'events-overview',
        title: 'Events Overview',
        enabled: true,
        component: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{todayEvents.length}</div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{thisWeekEvents.length}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{thisMonthEvents.length}</div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {events.reduce((sum, e) => sum + (e.attendees || 0), 0) / events.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Attendees</div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Total Events</span>
                <span className="font-medium">{events.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Attendees</span>
                <span className="font-medium">{events.reduce((sum, e) => sum + (e.attendees || 0), 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Events with Location</span>
                <span className="font-medium">{events.filter(e => e.location).length}</span>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'upcoming-meetings',
        title: 'Upcoming Meetings',
        enabled: true,
        component: (
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming meetings</p>
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const category = categories.find(c => c.id === event.category);
                return (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => onEventClick(event)}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category?.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(event.start), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )
      },
      {
        id: 'monthly-trends',
        title: 'Monthly Trends',
        enabled: true,
        component: (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Events created per month (2025)
            </div>
            <div className="space-y-2">
              {monthlyData.map((month) => (
                <div key={month.month} className="flex items-center justify-between text-sm">
                  <span>{month.month}</span>
                  <span className="font-medium">{month.count}</span>
                </div>
              ))}
            </div>
          </div>
        )
      },
      {
        id: 'weekly-activity',
        title: 'Weekly Activity',
        enabled: true,
        component: (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Events by day of week
            </div>
            <div className="space-y-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                const dayEvents = events.filter(event => {
                  const eventDate = parseISO(event.start);
                  return eventDate.getDay() === (index + 1) % 7;
                });
                const percentage = events.length > 0 ? (dayEvents.length / events.length) * 100 : 0;
                
                return (
                  <div key={day} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{day.slice(0, 3)}</span>
                      <span className="font-medium">{dayEvents.length}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        )
      },
      {
        id: 'category-analytics',
        title: 'Category Analytics',
        enabled: true,
        component: (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PieChart className="h-4 w-4" />
              Performance by category
            </div>
            <div className="space-y-3">
              {categoryStats.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {category.eventCount} events ({category.percentage}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{category.totalAttendees} total attendees</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{category.avgAttendees} avg per event</span>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )
      },
      {
        id: 'productivity-insights',
        title: 'Productivity Insights',
        enabled: true,
        component: (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Productivity metrics
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{thisWeekEvents.length}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {thisWeekEvents.length > 0 ? '+' : ''}0%
                </div>
                <div className="text-sm text-muted-foreground">vs Last Week</div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Meeting Load</span>
                <Badge variant={thisWeekEvents.length > 10 ? "destructive" : "secondary"}>
                  {thisWeekEvents.length > 10 ? "High" : "Normal"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Focus Time</span>
                <Badge variant="secondary">Good</Badge>
              </div>
            </div>
          </div>
        )
      }
    ];
  };

  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>(initializeDashboardCards());

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setDashboardCards((cards) => {
        const oldIndex = cards.findIndex((card) => card.id === active.id);
        const newIndex = cards.findIndex((card) => card.id === over?.id);

        return arrayMove(cards, oldIndex, newIndex);
      });
    }
  };

  const toggleCardVisibility = (cardId: string) => {
    setDashboardCards(cards =>
      cards.map(card =>
        card.id === cardId ? { ...card, enabled: !card.enabled } : card
      )
    );
  };

  const enabledCards = dashboardCards.filter(card => card.enabled);

  return (
    <div className="h-full bg-background">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Dashboard</h1>
          <p className="text-muted-foreground">Intelligent insights and analytics for your calendar events</p>
        </div>
        <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Customize Widgets
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Customize Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {dashboardCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between">
                  <Label htmlFor={`card-${card.id}`} className="font-normal">
                    {card.title}
                  </Label>
                  <Switch
                    id={`card-${card.id}`}
                    checked={card.enabled}
                    onCheckedChange={() => toggleCardVisibility(card.id)}
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
        <SortableContext
          items={enabledCards.map(card => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enabledCards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                onToggle={toggleCardVisibility}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
