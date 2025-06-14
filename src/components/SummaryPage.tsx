
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarEvent, EventCategory, SuggestedEvent } from './CalendarApp';
import { WeeklyBarChart } from './WeeklyBarChart';
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, addDays, isSameDay, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, Clock, Users, MapPin, Plus, Search, TrendingUp, Activity, Target, Zap, GripVertical } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell } from 'recharts';

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
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{thisWeekEvents.length}</div>
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
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{thisWeekEvents.length}</div>
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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, suggestedEvent: SuggestedEvent) => {
    console.log('Starting drag for:', suggestedEvent.title);
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.dropEffect = 'copy';
    
    const dragData = {
      type: 'suggested-event',
      data: suggestedEvent
    };
    
    const dataString = JSON.stringify(dragData);
    e.dataTransfer.setData('application/json', dataString);
    e.dataTransfer.setData('text/plain', dataString);
    
    // Add visual feedback
    const target = e.currentTarget;
    target.style.opacity = '0.6';
    target.style.transform = 'scale(0.95)';
    target.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    console.log('Ending drag');
    const target = e.currentTarget;
    target.style.opacity = '1';
    target.style.transform = 'scale(1)';
    target.classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <div className="max-w-7xl mx-auto h-full">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    AI Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Intelligent insights and smart suggestions for your calendar
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={onOpenCommandSearch}
                    variant="outline" 
                    className="gap-2 rounded-lg"
                  >
                    <Search className="h-4 w-4" />
                    Quick Search
                  </Button>
                  <Button 
                    onClick={onCreateNew}
                    className="gap-2 rounded-lg"
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
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{thisWeekEvents.length}</p>
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
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Suggestions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{suggestedEvents.length}</p>
                      </div>
                      <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-320px)]">
              {/* AI Suggested Events */}
              <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    AI Suggested Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[400px] overflow-hidden">
                  <ScrollArea className="h-full px-6">
                    <div className="space-y-3 pb-6">
                      {suggestedEvents.map((suggestedEvent) => {
                        const category = categories.find(c => c.id === suggestedEvent.category);
                        return (
                          <div
                            key={suggestedEvent.id}
                            className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 hover:scale-[1.02] bg-gray-50 dark:bg-gray-800 select-none"
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, suggestedEvent)}
                            onDragEnd={handleDragEnd}
                            style={{
                              borderLeftColor: category?.color,
                              borderLeftWidth: '4px'
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                  {suggestedEvent.title}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                  {suggestedEvent.description}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                  <Badge variant="secondary" className="text-xs rounded-md">
                                    {suggestedEvent.duration}h
                                  </Badge>
                                  {suggestedEvent.defaultAttendees && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                      <Users className="h-3 w-3" />
                                      {suggestedEvent.defaultAttendees}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Weekly Analytics */}
              <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Weekly Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WeeklyBarChart events={events} />
                </CardContent>
              </Card>

              {/* Recent Events */}
              <Card className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Calendar className="h-5 w-5 text-green-500" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[400px] overflow-hidden">
                  <ScrollArea className="h-full px-6">
                    <div className="space-y-3 pb-6">
                      {upcomingEvents.slice(0, 8).map((event) => {
                        const category = categories.find(c => c.id === event.category);
                        return (
                          <div
                            key={event.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800"
                            onClick={() => onEventClick(event)}
                            style={{
                              borderLeftColor: category?.color,
                              borderLeftWidth: '4px'
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                  {event.title}
                                </h4>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {format(parseISO(event.start), 'MMM d, h:mm a')}
                                  </div>
                                  {event.attendees && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {event.attendees}
                                    </div>
                                  )}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{event.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
