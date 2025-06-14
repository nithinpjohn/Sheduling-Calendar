
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarSidebar } from './CalendarSidebar';
import { EventModal } from './EventModal';
import { CommandSearch } from './CommandSearch';
import { SummaryPage } from './SummaryPage';
import { GanttView } from './GanttView';
import { TopMenuBar } from './TopMenuBar';
import { LoginModal } from './LoginModal';
import { ProfilePage } from './ProfilePage';
import { SettingsPage } from './SettingsPage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CalendarIcon, BarChart3 } from 'lucide-react';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  description?: string;
  location?: string;
  attendees?: number;
  category: string;
  backgroundColor?: string;
  borderColor?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export interface SuggestedEvent {
  id: string;
  title: string;
  description: string;
  duration: number; // in hours
  category: string;
  defaultAttendees?: number;
  type: 'ai-suggested';
}

const defaultCategories: EventCategory[] = [
  { id: '1', name: 'Meeting', color: '#3B82F6', isDefault: true },
  { id: '2', name: 'Appointment', color: '#10B981', isDefault: true },
  { id: '3', name: 'Workshop', color: '#F59E0B', isDefault: true },
  { id: '4', name: 'Conference', color: '#EF4444', isDefault: true },
  { id: '5', name: 'Personal', color: '#8B5CF6', isDefault: true },
];

const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    start: '2024-06-15T10:00:00',
    end: '2024-06-15T11:00:00',
    description: 'Weekly team sync meeting',
    location: 'Conference Room A',
    attendees: 8,
    category: '1'
  },
  {
    id: '2',
    title: 'Client Presentation',
    start: '2024-06-16T14:00:00',
    end: '2024-06-16T15:30:00',
    description: 'Quarterly presentation to client',
    location: 'Main Conference Room',
    attendees: 12,
    category: '4'
  },
  {
    id: '3',
    title: 'Doctor Appointment',
    start: '2024-06-17T09:00:00',
    end: '2024-06-17T10:00:00',
    description: 'Annual checkup',
    location: 'Medical Center',
    attendees: 2,
    category: '2'
  },
  {
    id: '4',
    title: 'React Workshop',
    start: '2024-06-18T13:00:00',
    end: '2024-06-18T17:00:00',
    description: 'Advanced React patterns workshop',
    location: 'Training Room B',
    attendees: 15,
    category: '3'
  },
  {
    id: '5',
    title: 'Vacation Day',
    start: '2024-06-19T00:00:00',
    end: '2024-06-19T23:59:59',
    description: 'Personal time off',
    location: 'Home',
    attendees: 1,
    category: '5'
  },
  {
    id: '6',
    title: 'Project Planning',
    start: '2024-06-20T15:00:00',
    end: '2024-06-20T16:30:00',
    description: 'Q3 project planning session',
    location: 'Planning Room',
    attendees: 6,
    category: '1'
  }
];

const suggestedEvents: SuggestedEvent[] = [
  {
    id: 'suggested-1',
    title: 'Daily Standup',
    description: 'Quick team sync to discuss progress and blockers',
    duration: 0.5,
    category: '1',
    defaultAttendees: 6,
    type: 'ai-suggested'
  },
  {
    id: 'suggested-2',
    title: 'Code Review Session',
    description: 'Review recent pull requests and discuss best practices',
    duration: 1,
    category: '1',
    defaultAttendees: 4,
    type: 'ai-suggested'
  },
  {
    id: 'suggested-3',
    title: 'Client Check-in',
    description: 'Regular client update and feedback session',
    duration: 1.5,
    category: '2',
    defaultAttendees: 3,
    type: 'ai-suggested'
  },
  {
    id: 'suggested-4',
    title: 'Team Building Activity',
    description: 'Monthly team building and social event',
    duration: 2,
    category: '5',
    defaultAttendees: 12,
    type: 'ai-suggested'
  },
  {
    id: 'suggested-5',
    title: 'Training Session',
    description: 'Skills development and learning workshop',
    duration: 3,
    category: '3',
    defaultAttendees: 8,
    type: 'ai-suggested'
  }
];

