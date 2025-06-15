import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Mail, Star, Archive, Trash2, Reply, Forward, MoreHorizontal, Paperclip, StarIcon } from 'lucide-react';
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
  hasAttachment?: boolean;
  fullDate: string;
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
    provider: 'gmail',
    hasAttachment: true,
    fullDate: 'December 15, 2024 • 2:30 PM'
  },
  {
    id: '2',
    sender: 'Sarah Wilson',
    subject: 'Meeting Reschedule Request',
    preview: 'Hi, I need to reschedule our meeting tomorrow due to...',
    time: '3 days ago',
    unread: true,
    starred: true,
    provider: 'outlook',
    hasAttachment: false,
    fullDate: 'December 12, 2024 • 10:15 AM'
  },
  {
    id: '3',
    sender: 'Team Calendar',
    subject: 'Weekly Team Sync - Tomorrow 10 AM',
    preview: 'Reminder: Our weekly team sync is scheduled for tomorrow...',
    time: '1 week ago',
    unread: false,
    starred: false,
    provider: 'gmail',
    hasAttachment: false,
    fullDate: 'December 8, 2024 • 9:00 AM'
  },
  {
    id: '4',
    sender: 'HR Department',
    subject: 'New Policy Updates',
    preview: 'Please review the updated company policies attached...',
    time: '2 weeks ago',
    unread: false,
    starred: true,
    provider: 'outlook',
    hasAttachment: true,
    fullDate: 'December 1, 2024 • 4:45 PM'
  }
];

export const MailInbox: React.FC = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredEmailId, setHoveredEmailId] = useState<string | null>(null);

  const filteredEmails = sampleEmails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.sender.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && email.provider === activeTab;
  });

  const handleStarToggle = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle star toggle logic here
    console.log('Toggle star for:', emailId);
  };

  const handleArchive = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Archive:', emailId);
  };

  const handleDelete = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Delete:', emailId);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-semibold mb-1">Mail</h1>
      </div>

      <div className="flex-1 flex">
        {/* Email List */}
        <div className="w-80 border-r bg-white dark:bg-gray-900">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-4 py-2">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
                <TabsTrigger value="outlook" className="text-sm">Outlook</TabsTrigger>
                <TabsTrigger value="gmail" className="text-sm">Gmail</TabsTrigger>
              </TabsList>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search emails..."
                  className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`relative p-4 border-b cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 group ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                    } ${email.unread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    onClick={() => setSelectedEmail(email)}
                    onMouseEnter={() => setHoveredEmailId(email.id)}
                    onMouseLeave={() => setHoveredEmailId(null)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {email.sender.charAt(0)}
                      </div>

                      {/* Email Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm truncate ${email.unread ? 'font-semibold text-gray-900 dark:text-white' : 'font-normal text-gray-700 dark:text-gray-300'}`}>
                            {email.sender}
                          </p>
                          <div className="flex items-center gap-2 ml-2">
                            {/* Time Pill */}
                            <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 whitespace-nowrap">
                              {email.time}
                            </Badge>
                            
                            {/* Hover Actions */}
                            {hoveredEmailId === email.id && (
                              <div className="flex items-center gap-1 opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                                  onClick={(e) => handleArchive(email.id, e)}
                                >
                                  <Archive className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                                  onClick={(e) => handleDelete(email.id, e)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                                    <DropdownMenuItem>Move to folder</DropdownMenuItem>
                                    <DropdownMenuItem>Block sender</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                            
                            {/* Star (always visible if starred) */}
                            {(email.starred || hoveredEmailId === email.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                                onClick={(e) => handleStarToggle(email.id, e)}
                              >
                                <Star className={`h-3 w-3 ${email.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-sm mb-1 ${email.unread ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {email.subject}
                        </p>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {email.preview}
                        </p>

                        {/* Bottom row with attachment indicator and provider badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {email.hasAttachment && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Paperclip className="h-3 w-3" />
                                <span>Attachment</span>
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant={email.provider === 'gmail' ? 'destructive' : 'default'} 
                            className="text-xs"
                          >
                            {email.provider === 'gmail' ? 'Gmail' : 'Outlook'}
                          </Badge>
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {email.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Email Content */}
        <div className="flex-1 bg-white dark:bg-gray-900">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              {/* Email Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {selectedEmail.sender.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-1">{selectedEmail.subject}</h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">{selectedEmail.sender}</span>
                        <span>•</span>
                        <span>{selectedEmail.fullDate}</span>
                      </div>
                    </div>
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
                      <DropdownMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                        <DropdownMenuItem>Move to folder</DropdownMenuItem>
                        <DropdownMenuItem>Block sender</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  <p className="mb-4">Dear John Doe,</p>
                  <p className="mb-4">{selectedEmail.preview}</p>
                  <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                  <p className="mb-4">Best regards,<br />{selectedEmail.sender}</p>
                  
                  {selectedEmail.hasAttachment && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        Attachments
                      </h4>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded border">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center">
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">PDF</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Permission 1.pdf</p>
                            <p className="text-xs text-muted-foreground">2.4 MB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded border">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center">
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">PDF</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Permission 2.pdf</p>
                            <p className="text-xs text-muted-foreground">1.8 MB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reply/Forward Actions */}
              <div className="p-6 border-t bg-gray-50 dark:bg-gray-800">
                <div className="flex gap-2">
                  <Button className="gap-2">
                    <Reply className="h-4 w-4" />
                    Reply
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Forward className="h-4 w-4" />
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
