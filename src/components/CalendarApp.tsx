
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

// ... keep existing code (interfaces and types)

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

// ... keep existing code (suggestedEvents and defaultCategories)

export const CalendarApp: React.FC = () => {
  // ... keep existing code (state declarations)

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

  // ... keep existing code (other useEffects and functions)

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
                // ... keep existing code (drop handler)
              }}
              eventReceive={(info) => {
                console.log('Event receive triggered:', info);
                // Additional handler for external events
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // ... keep existing code (rest of the component)
};
