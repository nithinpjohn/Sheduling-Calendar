
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Monitor, Zap, Video } from 'lucide-react';

interface VideoConferenceFormProps {
  value: {
    platform: string;
    link: string;
    autoGenerate: boolean;
  };
  onChange: (value: { platform: string; link: string; autoGenerate: boolean }) => void;
}

const platforms = [
  { id: 'zoom', name: 'Zoom', icon: Monitor },
  { id: 'teams', name: 'Microsoft Teams', icon: Monitor },
  { id: 'meet', name: 'Google Meet', icon: Video },
  { id: 'webex', name: 'Cisco Webex', icon: Zap },
];

export const VideoConferenceForm: React.FC<VideoConferenceFormProps> = ({ value, onChange }) => {
  const generateMeetingLink = (platform: string) => {
    const meetingId = Math.random().toString(36).substring(2, 15);
    switch (platform) {
      case 'zoom':
        return `https://zoom.us/j/${meetingId}`;
      case 'teams':
        return `https://teams.microsoft.com/l/meetup-join/${meetingId}`;
      case 'meet':
        return `https://meet.google.com/${meetingId}`;
      case 'webex':
        return `https://meet.webex.com/${meetingId}`;
      default:
        return '';
    }
  };

  const handlePlatformChange = (platform: string) => {
    const newLink = value.autoGenerate ? generateMeetingLink(platform) : value.link;
    onChange({ ...value, platform, link: newLink });
  };

  const handleAutoGenerateChange = (autoGenerate: boolean) => {
    const newLink = autoGenerate ? generateMeetingLink(value.platform) : value.link;
    onChange({ ...value, autoGenerate, link: newLink });
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

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoGenerate"
          checked={value.autoGenerate}
          onChange={(e) => handleAutoGenerateChange(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="autoGenerate" className="text-sm">
          Auto-generate meeting link
        </Label>
      </div>

      <div>
        <Label htmlFor="meetingLink" className="text-sm font-medium">Meeting Link</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="meetingLink"
            value={value.link}
            onChange={(e) => onChange({ ...value, link: e.target.value })}
            placeholder="Enter meeting link or auto-generate"
            disabled={value.autoGenerate}
          />
          {!value.autoGenerate && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange({ ...value, link: generateMeetingLink(value.platform) })}
            >
              Generate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
