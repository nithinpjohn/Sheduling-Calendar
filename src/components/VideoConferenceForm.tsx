
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Monitor, Zap, Video } from 'lucide-react';

interface VideoConferenceFormProps {
  value: {
    platform: 'zoom' | 'teams' | 'meet';
    url: string;
    meetingId?: string;
  };
  onChange: (value: { platform: 'zoom' | 'teams' | 'meet'; url: string; meetingId?: string }) => void;
}

const platforms = [
  { id: 'zoom', name: 'Zoom', icon: Monitor },
  { id: 'teams', name: 'Microsoft Teams', icon: Monitor },
  { id: 'meet', name: 'Google Meet', icon: Video },
];

export const VideoConferenceForm: React.FC<VideoConferenceFormProps> = ({ value, onChange }) => {
  const generateMeetingLink = (platform: 'zoom' | 'teams' | 'meet') => {
    const meetingId = Math.random().toString(36).substring(2, 15);
    switch (platform) {
      case 'zoom':
        return `https://zoom.us/j/${meetingId}`;
      case 'teams':
        return `https://teams.microsoft.com/l/meetup-join/${meetingId}`;
      case 'meet':
        return `https://meet.google.com/${meetingId}`;
      default:
        return '';
    }
  };

  const handlePlatformChange = (platform: string) => {
    const typedPlatform = platform as 'zoom' | 'teams' | 'meet';
    onChange({ 
      platform: typedPlatform, 
      url: value.url,
      meetingId: value.meetingId 
    });
  };

  const handleGenerateLink = () => {
    const newLink = generateMeetingLink(value.platform);
    onChange({ ...value, url: newLink });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Video Conference Platform</Label>
        <RadioGroup value={value.platform} onValueChange={handlePlatformChange} className="grid grid-cols-2 gap-4 mt-2">
          {platforms.map((platform) => (
            <div key={platform.id} className="flex items-center space-x-2">
              <RadioGroupItem value={platform.id} id={platform.id} />
              <Label htmlFor={platform.id} className="flex items-center gap-2 cursor-pointer">
                <platform.icon className="h-4 w-4" />
                {platform.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="meetingLink" className="text-sm font-medium">Meeting Link</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="meetingLink"
            value={value.url}
            onChange={(e) => onChange({ ...value, url: e.target.value })}
            placeholder="Enter meeting link or generate one"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateLink}
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
};
