
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
import { MailInbox } from './MailInbox';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CalendarIcon, BarChart3, PanelLeftClose, PanelLeftOpen, Settings, Mail } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  attendees?: number;
  category?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    start: '2025-05-05T10:00:00',
    end: '2025-05-05T11:00:00',
    description: 'Weekly team sync meeting',
    location: 'Conference Room A',
    attendees: 8,
    category: '1'
  },
  {
    id: '2',
    title: 'Client Presentation',
    start: '2025-05-12T14:00:00',
    end: '2025-05-12T15:30:00',
    description: 'Quarterly presentation to client',
    location: 'Main Conference Room',
    attendees: 12,
    category: '4'
  },
  {
    id: '3',
    title: 'Doctor Appointment',
    start: '2025-05-18T09:00:00',
    end: '2025-05-18T10:00:00',
    description: 'Annual checkup',
    location: 'Medical Center',
    attendees: 2,
    category: '2'
  },
  {
    id: '4',
    title: 'React Workshop',
    start: '2025-05-25T13:00:00',
    end: '2025-05-25T17:00:00',
    description: 'Advanced React patterns workshop',
    location: 'Training Room B',
    attendees: 15,
    category: '3'
  },
  {
    id: '5',
    title: 'Vacation Day',
    start: '2025-06-02T00:00:00',
    end: '2025-06-02T23:59:59',
    description: 'Personal time off',
    location: 'Home',
    attendees: 1,
    category: '5'
  },
  {
    id: '6',
    title: 'Project Planning',
    start: '2025-06-08T15:00:00',
    end: '2025-06-08T16:30:00',
    description: 'Q1 project planning session',
    location: 'Planning Room',
    attendees: 6,
    category: '1'
  },
  {
    id: '7',
    title: 'Design Review Session',
    start: '2025-06-15T11:00:00',
    end: '2025-06-15T12:30:00',
    description: 'Review new UI/UX designs for mobile app',
    location: 'Design Studio',
    attendees: 5,
    category: '1'
  },
  {
    id: '8',
    title: 'Dentist Appointment',
    start: '2025-06-20T16:00:00',
    end: '2025-06-20T17:00:00',
    description: 'Routine dental cleaning',
    location: 'Downtown Dental Clinic',
    attendees: 2,
    category: '2'
  },
  {
    id: '9',
    title: 'JavaScript Masterclass',
    start: '2025-06-25T09:00:00',
    end: '2025-06-25T16:00:00',
    description: 'Full-day intensive JavaScript training workshop',
    location: 'Tech Hub Auditorium',
    attendees: 25,
    category: '3'
  },
  {
    id: '10',
    title: 'Tech Conference 2025',
    start: '2025-06-28T08:00:00',
    end: '2025-06-28T18:00:00',
    description: 'Annual technology conference with keynote speakers',
    location: 'Convention Center',
    attendees: 500,
    category: '4'
  },
  {
    id: '11',
    title: 'Family BBQ',
    start: '2025-06-30T17:00:00',
    end: '2025-06-30T21:00:00',
    description: 'Weekend family gathering and barbecue',
    location: 'Backyard',
    attendees: 12,
    category: '5'
  }
];

const suggestedEvents: CalendarEvent[] = [
  {
    id: 'suggested-1',
    title: 'Daily Standup',
    start: '2025-05-06T09:00:00',
    end: '2025-05-06T09:30:00',
    description: 'Daily team standup meeting',
    location: 'Virtual',
    attendees: 5,
    category: '1'
  }
];

const defaultCategories: Category[] = [
  { id: '1', name: 'Work', color: '#3B82F6' },
  { id: '2', name: 'Personal', color: '#EF4444' },
  { id: '3', name: 'Education', color: '#10B981' },
  { id: '4', name: 'Business', color: '#F59E0B' },
  { id: '5', name: 'Social', color: '#8B5CF6' }
];

