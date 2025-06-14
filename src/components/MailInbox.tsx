
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Mail, Star, Archive, Trash2, Reply, Forward, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  starred: boolean;
  provider: 'gmail' | 'outlook';
}

const sampleEmails: Email[] = [
  {
    id: '1',
    sender: 'John Doe',
    subject: 'Project Update - Q4 Review',
    preview: 'Here are the latest updates on our Q4 project milestones...',
    time: '2 hours ago',
    unread: true,
    starred: false,
    provider: 'gmail'
  },
  {
    id: '2',
    sender: 'Sarah Wilson',
    subject: 'Meeting Reschedule Request',
    preview: 'Hi, I need to reschedule our meeting tomorrow due to...',
    time: '4 hours ago',
    unread: true,
    starred: true,
    provider: 'outlook'
  },
  {
    id: '3',
    sender: 'Team Calendar',
    subject: 'Weekly Team Sync - Tomorrow 10 AM',
    preview: 'Reminder: Our weekly team sync is scheduled for tomorrow...',
    time: '1 day ago',
    unread: false,
    starred: false,
    provider: 'gmail'
  },
  {
    id: '4',
    sender: 'HR Department',
    subject: 'New Policy Updates',
    preview: 'Please review the updated company policies attached...',
    time: '2 days ago',
    unread: false,
    starred: true,
    provider: 'outlook'
  }
];

export const MailInbox: React.FC = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmails = sampleEmails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-3xl font-bold">My Mails</h1>
        <p className="text-muted-foreground">Manage your emails from Gmail and Outlook</p>
      </div>

      <div className="flex-1 flex">
        {/* Email List */}
        <div className="w-1/3 border-r">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search emails..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedEmail?.id === email.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                } ${email.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                onClick={() => setSelectedEmail(email)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${email.unread ? 'font-semibold' : 'font-normal'}`}>
                        {email.sender}
                      </p>
                      <Badge variant={email.provider === 'gmail' ? 'destructive' : 'default'} className="text-xs">
                        {email.provider}
                      </Badge>
                    </div>
                    <p className={`text-sm mt-1 ${email.unread ? 'font-medium' : 'text-muted-foreground'}`}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {email.preview}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{email.time}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {email.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    {email.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Email Content */}
        <div className="flex-1">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                    <p className="text-muted-foreground">{selectedEmail.sender} • {selectedEmail.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                        <DropdownMenuItem>Move to folder</DropdownMenuItem>
                        <DropdownMenuItem>Block sender</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6">
                <div className="prose max-w-none">
                  <p>{selectedEmail.preview}</p>
                  <br />
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                  <p>Best regards,<br />{selectedEmail.sender}</p>
                </div>
              </div>

              <div className="p-6 border-t">
                <div className="flex gap-2">
                  <Button>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline">
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Select an email to read</p>
                <p className="text-muted-foreground">Choose an email from the list to view its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
