
import React from 'react';
import { CalendarEvent, EventCategory } from './CalendarApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInHours } from 'date-fns';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface GanttViewProps {
  events: CalendarEvent[];
  categories: EventCategory[];
}

export const GanttView: React.FC<GanttViewProps> = ({ events, categories }) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filter events for current week
  const weekEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate >= weekStart && eventDate <= weekEnd;
  });

  // Group events by day
  const eventsByDay = weekDays.map(day => ({
    date: day,
    events: weekEvents.filter(event => isSameDay(new Date(event.start), day))
  }));

  const getEventDuration = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour
    return differenceInHours(end, start) || 1; // Minimum 1 hour
  };

  const getEventPosition = (event: CalendarEvent) => {
    const startTime = parseISO(event.start);
    const hours = startTime.getHours();
    const minutes = startTime.getMinutes();
    return (hours * 60 + minutes) / 60; // Convert to decimal hours
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getCategory = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  return (
    <div className="h-full bg-background">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gantt Chart - Week View
            <Badge variant="secondary" className="ml-2">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto h-[calc(100vh-12rem)]">
            <div className="min-w-[800px]">
              {/* Header with days */}
              <div className="sticky top-0 bg-card border-b z-10">
                <div className="grid grid-cols-8 gap-0">
                  <div className="p-3 border-r bg-muted font-medium text-sm">
                    Time
                  </div>
                  {weekDays.map((day, index) => (
                    <div key={index} className="p-3 border-r text-center">
                      <div className="font-medium">{format(day, 'EEE')}</div>
                      <div className="text-sm text-muted-foreground">{format(day, 'MMM d')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time slots and events */}
              <div className="relative">
                {timeSlots.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 gap-0 border-b border-border/50">
                    {/* Time column */}
                    <div className="p-2 border-r bg-muted/30 text-xs text-muted-foreground">
                      {formatTime(hour)}
                    </div>
                    
                    {/* Day columns */}
                    {eventsByDay.map((dayData, dayIndex) => (
                      <div key={dayIndex} className="relative border-r min-h-[60px] p-1">
                        {dayData.events
                          .filter(event => {
                            const eventHour = Math.floor(getEventPosition(event));
                            return eventHour === hour;
                          })
                          .map((event) => {
                            const category = getCategory(event.category);
                            const duration = getEventDuration(event);
                            const startMinutes = parseISO(event.start).getMinutes();
                            const topOffset = (startMinutes / 60) * 60; // Position within the hour
                            const height = Math.max(duration * 60, 40); // Minimum height

                            return (
                              <div
                                key={event.id}
                                className="absolute left-1 right-1 rounded-md p-2 text-xs shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                                style={{
                                  backgroundColor: category?.color,
                                  borderColor: category?.color,
                                  color: 'white',
                                  top: `${topOffset}px`,
                                  height: `${height}px`,
                                  zIndex: 1
                                }}
                              >
                                <div className="font-medium truncate mb-1">
                                  {event.title}
                                </div>
                                <div className="flex items-center gap-1 text-xs opacity-90">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {format(parseISO(event.start), 'HH:mm')}
                                    {event.end && ` - ${format(parseISO(event.end), 'HH:mm')}`}
                                  </span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1 text-xs opacity-90 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{event.location}</span>
                                  </div>
                                )}
                                {event.attendees && (
                                  <div className="flex items-center gap-1 text-xs opacity-90 mt-1">
                                    <Users className="h-3 w-3" />
                                    <span>{event.attendees}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
