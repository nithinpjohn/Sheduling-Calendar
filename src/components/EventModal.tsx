
import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventCategory } from './CalendarApp';
import { VideoConferenceForm } from './VideoConferenceForm';
import { AttendeeManager } from './AttendeeManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, MapPin, Users, Trash2, Save, Video, Mail } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  isCreating: boolean;
  selectedDate: string;
  selectedEndDate?: string;
  categories: EventCategory[];
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete: (eventId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  isCreating,
  selectedDate,
  selectedEndDate,
  categories,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    attendees: '',
    category: '',
    startDate: new Date(),
    startTime: '',
    endDate: new Date(),
    endTime: '',
  });
  
  const [videoConference, setVideoConference] = useState({
    platform: 'zoom',
    link: '',
    autoGenerate: true,
  });
  
  const [attendeeList, setAttendeeList] = useState<Array<{
    email: string;
    status: 'pending' | 'accepted' | 'declined';
    name?: string;
  }>>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (isCreating) {
        const startDate = selectedDate ? new Date(selectedDate) : new Date();
        const endDate = selectedEndDate ? new Date(selectedEndDate) : startDate;
        
        setFormData({
          title: '',
          description: '',
          location: '',
          attendees: '',
          category: categories[0]?.id || '',
          startDate,
          startTime: '09:00',
          endDate,
          endTime: selectedEndDate && selectedEndDate !== selectedDate ? '17:00' : '10:00',
        });
        
        setVideoConference({
          platform: 'zoom',
          link: '',
          autoGenerate: true,
        });
        
        setAttendeeList([]);
      } else if (event) {
        const startDate = new Date(event.start);
        const endDate = event.end ? new Date(event.end) : startDate;
        
        setFormData({
          title: event.title,
          description: event.description || '',
          location: event.location || '',
          attendees: event.attendees?.toString() || '',
          category: event.category,
          startDate,
          startTime: format(startDate, 'HH:mm'),
          endDate,
          endTime: format(endDate, 'HH:mm'),
        });
        
        setVideoConference(event.videoConference || {
          platform: 'zoom',
          link: '',
          autoGenerate: true,
        });
        
        setAttendeeList(event.attendeeList || []);
      }
      setErrors({});
    }
  }, [isOpen, isCreating, event, selectedDate, selectedEndDate, categories]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    const startDateTime = new Date(`${format(formData.startDate, 'yyyy-MM-dd')}T${formData.startTime}`);
    const endDateTime = new Date(`${format(formData.endDate, 'yyyy-MM-dd')}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (formData.attendees && (isNaN(Number(formData.attendees)) || Number(formData.attendees) < 0)) {
      newErrors.attendees = 'Please enter a valid number of attendees';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const startDateTime = new Date(`${format(formData.startDate, 'yyyy-MM-dd')}T${formData.startTime}`);
    const endDateTime = new Date(`${format(formData.endDate, 'yyyy-MM-dd')}T${formData.endTime}`);

    const eventData: Omit<CalendarEvent, 'id'> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      location: formData.location.trim() || undefined,
      attendees: formData.attendees ? Number(formData.attendees) : undefined,
      category: formData.category,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      videoConference: videoConference.link ? videoConference : undefined,
      attendeeList: attendeeList.length > 0 ? attendeeList : undefined,
    };

    onSave(eventData);
  };

  const handleDelete = () => {
    if (event && !isCreating) {
      onDelete(event.id);
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.category);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreating ? 'Create New Event' : 'Edit Event'}
            {selectedCategory && (
              <Badge
                variant="secondary"
                className="ml-2"
                style={{ backgroundColor: `${selectedCategory.color}20`, color: selectedCategory.color }}
              >
                {selectedCategory.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Event Details</TabsTrigger>
              <TabsTrigger value="video">Video Conference</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit}>
              <TabsContent value="details" className="space-y-4 p-1">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter event title"
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Attendees
                      </Label>
                      <Input
                        type="number"
                        value={formData.attendees}
                        onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                        placeholder="Number of attendees"
                        min="0"
                        className={errors.attendees ? 'border-destructive' : ''}
                      />
                      {errors.attendees && <p className="text-sm text-destructive">{errors.attendees}</p>}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date & Time *</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal",
                                !formData.startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.startDate}
                              onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            className={`pl-10 w-32 ${errors.startTime ? 'border-destructive' : ''}`}
                          />
                        </div>
                      </div>
                      {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>End Date & Time *</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal",
                                !formData.endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.endDate}
                              onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            className={`pl-10 w-32 ${errors.endTime ? 'border-destructive' : ''}`}
                          />
                        </div>
                      </div>
                      {errors.endTime && <p className="text-sm text-destructive">{errors.endTime}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter event location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter event description"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="video" className="space-y-4 p-1">
                <VideoConferenceForm
                  value={videoConference}
                  onChange={setVideoConference}
                />
              </TabsContent>

              <TabsContent value="attendees" className="space-y-4 p-1">
                <AttendeeManager
                  attendees={attendeeList}
                  onChange={setAttendeeList}
                />
              </TabsContent>

              <div className="flex justify-between pt-4 border-t">
                <div>
                  {!isCreating && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Event
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    {isCreating ? 'Create Event' : 'Update Event'}
                  </Button>
                </div>
              </div>
            </form>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
