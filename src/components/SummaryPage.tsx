
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, TrendingUp, Plus, Search, Shuffle, Crown, Mail, Star } from 'lucide-react';
import { CalendarEvent, EventCategory, SuggestedEvent } from './CalendarApp';
import { WeeklyBarChart } from './WeeklyBarChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

export interface SummaryPageProps {
  events: CalendarEvent[];
  categories: EventCategory[];
  onEventClick: (event: CalendarEvent) => void;
  onCreateNew: () => void;
  onOpenCommandSearch: () => void;
  suggestedEvents: SuggestedEvent[];
  onSuggestedEventDrop: (event: SuggestedEvent, date: Date) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  setCategories: (categories: EventCategory[]) => void;
}

interface CardData {
  id: string;
  type: 'events-overview' | 'quick-stats' | 'weekly-activity' | 'important-mails' | 'upcoming-events' | 'recent-activity';
  title: string;
}

const defaultCards: CardData[] = [
  { id: 'events-overview', type: 'events-overview', title: 'Events Overview' },
  { id: 'quick-stats', type: 'quick-stats', title: 'Quick Stats' },
  { id: 'weekly-activity', type: 'weekly-activity', title: 'Weekly Activity' },
  { id: 'important-mails', type: 'important-mails', title: 'Important Mails' },
  { id: 'upcoming-events', type: 'upcoming-events', title: 'Upcoming Events' },
  { id: 'recent-activity', type: 'recent-activity', title: 'Recent Activity' },
];

const importantMails = [
  {
    id: '1',
    sender: 'John Doe',
    subject: 'Project Update - Q4 Review',
    time: '2 hours ago',
    provider: 'gmail' as const,
    starred: true,
  },
  {
    id: '2',
    sender: 'Sarah Wilson',
    subject: 'Meeting Reschedule Request',
    time: '4 hours ago',
    provider: 'outlook' as const,
    starred: false,
  },
  {
    id: '3',
    sender: 'Team Calendar',
    subject: 'Weekly Team Sync - Tomorrow',
    time: '1 day ago',
    provider: 'gmail' as const,
    starred: true,
  },
];

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
}

