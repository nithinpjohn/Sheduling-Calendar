import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Video, Zap, Bell, Palette, Globe, Shield, Mail, Calendar } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState({
    zoom: false,
    teams: false,
    meet: false,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    mobile: false,
    sound: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    compactView: false,
    autoSync: true,
    weekStart: 'monday',
  });

  const [mailIntegrations, setMailIntegrations] = useState({
    gmail: false,
    outlook: false,
  });

  const toggleIntegration = (service: keyof typeof integrations) => {
    setIntegrations(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const toggleNotification = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const togglePreference = (pref: keyof typeof preferences) => {
    if (pref === 'weekStart') return; // Handle separately
    setPreferences(prev => ({
      ...prev,
      [pref]: !prev[pref]
    }));
  };

  const toggleMailIntegration = (service: keyof typeof mailIntegrations) => {
    setMailIntegrations(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and integrations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Video Conference Integrations
          </CardTitle>
          <CardDescription>
            Connect your favorite video conferencing tools to automatically add meeting links to events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Video className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Zoom</p>
                <p className="text-sm text-muted-foreground">Create Zoom meetings automatically</p>
              </div>
            </div>
            <Switch
              checked={integrations.zoom}
              onCheckedChange={() => toggleIntegration('zoom')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Microsoft Teams</p>
                <p className="text-sm text-muted-foreground">Integration with Teams meetings</p>
              </div>
            </div>
            <Switch
              checked={integrations.teams}
              onCheckedChange={() => toggleIntegration('teams')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Video className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Google Meet</p>
                <p className="text-sm text-muted-foreground">Add Google Meet links to events</p>
              </div>
            </div>
            <Switch
              checked={integrations.meet}
              onCheckedChange={() => toggleIntegration('meet')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Integrations
          </CardTitle>
          <CardDescription>
            Connect your email accounts to view important emails in your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium">Gmail</p>
                <p className="text-sm text-muted-foreground">Access your Gmail inbox</p>
              </div>
            </div>
            <Switch
              checked={mailIntegrations.gmail}
              onCheckedChange={() => toggleMailIntegration('gmail')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Microsoft Outlook</p>
                <p className="text-sm text-muted-foreground">Access your Outlook inbox</p>
              </div>
            </div>
            <Switch
              checked={mailIntegrations.outlook}
              onCheckedChange={() => toggleMailIntegration('outlook')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications about events and updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email reminders for events</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={() => toggleNotification('email')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Desktop Notifications</p>
              <p className="text-sm text-muted-foreground">Show browser notifications</p>
            </div>
            <Switch
              checked={notifications.desktop}
              onCheckedChange={() => toggleNotification('desktop')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mobile Push Notifications</p>
              <p className="text-sm text-muted-foreground">Receive push notifications on mobile</p>
            </div>
            <Switch
              checked={notifications.mobile}
              onCheckedChange={() => toggleNotification('mobile')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sound Alerts</p>
              <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
            </div>
            <Switch
              checked={notifications.sound}
              onCheckedChange={() => toggleNotification('sound')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance & Preferences
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your calendar application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
            </div>
            <Switch
              checked={preferences.darkMode}
              onCheckedChange={() => togglePreference('darkMode')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact View</p>
              <p className="text-sm text-muted-foreground">Show more events in calendar view</p>
            </div>
            <Switch
              checked={preferences.compactView}
              onCheckedChange={() => togglePreference('compactView')}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-sync Calendar</p>
              <p className="text-sm text-muted-foreground">Automatically sync with external calendars</p>
            </div>
            <Switch
              checked={preferences.autoSync}
              onCheckedChange={() => togglePreference('autoSync')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Manage your privacy settings and account security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Two-Factor Authentication</Button>
            <Button variant="outline">Privacy Settings</Button>
            <Button variant="outline">Download Data</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};
