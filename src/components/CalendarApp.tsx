import React, { useState, useEffect, useRef } from 'react';
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
import { CalendarIcon, BarChart3, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

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
  videoConference?: {
    platform: string;
    link: string;
    autoGenerate: boolean;
  };
  attendeeList?: Array<{
    email: string;
    status: 'pending' | 'accepted' | 'declined';
    name?: string;
  }>;
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
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'calendar' | 'profile' | 'settings'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [containerWidth, setContainerWidth] = useState([90]);
  const { toast } = useToast();
  const calendarRef = useRef<FullCalendar>(null);

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
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    setSelectedDate(arg.dateStr);
    setSelectedEndDate(arg.dateStr);
    setIsCreating(true);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleDateSelect = (arg: any) => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    setSelectedDate(arg.startStr);
    setSelectedEndDate(arg.endStr);
    setIsCreating(true);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
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
    setSelectedEndDate(new Date().toISOString().split('T')[0]);
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

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  const handleSuggestedEventDrop = (eventData: SuggestedEvent, date: Date) => {
    const endTime = new Date(date.getTime() + eventData.duration * 60 * 60 * 1000);
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventData.title,
      start: date.toISOString(),
      end: endTime.toISOString(),
      description: eventData.description,
      category: eventData.category,
      attendees: eventData.defaultAttendees,
      backgroundColor: categories.find(c => c.id === eventData.category)?.color,
      borderColor: categories.find(c => c.id === eventData.category)?.color,
    };
    setEvents([...events, newEvent]);
    toast({
      title: "Event Created",
      description: `"${newEvent.title}" has been added to your calendar.`,
    });
  };

  const renderCalendarView = () => {
    if (currentView === 'gantt') {
      return <GanttView events={calendarEvents} categories={categories} />;
    }

    return (
      <div className="h-full overflow-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentView === 'dayGridMonth' && 'Month Overview'}
                  {currentView === 'timeGridWeek' && 'Weekly Schedule'}
                  {currentView === 'timeGridDay' && 'Daily Agenda'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your schedule with ease
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={currentView === 'dayGridMonth' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('dayGridMonth')}
                  className="rounded-lg"
                >
                  Month
                </Button>
                <Button
                  variant={currentView === 'timeGridWeek' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('timeGridWeek')}
                  className="rounded-lg"
                >
                  Week
                </Button>
                <Button
                  variant={currentView === 'timeGridDay' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('timeGridDay')}
                  className="rounded-lg"
                >
                  Day
                </Button>
                <Button
                  variant={currentView === 'gantt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('gantt')}
                  className="rounded-lg"
                >
                  Gantt
                </Button>
              </div>
            </div>
          </div>
          <div className="p-8">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={currentView}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              events={calendarEvents}
              dateClick={handleDateClick}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              editable={true}
              droppable={true}
              selectable={true}
              selectMirror={true}
              height="600px"
              eventDisplay="block"
              dayMaxEvents={true}
              weekends={true}
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              slotDuration="01:00:00"
              slotLabelInterval="01:00:00"
              nowIndicator={true}
              eventResizableFromStart={true}
              eventStartEditable={true}
              eventDurationEditable={true}
              allDaySlot={false}
              views={{
                dayGridMonth: {
                  dayMaxEventRows: 3
                },
                timeGridWeek: {
                  slotLabelFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  },
                  allDaySlot: false
                },
                timeGridDay: {
                  slotLabelFormat: {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  },
                  allDaySlot: false
                }
              }}
              drop={(info) => {
                try {
                  const draggedData = info.draggedEl.getAttribute('data-suggested-event');
                  if (draggedData) {
                    const parsed = JSON.parse(draggedData);
                    if (parsed.type === 'suggested-event' && parsed.data) {
                      handleSuggestedEventDrop(parsed.data, info.date);
                    }
                  }
                } catch (error) {
                  console.error('Error processing dropped event:', error);
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'profile':
        return (
          <div className="h-full overflow-y-auto">
            <ProfilePage />
          </div>
        );
      case 'settings':
        return (
          <div className="h-full overflow-y-auto">
            <SettingsPage />
          </div>
        );
      case 'calendar':
        return (
          <div className="h-full overflow-auto">
            {renderCalendarView()}
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
            onCreateNew={() => handleProtectedAction(() => createNewEvent())}
            onOpenCommandSearch={() => setIsCommandOpen(true)}
            suggestedEvents={suggestedEvents}
            onSuggestedEventDrop={handleSuggestedEventDrop}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            setCategories={setCategories}
          />
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-gray-950 w-full">
        <TopMenuBar 
          onSearch={() => setIsCommandOpen(true)}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onProfileClick={() => handleProtectedAction(() => setCurrentPage('profile'))}
          onSettingsClick={() => handleProtectedAction(() => setCurrentPage('settings'))}
          onLogin={() => setShowLogin(true)}
        />
        
        <div className="flex flex-1 overflow-hidden">
          {!isSidebarCollapsed && (
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
                setSelectedEndDate(new Date().toISOString().split('T')[0]);
                setIsCreating(true);
                setSelectedEvent(null);
                setIsModalOpen(true);
              })}
              suggestedEvents={suggestedEvents}
              onSuggestedEventDrop={handleSuggestedEventDrop}
              isCollapsed={isSidebarCollapsed}
            />
          )}
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b bg-white dark:bg-gray-900 p-4 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    {isSidebarCollapsed ? (
                      <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant={currentPage === 'dashboard' ? "default" : "outline"}
                    onClick={() => setCurrentPage('dashboard')}
                    className="gap-2 rounded-lg"
                  >
                    <BarChart3 className="h-4 w-4" />
                    AI Dashboard
                  </Button>
                  <Button
                    variant={currentPage === 'calendar' ? "default" : "outline"}
                    onClick={() => setCurrentPage('calendar')}
                    className="gap-2 rounded-lg"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Calendar
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                        <Settings className="h-4 w-4" />
                        Layout
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 rounded-lg">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">Adjust Container Width</h4>
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-600 dark:text-gray-400">
                            Width: {containerWidth[0]}%
                          </Label>
                          <Slider
                            value={containerWidth}
                            onValueChange={setContainerWidth}
                            max={100}
                            min={50}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex justify-center">
              <div 
                className="transition-all duration-300"
                style={{ 
                  width: `${containerWidth[0]}%`,
                  maxWidth: '100%'
                }}
              >
                {renderCurrentPage()}
              </div>
            </div>
          </div>
        </div>

        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          isCreating={isCreating}
          selectedDate={selectedDate}
          selectedEndDate={selectedEndDate}
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
            setSelectedEndDate(new Date().toISOString().split('T')[0]);
            setIsCreating(true);
            setSelectedEvent(null);
            setIsModalOpen(true);
            setIsCommandOpen(false);
          })}
          onProfileClick={() => handleProtectedAction(() => setCurrentPage('profile'))}
          onSettingsClick={() => handleProtectedAction(() => setCurrentPage('settings'))}
        />

        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      </div>
    </SidebarProvider>
  );
};