export const CalendarApp: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>('dayGridMonth');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMail, setShowMail] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState([14]);
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

    // Navigate to May 2025 when component mounts
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate('2025-05-01');
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  // Save categories to localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem('calendar-categories', JSON.stringify(categories));
  }, [categories]);

  const calendarEvents = events.map(event => ({
    ...event,
    backgroundColor: categories.find(cat => cat.id === event.category)?.color || '#3B82F6',
    borderColor: categories.find(cat => cat.id === event.category)?.color || '#3B82F6',
  }));

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setSelectedEvent(null);
    setIsNewEvent(true);
    setIsEventModalOpen(true);
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.startStr);
    setSelectedEvent(null);
    setIsNewEvent(true);
    setIsEventModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setIsNewEvent(false);
      setIsEventModalOpen(true);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    const eventId = dropInfo.event.id;
    const newStart = dropInfo.event.start.toISOString();
    const newEnd = dropInfo.event.end ? dropInfo.event.end.toISOString() : newStart;

    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, start: newStart, end: newEnd }
        : event
    ));

    toast({
      title: "Event Updated",
      description: "Event has been moved successfully.",
    });
  };

  const handleEventResize = (resizeInfo: any) => {
    const eventId = resizeInfo.event.id;
    const newStart = resizeInfo.event.start.toISOString();
    const newEnd = resizeInfo.event.end ? resizeInfo.event.end.toISOString() : newStart;

    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, start: newStart, end: newEnd }
        : event
    ));

    toast({
      title: "Event Updated",
      description: "Event duration has been updated successfully.",
    });
  };

  const handleSaveEvent = (eventData: CalendarEvent) => {
    if (isNewEvent) {
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
      };
      setEvents(prev => [...prev, newEvent]);
      toast({
        title: "Event Created",
        description: "New event has been added to your calendar.",
      });
    } else {
      setEvents(prev => prev.map(event => 
        event.id === eventData.id ? eventData : event
      ));
      toast({
        title: "Event Updated",
        description: "Event has been updated successfully.",
      });
    }
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    setIsEventModalOpen(false);
    setSelectedEvent(null);
    toast({
      title: "Event Deleted",
      description: "Event has been removed from your calendar.",
    });
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current && view !== 'gantt') {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
    }
  };

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
    setShowLogin(false);
    toast({
      title: "Welcome!",
      description: `Successfully logged in as ${user}`,
    });
  };

  const handleLogout = () => {
    setUsername('');
    setIsLoggedIn(false);
    setShowProfile(false);
    toast({
      title: "Goodbye!",
      description: "Successfully logged out",
    });
  };

  const renderCalendarView = () => {
    if (currentView === 'gantt') {
      return (
        <GanttView 
          events={calendarEvents} 
          categories={categories} 
          currentView={currentView}
          onViewChange={handleViewChange}
        />
      );
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
              initialDate="2025-05-01"
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
                console.log('Drop event triggered:', info);
                const eventData = JSON.parse(info.draggedEl.dataset.event || '{}');
                if (eventData.title) {
                  const newEvent: CalendarEvent = {
                    id: Date.now().toString(),
                    title: eventData.title,
                    start: info.date.toISOString(),
                    end: new Date(info.date.getTime() + 60 * 60 * 1000).toISOString(),
                    description: eventData.description || '',
                    location: eventData.location || '',
                    attendees: eventData.attendees || 1,
                    category: eventData.category || '1'
                  };
                  setEvents(prev => [...prev, newEvent]);
                  toast({
                    title: "Event Added",
                    description: `${eventData.title} has been added to your calendar.`,
                  });
                }
              }}
              eventReceive={(info) => {
                console.log('Event receive triggered:', info);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (showSummary) {
    return (
      <SummaryPage
        events={events}
        categories={categories}
        onBack={() => setShowSummary(false)}
      />
    );
  }

  if (showProfile) {
    return (
      <ProfilePage
        username={username}
        onBack={() => setShowProfile(false)}
        onLogout={handleLogout}
      />
    );
  }

  if (showSettings) {
    return (
      <SettingsPage
        onBack={() => setShowSettings(false)}
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
        fontSize={fontSize[0]}
        onFontSizeChange={(size) => setFontSize([size])}
      />
    );
  }

  if (showMail) {
    return (
      <MailInbox
        onBack={() => setShowMail(false)}
      />
    );
  }

  return (
    <SidebarProvider>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900" style={{ fontSize: `${fontSize[0]}px` }}>
          <CalendarSidebar
            categories={categories}
            onCategoryChange={setCategories}
            suggestedEvents={suggestedEvents}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopMenuBar
              onShowSummary={() => setShowSummary(true)}
              onShowSearch={() => setShowSearch(true)}
              onShowLogin={() => setShowLogin(true)}
              onShowProfile={() => setShowProfile(true)}
              onShowSettings={() => setShowSettings(true)}
              onShowMail={() => setShowMail(true)}
              isLoggedIn={isLoggedIn}
              username={username}
              onLogout={handleLogout}
            />
            
            <main className="flex-1 overflow-auto p-6">
              {renderCalendarView()}
            </main>
          </div>
        </div>

        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          event={selectedEvent}
          selectedDate={selectedDate}
          categories={categories}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          isNewEvent={isNewEvent}
        />

        <CommandSearch
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          events={events}
          categories={categories}
          onEventSelect={(event) => {
            setSelectedEvent(event);
            setIsNewEvent(false);
            setIsEventModalOpen(true);
            setShowSearch(false);
          }}
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
