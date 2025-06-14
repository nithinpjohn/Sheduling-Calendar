
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, User, Mail } from 'lucide-react';

interface Attendee {
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  name?: string;
}

interface AttendeeManagerProps {
  attendees: Attendee[];
  onChange: (attendees: Attendee[]) => void;
}

export const AttendeeManager: React.FC<AttendeeManagerProps> = ({ attendees, onChange }) => {
  const [newEmail, setNewEmail] = useState('');

  const addAttendee = () => {
    if (newEmail && !attendees.find(a => a.email === newEmail)) {
      const newAttendee: Attendee = {
        email: newEmail,
        status: 'pending',
        name: newEmail.split('@')[0]
      };
      onChange([...attendees, newAttendee]);
      setNewEmail('');
    }
  };

  const removeAttendee = (email: string) => {
    onChange(attendees.filter(a => a.email !== email));
  };

  const updateStatus = (email: string, status: Attendee['status']) => {
    onChange(attendees.map(a => 
      a.email === email ? { ...a, status } : a
    ));
  };

  const getStatusColor = (status: Attendee['status']) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Attendees</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter email address"
            onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
          />
          <Button type="button" onClick={addAttendee} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {attendees.length > 0 && (
        <div className="space-y-2">
          {attendees.map((attendee) => (
            <div key={attendee.email} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">{attendee.name || attendee.email}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {attendee.email}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getStatusColor(attendee.status)}`}>
                  {attendee.status}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttendee(attendee.email)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