export const CalendarApp: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);
  const [categories, setCategories] = useState<EventCategory[]>(defaultCategories);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'calendar' | 'profile' | 'settings'>('dashboard');
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    const savedCategories = localStorage.getItem('calendar-categories');
    
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      if (parsedEvents.length === 0) {
        setEvents(sampleEvents);
      } else {
        setEvents(parsedEvents);
      }
    } else {
      setEvents(sampleEvents);
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('calendar-categories', JSON.stringify(categories));
  }, [categories]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '';
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category);
    return matchesSearch && matchesCategory;
  });

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setIsCreating(true);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    const event = events.find(e => e.id === arg.event.id);
    if (event) {
      setSelectedEvent(event);
      setIsCreating(false);
      setIsModalOpen(true);
    }
  };

  const handleEventDrop = (arg: any) => {
    const updatedEvents = events.map(event => {
      if (event.id === arg.event.id) {
        return {
          ...event,
          start: arg.event.start.toISOString(),
          end: arg.event.end ? arg.event.end.toISOString() : undefined,
        };
      }
      return event;
    });
    setEvents(updatedEvents);
    toast({
      title: "Event Moved",
      description: `"${arg.event.title}" has been rescheduled successfully.`,
    });
  };

  const handleEventResize = (arg: any) => {
    const updatedEvents = events.map(event => {
      if (event.id === arg.event.id) {
        return {
          ...event,
          start: arg.event.start.toISOString(),
          end: arg.event.end ? arg.event.end.toISOString() : undefined,
        };
      }
      return event;
    });
    setEvents(updatedEvents);
    toast({
      title: "Event Resized",
      description: `"${arg.event.title}" duration has been updated.`,
    });
  };

  const saveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const category = categories.find(c => c.id === eventData.category);
    const newEvent: CalendarEvent = {
      ...eventData,
      id: isCreating ? Date.now().toString() : selectedEvent!.id,
      backgroundColor: category?.color,
      borderColor: category?.color,
    };

    if (isCreating) {
      setEvents([...events, newEvent]);
      toast({
        title: "Event Created",
        description: `"${newEvent.title}" has been added to your calendar.`,
      });
    } else {
      setEvents(events.map(e => e.id === newEvent.id ? newEvent : e));
      toast({
        title: "Event Updated",
        description: `"${newEvent.title}" has been updated successfully.`,
      });
    }

    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const deleteEvent = (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    setEvents(events.filter(e => e.id !== eventId));
    setIsModalOpen(false);
    setSelectedEvent(null);
    
    if (eventToDelete) {
      toast({
        title: "Event Deleted",
        description: `"${eventToDelete.title}" has been removed from your calendar.`,
      });
    }
  };

  const createNewEvent = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setIsCreating(true);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const openCommandSearch = () => {
    setIsCommandOpen(true);
  };

  const calendarEvents = filteredEvents.map(event => ({
    ...event,
    backgroundColor: categories.find(c => c.id === event.category)?.color,
    borderColor: categories.find(c => c.id === event.category)?.color,
  }));

  const handleProtectedAction = (action: () => void) => {
    if (!isLoggedIn) {
      setShowLogin(true);
    } else {
      action();
    }
  };

  const handleLogin = (email: string, password: string) => {
    // Simulate login
    setIsLoggedIn(true);
    setShowLogin(false);
    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const renderCalendarView = () => {
    if (currentView === 'gantt') {
      return <GanttView events={calendarEvents} categories={categories} />;
    }

    return (
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={currentView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        events={calendarEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        editable={true}
        droppable={true}
        selectable={true}
        selectMirror={true}
        height="100%"
        eventDisplay="block"
        dayMaxEvents={true}
        weekends={true}
        views={{
          dayGridMonth: {
            dayMaxEventRows: 3
          }
        }}
      />
    );
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'calendar':
        return (
          <div className="h-full flex flex-col">
            <div className="border-b bg-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Calendar View</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={currentView === 'dayGridMonth' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentView('dayGridMonth')}
                  >
                    Month
                  </Button>
                  <Button
                    variant={currentView === 'timeGridWeek' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentView('timeGridWeek')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={currentView === 'timeGridDay' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentView('timeGridDay')}
                  >
                    Day
                  </Button>
                  <Button
                    variant={currentView === 'gantt' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentView('gantt')}
                  >
                    Gantt
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6">
              {renderCalendarView()}
            </div>
          </div>
        );
      default:
        return (
          <SummaryPage 
            events={events}
            categories={categories}
            onEventClick={(event) => {
              handleProtectedAction(() => {
                setSelectedEvent(event);
                setIsCreating(false);
                setIsModalOpen(true);
              });
            }}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopMenuBar 
        onSearch={() => setIsCommandOpen(true)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onProfileClick={() => handleProtectedAction(() => setCurrentPage('profile'))}
        onSettingsClick={() => handleProtectedAction(() => setCurrentPage('settings'))}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <CalendarSidebar
          events={events}
          categories={categories}
          setCategories={setCategories}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          onEventClick={(event) => {
            handleProtectedAction(() => {
              setSelectedEvent(event);
              setIsCreating(false);
              setIsModalOpen(true);
            });
          }}
          onOpenCommandSearch={() => setIsCommandOpen(true)}
          onCreateNew={() => handleProtectedAction(() => {
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setIsCreating(true);
            setSelectedEvent(null);
            setIsModalOpen(true);
          })}
          suggestedEvents={suggestedEvents}
        />
        
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant={currentPage === 'dashboard' ? "default" : "outline"}
                  onClick={() => setCurrentPage('dashboard')}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  AI Dashboard
                </Button>
                <Button
                  variant={currentPage === 'calendar' ? "default" : "outline"}
                  onClick={() => setCurrentPage('calendar')}
                  className="gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Calendar
                </Button>
              </div>
              
              {!isLoggedIn && (
                <Button onClick={() => setShowLogin(true)} className="gap-2">
                  Login
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {renderCurrentPage()}
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        isCreating={isCreating}
        selectedDate={selectedDate}
        categories={categories}
        onSave={saveEvent}
        onDelete={deleteEvent}
      />

      <CommandSearch
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        events={events}
        categories={categories}
        onEventSelect={(event) => {
          setSelectedEvent(event);
          setIsCreating(false);
          setIsModalOpen(true);
          setIsCommandOpen(false);
        }}
        onCreateNew={() => handleProtectedAction(() => {
          setSelectedDate(new Date().toISOString().split('T')[0]);
          setIsCreating(true);
          setSelectedEvent(null);
          setIsModalOpen(true);
          setIsCommandOpen(false);
        })}
      />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};
