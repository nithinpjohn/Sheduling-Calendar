
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarSidebar } from './CalendarSidebar';
import { EventModal } from './EventModal';
import { CommandSearch } from './CommandSearch';
import { SummaryPage } from './SummaryPage';
import { GanttView } from './GanttView';
import { WeeklyBarChart } from './WeeklyBarChart';
import { MailInbox } from './MailInbox';
import { TopMenuBar } from './TopMenuBar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  category: string;
  attendees?: number;
  videoConference?: {
    platform: 'zoom' | 'teams' | 'meet';
    url: string;
    meetingId?: string;
  };
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export interface SuggestedEvent {
  id: string;
  title: string;
  description?: string;
  duration: number;
  category: string;
  defaultAttendees?: string;
  priority?: 'low' | 'medium' | 'high';
}

const defaultCategories: EventCategory[] = [
  { id: '1', name: 'Work', color: '#3B82F6', isDefault: true },
  { id: '2', name: 'Personal', color: '#10B981', isDefault: true },
  { id: '3', name: 'Health', color: '#F59E0B', isDefault: true },
  { id: '4', name: 'Social', color: '#EF4444', isDefault: true },
];

const suggestedEvents: SuggestedEvent[] = [
  {
    id: 'suggested-1',
    title: 'Daily Standup',
    description: 'Quick team sync to discuss progress and blockers',
    duration: 0.5,
    category: '1',
    defaultAttendees: '6',
    priority: 'high'
  },
  {
    id: 'suggested-2',
    title: 'Code Review Session',
    description: 'Review recent pull requests and discuss improvements',
    duration: 1,
    category: '1',
    defaultAttendees: '3',
    priority: 'medium'
  },
  {
    id: 'suggested-3',
    title: 'Team Building Activity',
    description: 'Monthly team building and bonding session',
    duration: 2,
    category: '4',
    defaultAttendees: '12',
    priority: 'low'
  },
  {
    id: 'suggested-4',
    title: 'Workout Session',
    description: 'Daily exercise routine to stay healthy',
    duration: 1,
    category: '3',
    priority: 'medium'
  },
  {
    id: 'suggested-5',
    title: 'Client Consultation',
    description: 'Meet with potential clients to discuss requirements',
    duration: 1.5,
    category: '1',
    defaultAttendees: '2',
    priority: 'high'
  }
];