function DraggableCard({ id, children }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : (transition || 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)'),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="touch-none"
    >
      {children}
    </div>
  );
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
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const [cards, setCards] = useState<CardData[]>([]);

  useEffect(() => {
    const storedCardOrder = localStorage.getItem('cardOrder');
    const initialCardOrder = storedCardOrder ? JSON.parse(storedCardOrder) : defaultCards.map(card => card.id);
    setCardOrder(initialCardOrder);

    const storedCards = localStorage.getItem('cards');
    const initialCards = storedCards ? JSON.parse(storedCards) : defaultCards;
    setCards(initialCards);
  }, []);

  useEffect(() => {
    localStorage.setItem('cardOrder', JSON.stringify(cardOrder));
  }, [cardOrder]);

  useEffect(() => {
    localStorage.setItem('cards', JSON.stringify(cards));
  }, [cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!activeId) return;

    const overId = event.over?.id;

    if (overId && overId !== activeId) {
      const activeIndex = cardOrder.indexOf(activeId);
      const overIndex = cardOrder.indexOf(overId as string);

      if (activeIndex !== -1 && overIndex !== -1) {
        setCardOrder(arrayMove(cardOrder, activeIndex, overIndex));
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setIsDragging(false);

    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = cardOrder.indexOf(active.id as string);
      const newIndex = cardOrder.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        setCardOrder(arrayMove(cardOrder, oldIndex, newIndex));
        toast({
          title: "Dashboard Updated",
          description: "Your dashboard layout has been updated.",
        });
      }
    }
  };

  const findCard = (id: string) => {
    return cards.find(card => card.id === id);
  };

  const shuffleSuggestedEvents = () => {
    // Implement shuffle logic here
  };

  const renderCard = (card: CardData) => {
    switch (card.type) {
      case 'events-overview':
        return (
          <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                  Events Overview
                </CardTitle>
              </div>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Manage and track your upcoming events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {events.length}
                </div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">Total Events</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-green-600">
                    {events.filter(e => new Date(e.start) > new Date()).length}
                  </div>
                  <p className="text-muted-foreground">Upcoming</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-orange-600">
                    {events.filter(e => {
                      const eventDate = new Date(e.start);
                      const today = new Date();
                      return eventDate.toDateString() === today.toDateString();
                    }).length}
                  </div>
                  <p className="text-muted-foreground">Today</p>
                </div>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                onClick={onCreateNew}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Event
              </Button>
            </CardContent>
          </Card>
        );

      case 'quick-stats':
        return (
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </div>
              <CardDescription>Your calendar stats at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-muted-foreground">Meetings</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-muted-foreground">Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'weekly-activity':
        return (
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Weekly Activity
                </CardTitle>
              </div>
              <CardDescription>Your calendar activity this week</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyBarChart events={events} />
            </CardContent>
          </Card>
        );

      case 'important-mails':
        return (
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Important Mails</CardTitle>
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              </div>
              <CardDescription>Recent important emails from your connected accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="gmail">Gmail</TabsTrigger>
                  <TabsTrigger value="outlook">Outlook</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4 space-y-3">
                  {importantMails.map((mail) => (
                    <div key={mail.id} className="p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{mail.sender}</p>
                            <Badge variant={mail.provider === 'gmail' ? 'destructive' : 'default'} className="text-xs">
                              {mail.provider}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">{mail.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">{mail.time}</p>
                        </div>
                        {mail.starred && <Star className="h-4 w-4 text-yellow-500 fill-current ml-2" />}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="gmail" className="mt-4 space-y-3">
                  {importantMails.filter(mail => mail.provider === 'gmail').map((mail) => (
                    <div key={mail.id} className="p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{mail.sender}</p>
                          <p className="text-sm text-muted-foreground truncate mt-1">{mail.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">{mail.time}</p>
                        </div>
                        {mail.starred && <Star className="h-4 w-4 text-yellow-500 fill-current ml-2" />}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="outlook" className="mt-4 space-y-3">
                  {importantMails.filter(mail => mail.provider === 'outlook').map((mail) => (
                    <div key={mail.id} className="p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{mail.sender}</p>
                          <p className="text-sm text-muted-foreground truncate mt-1">{mail.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">{mail.time}</p>
                        </div>
                        {mail.starred && <Star className="h-4 w-4 text-yellow-500 fill-current ml-2" />}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        );

      case 'upcoming-events':
        return (
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </div>
              <CardDescription>Your next events and meetings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.slice(0, 3).map(event => (
                <div key={event.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => onEventClick(event)}>
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge className="opacity-75">{categories.find(c => c.id === event.category)?.name}</Badge>
                </div>
              ))}
              <Button variant="secondary" onClick={onOpenCommandSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search Events
              </Button>
            </CardContent>
          </Card>
        );

      case 'recent-activity':
        return (
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </div>
              <CardDescription>Your latest calendar activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-sm">Created "Team Meeting"</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <div>
                <p className="font-medium text-sm">Updated "Client Presentation"</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const handleSuggestedEventDropWrapper = (event: SuggestedEvent, date: Date) => {
    onSuggestedEventDrop(event, date);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Dashboard</h1>
          <p className="text-muted-foreground">Get insights and manage your calendar efficiently</p>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <DndContext
              id="dnd-context"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToWindowEdges]}
            >
              <SortableContext
                id="sortable-context"
                items={cardOrder}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-250 ease-out">
                  {cardOrder.map(id => {
                    const card = findCard(id);
                    if (!card) return null;
                    return (
                      <DraggableCard key={id} id={id}>
                        {renderCard(card)}
                      </DraggableCard>
                    );
                  })}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeId && isDragging ? (
                  <div className="opacity-90 shadow-2xl scale-105 transition-transform">
                    {renderCard(findCard(activeId)!)}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>

          <div className="w-80 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={onCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Event
                </Button>
                <Button className="w-full" variant="outline" onClick={onOpenCommandSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Events (⌘K)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    AI Suggested Events
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={shuffleSuggestedEvents}
                    className="h-8 w-8 p-0 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
                    title="Shuffle suggestions"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-grab"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'suggested-event', data: event }));
                    }}
                    onDragEnd={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                    <Badge className="opacity-75">{categories.find(c => c.id === event.category)?.name}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge
                      key={category.id}
                      className={`cursor-pointer ${selectedCategories.includes(category.id) ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
                      style={{ backgroundColor: category.color, color: 'white' }}
                      onClick={() => {
                        if (selectedCategories.includes(category.id)) {
                          setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                        } else {
                          setSelectedCategories([...selectedCategories, category.id]);
                        }
                      }}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