export const CalendarApp: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>(defaultCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'calendar' | 'summary' | 'gantt' | 'analytics' | 'inbox'>('calendar');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  const filteredEvents = useMemo(() => {
    return events.filter(event => selectedCategories.length === 0 || selectedCategories.includes(event.category));
  }, [events, selectedCategories]);

  const handleEventClick = (clickInfo: any) => {
    const eventData = events.find(e => e.id === clickInfo.event.id);
    if (eventData) {
      setSelectedEvent(eventData);
      setIsModalOpen(true);
    }
  };

  const handleDateClick = (selectInfo: any) => {
    setSelectedDate(selectInfo.dateStr);
    setSelectedEndDate(null);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedDate(new Date().toISOString());
    setSelectedEndDate(null);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: selectedEvent?.id || Date.now().toString(),
    };

    if (selectedEvent) {
      // Update existing event
      setEvents(events.map(e => (e.id === selectedEvent.id ? newEvent : e)));
      toast({
        title: "Event Updated",
        description: `${newEvent.title} has been updated successfully.`,
      });
    } else {
      // Create new event
      setEvents([...events, newEvent]);
      toast({
        title: "Event Created",
        description: `${newEvent.title} has been added to your calendar.`,
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    setIsModalOpen(false);
    toast({
      title: "Event Deleted",
      description: "The event has been removed from your calendar.",
    });
  };

  const handleEventDrop = (info: any) => {
    const eventToUpdate = events.find(e => e.id === info.event.id);
    if (eventToUpdate) {
      const updatedEvent = {
        ...eventToUpdate,
        start: info.event.startStr,
        end: info.event.endStr,
      };
      setEvents(events.map(e => (e.id === info.event.id ? updatedEvent : e)));
      toast({
        title: "Event Moved",
        description: `${info.event.title} has been moved to ${new Date(info.event.startStr).toLocaleDateString()}.`,
      });
    }
  };

  const handleEventResize = (info: any) => {
    const eventToUpdate = events.find(e => e.id === info.event.id);
    if (eventToUpdate) {
      const updatedEvent = {
        ...eventToUpdate,
        start: info.event.startStr,
        end: info.event.endStr,
      };
      setEvents(events.map(e => (e.id === info.event.id ? updatedEvent : e)));
      toast({
        title: "Event Resized",
        description: `${info.event.title} has been resized.`,
      });
    }
  };

  const handleDrop = useCallback((info: any) => {
    console.log('Drop event received:', info);
    
    // Check if this is a suggested event being dropped
    const draggedData = info.draggedEl?.getAttribute('data-suggested-event');
    if (draggedData) {
      try {
        const parsedData = JSON.parse(draggedData);
        if (parsedData.type === 'suggested-event') {
          const suggestedEvent = parsedData.data as SuggestedEvent;
          const dropDate = info.date;
          
          console.log('Creating event from suggested event:', suggestedEvent);
          
          // Create a new event from the suggested event
          const newEvent: CalendarEvent = {
            id: Date.now().toString(),
            title: suggestedEvent.title,
            description: suggestedEvent.description,
            start: dropDate.toISOString(),
            end: new Date(dropDate.getTime() + (suggestedEvent.duration * 60 * 60 * 1000)).toISOString(),
            category: suggestedEvent.category,
            attendees: suggestedEvent.defaultAttendees ? parseInt(suggestedEvent.defaultAttendees) : undefined,
            allDay: false,
          };
          
          setEvents(prev => [...prev, newEvent]);
          
          toast({
            title: "Event Created",
            description: `${suggestedEvent.title} has been added to your calendar.`,
          });
          
          return;
        }
      } catch (error) {
        console.error('Error parsing drag data:', error);
      }
    }
    
    // Handle regular event drops (existing functionality)
    const eventTitle = info.draggedEl.title;
    const eventCategory = info.draggedEl.dataset.category;
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      start: info.dateStr,
      allDay: !info.hasTime,
      category: eventCategory || '1',
    };
    setEvents([...events, newEvent]);
    toast({
      title: "Event Created",
      description: `${eventTitle} has been added to your calendar.`,
    });
  }, [toast]);

  const handleSuggestedEventDrop = useCallback((suggestedEvent: SuggestedEvent, date: Date) => {
    console.log('Handling suggested event drop:', suggestedEvent, date);
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: suggestedEvent.title,
      description: suggestedEvent.description,
      start: date.toISOString(),
      end: new Date(date.getTime() + (suggestedEvent.duration * 60 * 60 * 1000)).toISOString(),
      category: suggestedEvent.category,
      attendees: suggestedEvent.defaultAttendees ? parseInt(suggestedEvent.defaultAttendees) : undefined,
      allDay: false,
    };
    
    setEvents(prev => [...prev, newEvent]);
    
    toast({
      title: "Event Created",
      description: `${suggestedEvent.title} has been added to your calendar.`,
    });
  }, [toast]);

  useEffect(() => {
    // Load events from local storage on component mount
    const storedEvents = localStorage.getItem('calendar-events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }

    // Load categories from local storage
    const storedCategories = localStorage.getItem('calendar-categories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
  }, []);

  useEffect(() => {
    // Save events to local storage whenever events change
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    // Save categories to local storage whenever categories change
    localStorage.setItem('calendar-categories', JSON.stringify(categories));
  }, [categories]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <TopMenuBar
        onSearch={() => setIsCommandSearchOpen(true)}
        isLoggedIn={false}
        onLogout={() => {}}
        onProfileClick={() => {}}
        onSettingsClick={() => {}}
        onLogin={() => {}}
        currentPage={currentView === 'inbox' ? 'mails' : currentView === 'calendar' ? 'calendar' : 'dashboard'}
        onPageChange={(page) => {
          if (page === 'mails') setCurrentView('inbox');
          else if (page === 'calendar') setCurrentView('calendar');
          else setCurrentView('summary');
        }}
        isSidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex overflow-hidden">
        {currentView === 'calendar' && !sidebarCollapsed && (
          <CalendarSidebar
            events={events}
            categories={categories}
            setCategories={setCategories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            onEventClick={(event) => {
              setSelectedEvent(event);
              setIsModalOpen(true);
            }}
            onOpenCommandSearch={() => setIsCommandSearchOpen(true)}
            onCreateNew={handleCreateNew}
            suggestedEvents={suggestedEvents}
            onSuggestedEventDrop={handleSuggestedEventDrop}
            isCollapsed={sidebarCollapsed}
          />
        )}

        <div className="flex-1 overflow-hidden">
          {currentView === 'calendar' && (
            <Card className="h-full rounded-none border-0">
              <CardContent className="p-0 h-full">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  events={filteredEvents}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  editable={true}
                  droppable={true}
                  drop={handleDrop}
                  eventDrop={handleEventDrop}
                  eventResize={handleEventResize}
                  height="100%"
                  eventContent={(eventInfo) => (
                    <div className="p-1">
                      <div className="font-medium text-xs truncate">
                        {eventInfo.event.title}
                      </div>
                      {eventInfo.event.extendedProps.location && (
                        <div className="text-xs opacity-75 truncate">
                          📍 {eventInfo.event.extendedProps.location}
                        </div>
                      )}
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {currentView === 'summary' && (
            <SummaryPage
              events={events}
              categories={categories}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              onCreateNew={handleCreateNew}
              onOpenCommandSearch={() => setIsCommandSearchOpen(true)}
              suggestedEvents={suggestedEvents}
              onSuggestedEventDrop={handleSuggestedEventDrop}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              setCategories={setCategories}
            />
          )}

          {currentView === 'gantt' && (
            <GanttView 
              events={events} 
              categories={categories}
              currentView="gantt"
              onViewChange={(view) => {
                if (view === 'dayGridMonth' || view === 'timeGridWeek' || view === 'timeGridDay') {
                  setCurrentView('calendar');
                }
              }}
            />
          )}

          {currentView === 'analytics' && (
            <div className="p-6 h-full overflow-y-auto">
              <h1 className="text-2xl font-bold mb-6">Analytics</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
                    <WeeklyBarChart events={events} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentView === 'inbox' && <MailInbox />}
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        isCreating={!selectedEvent}
        selectedDate={selectedDate || new Date().toISOString()}
        selectedEndDate={selectedEndDate}
        categories={categories}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      <CommandSearch
        isOpen={isCommandSearchOpen}
        onClose={() => setIsCommandSearchOpen(false)}
        events={events}
        categories={categories}
        onEventSelect={(event) => {
          setSelectedEvent(event);
          setIsModalOpen(true);
        }}
        onCreateNew={handleCreateNew}
        onProfileClick={() => {}}
        onSettingsClick={() => {}}
      />

      <Toaster />
    </div>
  );
};
